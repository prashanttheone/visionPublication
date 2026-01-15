import axios from 'axios';

const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/external';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

async function getShiprocketToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await axios.post(`${SHIPROCKET_API_URL}/auth/login`, {
      email: process.env.SHIPROCKET_EMAIL || 'kumarprashantyadav12@gmail.com',
      password: process.env.SHIPROCKET_PASSWORD || 'm$jfs#We9&@Zn9fsjeXmpSuChzB3%ni*',
    });

    if (response.data && response.data.token) {
      cachedToken = response.data.token;
      // Tokens are usually valid for 10 days, setting expiry for 9 days to be safe
      tokenExpiry = now + 9 * 24 * 60 * 60 * 1000;
      return cachedToken;
    }
    throw new Error('Failed to get Shiprocket token');
  } catch (error) {
    console.error('Shiprocket Auth Error:', error);
    return null;
  }
}

export async function createShiprocketOrder(orderData: any) {
  const token = await getShiprocketToken();
  if (!token) return { success: false, error: 'Authentication failed' };

  try {
    const response = await axios.post(
      `${SHIPROCKET_API_URL}/orders/create/adhoc`,
      {
        order_id: orderData.order_number,
        order_date: new Date().toISOString().slice(0, 10),
        pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
        billing_customer_name: orderData.billing_customer_name,
        billing_last_name: orderData.billing_last_name || '',
        billing_address: orderData.billing_address,
        billing_city: orderData.billing_city,
        billing_pincode: orderData.billing_pincode,
        billing_state: orderData.billing_state,
        billing_country: orderData.billing_country || 'India',
        billing_email: orderData.billing_email,
        billing_phone: orderData.billing_phone,
        shipping_is_billing: true,
        order_items: orderData.items.map((item: any) => ({
          name: item.name,
          sku: item.sku || `SKU-${item.id}`,
          units: item.quantity,
          selling_price: item.price,
          discount: item.discount || 0,
        })),
        payment_method: orderData.payment_method === 'cod' ? 'COD' : 'Prepaid',
        sub_total: orderData.total_amount,
        length: 10, // dummy dimensions
        breadth: 10,
        height: 10,
        weight: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Shiprocket Order Creation Error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

/**
 * Step 5: Assign AWB to a shipment
 */
export async function assignShiprocketAWB(shipmentId: number) {
  const token = await getShiprocketToken();
  if (!token) return { success: false, error: 'Authentication failed' };

  try {
    const response = await axios.post(
      `${SHIPROCKET_API_URL}/courier/assign/awb`,
      { shipment_id: shipmentId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Shiprocket AWB Assignment Error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

/**
 * Step 6: Generate Pickup for a shipment
 */
export async function generateShiprocketPickup(shipmentIds: number[]) {
  const token = await getShiprocketToken();
  if (!token) return { success: false, error: 'Authentication failed' };

  try {
    const response = await axios.post(
      `${SHIPROCKET_API_URL}/courier/generate/pickup`,
      { shipment_id: shipmentIds },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Shiprocket Pickup Generation Error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

/**
 * Step 7 & 8: Generate and Print Manifest
 */
export async function generateAndPrintManifest(shipmentIds: number[]) {
  const token = await getShiprocketToken();
  if (!token) return { success: false, error: 'Authentication failed' };

  try {
    // Generate
    await axios.post(
      `${SHIPROCKET_API_URL}/manifests/generate`,
      { shipment_id: shipmentIds },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    // Print
    const printRes = await axios.post(
      `${SHIPROCKET_API_URL}/manifests/print`,
      { shipment_id: shipmentIds },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true, manifest_url: printRes.data.manifest_url };
  } catch (error: any) {
    console.error('Shiprocket Manifest Error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

/**
 * Step 9: Generate Label
 */
export async function generateShiprocketLabel(shipmentIds: number[]) {
  const token = await getShiprocketToken();
  if (!token) return { success: false, error: 'Authentication failed' };

  try {
    const response = await axios.post(
      `${SHIPROCKET_API_URL}/courier/generate/label`,
      { shipment_id: shipmentIds },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true, label_url: response.data.label_url };
  } catch (error: any) {
    console.error('Shiprocket Label Error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

/**
 * Step 10: Print Invoice
 */
export async function printShiprocketInvoice(orderIds: number[]) {
  const token = await getShiprocketToken();
  if (!token) return { success: false, error: 'Authentication failed' };

  try {
    const response = await axios.post(
      `${SHIPROCKET_API_URL}/orders/print/invoice`,
      { ids: orderIds },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true, invoice_url: response.data.invoice_url };
  } catch (error: any) {
    console.error('Shiprocket Invoice Error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

/**
 * Step 11: Track Shipment
 */
export async function trackShiprocketAWB(awbCode: string) {
  const token = await getShiprocketToken();
  if (!token) return { success: false, error: 'Authentication failed' };

  try {
    const response = await axios.get(
      `${SHIPROCKET_API_URL}/courier/track/awb/${awbCode}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true, data: response.data.tracking_data };
  } catch (error: any) {
    console.error('Shiprocket Tracking Error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}
