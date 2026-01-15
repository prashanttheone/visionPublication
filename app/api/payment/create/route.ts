import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getAuthUser } from '@/lib/auth-server';
import { query } from '@/lib/db';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, order_id } = await request.json();

    if (!amount || !order_id) {
      return NextResponse.json({ error: 'Amount and Order ID are required' }, { status: 400 });
    }

    // 1. Create Razorpay Order
    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `order_rcpt_${order_id}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 2. Log the payment attempt in DB
    await query(`
      INSERT INTO payment_logs (order_id, razorpay_order_id, amount, status, method)
      VALUES ($1, $2, $3, $4, $5)
    `, [order_id, razorpayOrder.id, amount, 'created', 'online']);

    // 3. Update the order with razorpay_order_id
    await query(`
      UPDATE orders 
      SET razorpay_order_id = $1 
      WHERE id = $2 AND user_id = $3
    `, [razorpayOrder.id, order_id, user.id]);

    return NextResponse.json(razorpayOrder);
  } catch (error: any) {
    console.error('Razorpay Order Creation Failed:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
