import { query } from './db';
import { trackShiprocketAWB } from './shiprocket';

/**
 * Syncs order status from Shiprocket for a specific order
 */
export async function syncOrderStatus(orderId: number) {
  try {
    const orderResult = await query(`
      SELECT id, awb_number, order_status FROM orders WHERE id = $1
    `, [orderId]);

    if (orderResult.rows.length === 0) return;
    const order = orderResult.rows[0];

    if (!order.awb_number) return;

    const trackingResult = await trackShiprocketAWB(order.awb_number);
    if (!trackingResult.success || !trackingResult.data) return;

    const tracking = trackingResult.data;
    const srStatus = tracking.shipment_track[0]?.current_status?.toLowerCase();
    
    let newStatus = order.order_status;
    let deliveredAt = null;

    // Map Shiprocket status to local status
    if (srStatus.includes('delivered')) {
      newStatus = 'delivered';
      deliveredAt = tracking.shipment_track[0]?.delivered_date || new Date().toISOString();
    } else if (srStatus.includes('shipped') || srStatus.includes('in transit')) {
      newStatus = 'shipped';
    } else if (srStatus.includes('cancelled')) {
      newStatus = 'cancelled';
    }

    if (newStatus !== order.order_status) {
      await query(`
        UPDATE orders 
        SET order_status = $1, 
            delivered_at = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [newStatus, deliveredAt, orderId]);

      // Add to status history
      await query(`
        INSERT INTO order_status_history (order_id, status, description, changed_by)
        VALUES ($1, $2, $3, 'shiprocket_sync')
      `, [orderId, newStatus, `Status synced from Shiprocket: ${srStatus}`]);
    }

    return { success: true, status: newStatus };
  } catch (error) {
    console.error('Shiprocket Sync Error:', error);
    return { success: false, error };
  }
}

/**
 * Bulk sync for all active orders
 */
export async function syncAllActiveOrders() {
  const orders = await query(`
    SELECT id FROM orders 
    WHERE order_status IN ('confirmed', 'processing', 'shipped')
    AND awb_number IS NOT NULL
  `);

  const results = [];
  for (const order of orders.rows) {
    results.push(await syncOrderStatus(order.id));
  }
  return results;
}
