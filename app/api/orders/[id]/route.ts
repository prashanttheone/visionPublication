import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

/**
 * GET /api/orders/[id]
 * Get order details with items and status history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // 1. Fetch Order with User and Address Info
    const orderResult = await query(`
      SELECT o.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
             ua.full_name as shipping_name, ua.contact_no, ua.address_line_1, ua.address_line_2,
             ua.locality, ua.city, ua.state, ua.pincode, ua.country
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN user_addresses ua ON o.address_id = ua.id
      WHERE o.id = $1
    `, [id]);

    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderResult.rows[0];

    // Ownership Check: Only admin or the user who placed the order can view it
    if (user.role !== 'admin' && order.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch Order Items with Book Details
    const itemsResult = await query(`
      SELECT oi.*, b.name as book_name, b.image_url, b.author
      FROM order_items oi
      JOIN books b ON oi.book_id = b.id
      WHERE oi.order_id = $1
    `, [id]);

    // 3. Fetch Status History
    const historyResult = await query(`
      SELECT * FROM order_status_history
      WHERE order_id = $1
      ORDER BY changed_at DESC
    `, [id]);

    return NextResponse.json({
      ...order,
      items: itemsResult.rows,
      status_history: historyResult.rows
    });

  } catch (error) {
    console.error('Failed to fetch order detail:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/orders/[id]
 * Update order status (Admin only for most status changes)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { 
      order_status, 
      payment_status, 
      tracking_id, 
      courier_name, 
      awb_number,
      shiprocket_order_id,
      description,
      metadata
    } = body;

    // Fetch existing order for validation
    const orderCheck = await query('SELECT id, user_id, order_status FROM orders WHERE id = $1', [id]);
    if (orderCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const existingOrder = orderCheck.rows[0];

    // Role-based validation
    if (user.role !== 'admin') {
      // Users can only cancel their own order if it's still pending
      if (order_status === 'cancelled') {
        if (existingOrder.user_id !== user.id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        if (existingOrder.order_status !== 'pending') {
          return NextResponse.json({ error: 'Cannot cancel order after confirmation' }, { status: 400 });
        }
      } else {
        // Any other update is Admin only
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Prepare update fields dynamically
    const updateFields: string[] = [];
    const paramsList: any[] = [];
    let paramIndex = 1;

    if (order_status) {
      updateFields.push(`order_status = $${paramIndex++}`);
      paramsList.push(order_status);
    }
    if (payment_status) {
      updateFields.push(`payment_status = $${paramIndex++}`);
      paramsList.push(payment_status);
    }
    if (tracking_id) {
      updateFields.push(`tracking_id = $${paramIndex++}`);
      paramsList.push(tracking_id);
    }
    if (courier_name) {
      updateFields.push(`courier_name = $${paramIndex++}`);
      paramsList.push(courier_name);
    }
    if (awb_number) {
      updateFields.push(`awb_number = $${paramIndex++}`);
      paramsList.push(awb_number);
    }
    if (shiprocket_order_id) {
      updateFields.push(`shiprocket_order_id = $${paramIndex++}`);
      paramsList.push(shiprocket_order_id);
    }
    if (metadata) {
      updateFields.push(`metadata = COALESCE(metadata, '{}'::jsonb) || $${paramIndex++}`);
      paramsList.push(JSON.stringify(metadata));
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    paramsList.push(id);
    const idParamIndex = paramsList.length;

    // Execute Update
    await query(`
      UPDATE orders 
      SET ${updateFields.join(', ')}
      WHERE id = $${idParamIndex}
    `, paramsList);

    // Record Status History if order_status changed
    if (order_status) {
      await query(`
        INSERT INTO order_status_history (order_id, status, description, changed_by, metadata)
        VALUES ($1, $2, $3, $4, $5)
      `, [id, order_status, description || `Status updated to ${order_status}`, user.email, metadata ? JSON.stringify(metadata) : null]);
    }

    return NextResponse.json({ success: true, message: 'Order updated successfully' });

  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
