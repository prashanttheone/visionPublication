import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

/**
 * GET /api/orders/history
 * Fetch authenticated user's order history with current status and item summaries
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admins can see all history, regular users only their own
    let sql = `
      SELECT 
        o.id, 
        o.order_number, 
        o.total_amount, 
        o.order_status, 
        o.payment_status, 
        o.created_at,
        o.tracking_id,
        o.courier_name,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
    `;
    const params: any[] = [];

    if (user.role !== 'admin') {
      sql += ` WHERE o.user_id = $1`;
      params.push(user.id);
    }

    sql += ` ORDER BY o.created_at DESC`;

    const result = await query(sql, params);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch order history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
