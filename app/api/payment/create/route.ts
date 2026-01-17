import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getAuthUser } from '@/lib/auth-server';
import { query } from '@/lib/db';

const RAZORPAY_KEY_ID = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'undefined') 
  ? process.env.RAZORPAY_KEY_ID 
  : 'rzp_test_S42RfNzo5hAfId';

const RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET !== 'undefined')
  ? process.env.RAZORPAY_KEY_SECRET 
  : 'ddx5LaD7mvozCqPEPmS2shlX';

if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID === 'rzp_test_S42RfNzo5hAfId') {
  console.warn('CRITICAL: Using fallback Razorpay Test Keys. Ensure these are valid in Razorpay Dashboard.');
}

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, order_id } = await request.json();
    
    // Masked logging for debugging
    const maskedId = RAZORPAY_KEY_ID ? `${RAZORPAY_KEY_ID.substring(0, 8)}...` : 'MISSING';
    console.log('Creating Razorpay Order:', { 
      amount, 
      order_id, 
      user_id: user.id,
      using_key: maskedId 
    });

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
