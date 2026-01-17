import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';
import crypto from 'crypto';
import { triggerOrderAutomation } from '@/lib/order-automation';

/**
 * POST /api/orders/confirm
 * Verify Razorpay payment and confirm order
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      order_id, 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = await request.json();

    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // 1. Verify Signature
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    
    if (RAZORPAY_KEY_SECRET) {
      const generated_signature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
      }
    } else {
      console.warn('RAZORPAY_KEY_SECRET not set, skipping signature verification (Insecure)');
    }

    // 2. Update Order Status
    const updateResult = await query(`
      UPDATE orders 
      SET 
        payment_status = 'paid',
        order_status = 'confirmed',
        razorpay_order_id = $2,
        razorpay_payment_id = $3,
        razorpay_signature = $4,
        payment_method = 'online',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $5
      RETURNING id, order_number, total_amount
    `, [order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, user.id]);

    if (updateResult.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
    }

    const confirmedOrder = updateResult.rows[0];

    // 2b. Log successful payment
    await query(`
      INSERT INTO payment_logs (order_id, razorpay_order_id, razorpay_payment_id, amount, status, method)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [order_id, razorpay_order_id, razorpay_payment_id, confirmedOrder.total_amount, 'captured', 'online']);

    // 3. Record in Status History
    await query(`
      INSERT INTO order_status_history (order_id, status, description, changed_by, metadata)
      VALUES ($1, 'confirmed', 'Payment verified and order confirmed', 'system', $2)
    `, [order_id, JSON.stringify({ razorpay_payment_id })]);

    // 4. Clear Shopping Cart
    await query('DELETE FROM shopping_cart WHERE user_id = $1', [user.id]);

    // 5. Trigger Automation (Shiprocket + SMS)
    triggerOrderAutomation(order_id);

    return NextResponse.json({ 
      success: true, 
      message: 'Order confirmed successfully',
      order_number: updateResult.rows[0].order_number
    });

  } catch (error) {
    console.error('Order confirmation failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
