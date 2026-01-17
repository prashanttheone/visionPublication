import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import { triggerOrderAutomation } from '@/lib/order-automation';

/**
 * GET /api/orders
 * List orders with role-based filtering
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let sql = `
      SELECT o.*, u.full_name as user_name, u.email, 
             ua.full_name as shipping_name, ua.contact_no as shipping_phone, 
             ua.address_line_1, ua.locality, ua.city, ua.state, ua.pincode, ua.country
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN user_addresses ua ON o.address_id = ua.id
    `;
    const params: any[] = [];

    // Role-based filtering
    if (user.role !== 'admin') {
      sql += ` WHERE o.user_id = $1`;
      params.push(user.id);
    }

    sql += ` ORDER BY o.created_at DESC`;

    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/orders
 * Create a new order (Checkout)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      address_id, 
      shippingAddress, // New field for one-off addresses
      items, 
      subtotal, 
      discount, 
      shipping_charge, 
      total_amount,
      payment_method,
      notes 
    } = body;

    // Basic Validation
    if ((!address_id && !shippingAddress) || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields (address or items)' }, { status: 400 });
    }

    let finalAddressId = address_id;

    // 0. If shippingAddress is provided, save it first
    if (shippingAddress && (!address_id || address_id === 1)) {
      if (shippingAddress.saveAsDefault) {
        // Unset previous default
        await query(`UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1`, [user.id]);
      }

      const addrResult = await query(`
        INSERT INTO user_addresses (
          user_id, full_name, contact_no, address_line_1, locality, city, state, pincode, country, is_default
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `, [
        user.id,
        shippingAddress.fullName,
        shippingAddress.phone || '0000000000',
        shippingAddress.address,
        shippingAddress.locality || shippingAddress.city,
        shippingAddress.city,
        shippingAddress.state,
        shippingAddress.pincode || shippingAddress.zipCode,
        shippingAddress.country || 'India',
        shippingAddress.saveAsDefault || false
      ]);
      finalAddressId = addrResult.rows[0].id;
    }

    // Generate Order Number
    const orderNumber = `VP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 1. Create the Order
    const orderResult = await query(`
      INSERT INTO orders (
        order_number, user_id, address_id, subtotal, discount, 
        shipping_charge, total_amount, payment_method, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, order_number
    `, [
      orderNumber, user.id, finalAddressId, subtotal, discount, 
      shipping_charge, total_amount, payment_method, notes
    ]);

    const orderId = orderResult.rows[0].id;

    // 2. Create Order Items
    for (const item of items) {
      await query(`
        INSERT INTO order_items (
          order_id, book_id, quantity, price, offer_price, sku
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        orderId, item.book_id, item.quantity, item.price, item.offer_price, item.sku
      ]);
    }

    // 3. Create Initial Status History
    await query(`
      INSERT INTO order_status_history (order_id, status, description, changed_by)
      VALUES ($1, 'pending', 'Order placed successfully', $2)
    `, [orderId, user.email]);

    // 4. Trigger Automation for COD
    if (payment_method === 'cod') {
      // Run in background to not block the response
      triggerOrderAutomation(orderId);
    }

    return NextResponse.json({ 
      success: true, 
      order_id: orderId, 
      order_number: orderNumber 
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
