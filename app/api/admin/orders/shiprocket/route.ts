import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { query } from '@/lib/db';
import { 
  generateShiprocketLabel, 
  generateAndPrintManifest, 
  printShiprocketInvoice,
  generateShiprocketPickup
} from '@/lib/shiprocket';
import { syncOrderStatus } from '@/lib/shiprocket-sync';

/**
 * POST /api/admin/orders/shiprocket
 * Handles admin-triggered Shiprocket actions: label, manifest, invoice, sync
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, orderId } = await request.json();
    let currentAction = action;

    const orderRes = await query(`
      SELECT id, shiprocket_order_id, shiprocket_shipment_id, awb_number 
      FROM orders WHERE id = $1
    `, [orderId]);

    if (orderRes.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderRes.rows[0];
    const shipmentId = Number(order.shiprocket_shipment_id);
    const srOrderId = Number(order.shiprocket_order_id);

    if (!shipmentId) {
      return NextResponse.json({ error: 'Order not linked to Shiprocket' }, { status: 400 });
    }

    let result: any = null;

    switch (action) {
      case 'sync':
        result = await syncOrderStatus(orderId);
        return NextResponse.json({ success: true, ...result });

      case 'pickup':
        result = await generateShiprocketPickup([shipmentId]);
        break;

      case 'label':
        result = await generateShiprocketLabel([shipmentId]);
        if (result.success) {
          await query(`UPDATE orders SET label_url = $1 WHERE id = $2`, [result.label_url, orderId]);
        }
        break;

      case 'manifest':
        result = await generateAndPrintManifest([shipmentId]);
        if (result.success) {
          await query(`UPDATE orders SET manifest_url = $1 WHERE id = $2`, [result.manifest_url, orderId]);
        }
        break;

      case 'invoice':
        result = await printShiprocketInvoice([srOrderId]);
        if (result.success) {
          await query(`UPDATE orders SET invoice_url = $1 WHERE id = $2`, [result.invoice_url, orderId]);
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error(`Shiprocket Admin Action Failed:`, error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
