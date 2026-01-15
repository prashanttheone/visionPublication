import { query } from './db';
import { createShiprocketOrder, assignShiprocketAWB } from './shiprocket';
import { sendOrderConfirmationNotifications } from './sms';

export async function triggerOrderAutomation(orderId: number) {
  try {
    // 1. Fetch full order details including address and items
    const orderResult = await query(`
      SELECT o.*, u.full_name as user_name, u.email as user_email, u.phone as user_phone,
             ua.full_name as shipping_name, ua.contact_no as shipping_phone, 
             ua.address_line_1, ua.locality, ua.city, ua.state, ua.pincode, ua.country
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN user_addresses ua ON o.address_id = ua.id
      WHERE o.id = $1
    `, [orderId]);

    if (orderResult.rows.length === 0) return;
    const order = orderResult.rows[0];

    const itemsResult = await query(`
      SELECT oi.*, b.name as book_name
      FROM order_items oi
      JOIN books b ON oi.book_id = b.id
      WHERE oi.order_id = $1
    `, [orderId]);

    const items = itemsResult.rows.map(item => ({
      name: item.book_name,
      quantity: item.quantity,
      price: item.price,
      sku: item.sku
    }));

    // 2. Trigger Shiprocket Order Creation
    const shiprocketData = {
      order_number: order.order_number,
      billing_customer_name: order.shipping_name || order.user_name,
      billing_address: order.address_line_1,
      billing_city: order.city,
      billing_pincode: order.pincode,
      billing_state: order.state,
      billing_email: order.user_email,
      billing_phone: order.shipping_phone || order.user_phone,
      payment_method: order.payment_method,
      total_amount: order.total_amount,
      items: items
    };

    const shiprocketResult = await createShiprocketOrder(shiprocketData);
    
    if (shiprocketResult.success) {
      const shipmentId = shiprocketResult.data.shipment_id;
      const srOrderId = shiprocketResult.data.order_id;

      // 2b. Automatically Assign AWB (Step 5)
      const awbResult = await assignShiprocketAWB(shipmentId);
      
      let awbCode = null;
      let courierName = null;

      if (awbResult.success) {
        awbCode = awbResult.data.response.data.awb_code;
        courierName = awbResult.data.response.data.courier_name;
      }

      await query(`
        UPDATE orders 
        SET shiprocket_order_id = $1, 
            shiprocket_shipment_id = $2,
            awb_number = $3,
            courier_name = $4,
            order_status = 'confirmed'
        WHERE id = $5
      `, [srOrderId, shipmentId, awbCode, courierName, orderId]);

      // Record in history
      await query(`
        INSERT INTO order_status_history (order_id, status, description, changed_by)
        VALUES ($1, 'confirmed', 'Shiprocket order created and AWB assigned', 'system')
      `, [orderId]);
    }

    // 3. Trigger SMS & WhatsApp
    await sendOrderConfirmationNotifications(order.shipping_phone || order.user_phone, order.order_number);

  } catch (error) {
    console.error('Order Automation Trigger Failed:', error);
  }
}
