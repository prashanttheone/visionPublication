import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-server';

/**
 * GET /api/orders/orderstaus
 * Get status history for an order via query param ?order_id=...
 * Accessible by order owner or admin
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    // Check ownership/permissions
    const orderCheck = await query('SELECT user_id FROM orders WHERE id = $1', [orderId]);
    if (orderCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (user.role !== 'admin' && orderCheck.rows[0].user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const history = await query(`
      SELECT status, description, changed_by, changed_at, metadata
      FROM order_status_history
      WHERE order_id = $1
      ORDER BY changed_at DESC
    `, [orderId]);

    return NextResponse.json(history.rows);
  } catch (error) {
    console.error('Failed to fetch status history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/orders/orderstaus
 * Add a status update (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized/Admin only' }, { status: 401 });
    }

    const { order_id, status, description, metadata } = await request.json();

    if (!order_id || !status) {
      return NextResponse.json({ error: 'order_id and status are required' }, { status: 400 });
    }

    // 1. Update main order table
    const updateOrder = await query(`
      UPDATE orders 
      SET order_status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `, [order_id, status]);

    if (updateOrder.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 2. Add history entry
    await query(`
      INSERT INTO order_status_history (order_id, status, description, changed_by, metadata)
      VALUES ($1, $2, $3, $4, $5)
    `, [order_id, status, description || `Status updated to ${status}`, user.email, metadata ? JSON.stringify(metadata) : null]);

    return NextResponse.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Failed to update status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
