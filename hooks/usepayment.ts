import { useState } from 'react';
import { App } from 'antd';
import { authUtils } from '@/lib/auth';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface PaymentOptions {
  amount: number;
  orderId: string | number;
  userName: string;
  userEmail: string;
  userPhone?: string;
  description?: string;
}

export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { message } = App.useApp();

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processPayment = async (options: PaymentOptions) => {
    setIsProcessing(true);
    try {
      // 1. Load Razorpay Script
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        message.error('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }
      
      const token = authUtils.getToken();

      // 2. Create Razorpay Order on Backend
      const orderRes = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: options.amount,
          order_id: options.orderId
        })
      });

      let orderData;
      try {
        orderData = await orderRes.json();
      } catch (e) {
        const errorText = await orderRes.text();
        console.error('Server error response:', errorText);
        throw new Error('Server returned an invalid response');
      }

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      const razorpayOrder = orderData;

      // 3. Open Razorpay Checkout
      const rzpOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_S42RfNzo5hAfId', // Must match backend key
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Vision Publication',
        description: options.description || 'Order Payment',
        image: '/logo.png', // Add your logo path
        order_id: razorpayOrder.id,
        handler: async (response: RazorpayResponse) => {
          try {
            // 4. Verify Payment on Backend
            const verifyRes = await fetch('/api/orders/confirm', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                order_id: options.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyRes.ok) {
              const result = await verifyRes.json();
              message.success('Payment successful!');
              window.location.href = `/books/order/success?order_number=${result.order_number}`;
            } else {
              const error = await verifyRes.json();
              throw new Error(error.error || 'Payment verification failed');
            }
          } catch (err: any) {
            message.error(err.message);
            setIsProcessing(false);
          }
        },
        prefill: {
          name: options.userName,
          email: options.userEmail,
          contact: options.userPhone
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
            ondismiss: function() {
                setIsProcessing(false);
            }
        }
      };

      const paymentObject = new (window as any).Razorpay(rzpOptions);
      paymentObject.on('payment.failed', function (response: any) {
        message.error('Payment failed: ' + response.error.description);
        setIsProcessing(false);
      });
      paymentObject.open();

    } catch (error: any) {
      message.error(error.message);
      setIsProcessing(false);
    }
  };

  return { processPayment, isProcessing };
};
