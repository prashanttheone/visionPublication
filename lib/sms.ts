import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

/**
 * Send SMS via Twilio
 */
export async function sendSMS(phone: string, message: string) {
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
  console.log(`[Twilio SMS] Sending to ${formattedPhone}: ${message}`);
  
  if (!client) {
    console.warn('Twilio credentials not set, skipping SMS (Mock mode)');
    return { success: true, mock: true };
  }

  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    return { success: true, sid: response.sid };
  } catch (error: any) {
    console.error('Twilio SMS Error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send WhatsApp via Twilio
 */
export async function sendWhatsApp(phone: string, message: string) {
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
  console.log(`[Twilio WhatsApp] Sending to ${formattedPhone}: ${message}`);

  if (!client) {
    console.warn('Twilio credentials not set, skipping WhatsApp (Mock mode)');
    return { success: true, mock: true };
  }

  try {
    const response = await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedPhone}`
    });
    return { success: true, sid: response.sid };
  } catch (error: any) {
    console.error('Twilio WhatsApp Error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send both SMS and WhatsApp confirmation
 */
export async function sendOrderConfirmationNotifications(phone: string, orderNumber: string) {
  const message = `Your order ${orderNumber} at Vision Publication has been placed successfully. Thank you for shopping with us!`;
  
  // Send both in parallel
  const [smsResult, waResult] = await Promise.all([
    sendSMS(phone, message),
    sendWhatsApp(phone, message)
  ]);

  return { sms: smsResult, whatsapp: waResult };
}
