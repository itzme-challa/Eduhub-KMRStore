import axios from 'axios';
import { getDatabase, ref, set } from '../../firebase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { courseId, courseName, amount, customerName, customerEmail, customerPhone, userId } = req.body;

  // Validate required fields
  const missingFields = [];
  if (!courseId) missingFields.push('courseId');
  if (!courseName) missingFields.push('courseName');
  if (!amount) missingFields.push('amount');
  if (!customerName) missingFields.push('customerName');
  if (!customerEmail) missingFields.push('customerEmail');
  if (!customerPhone) missingFields.push('customerPhone');
  if (!userId) missingFields.push('userId');

  if (missingFields.length > 0) {
    return res.status(400).json({ 
      success: false, 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    });
  }

  const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  try {
    const response = await axios.post(
      'https://api.cashfree.com/pg/orders',
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: `cust_${userId}`,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },
        order_meta: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?order_id={order_id}&course_id=${courseId}`,
          notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook`,
        },
        order_note: `Course: ${courseName}`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2022-09-01',
          'x-client-id': process.env.CASHFREE_CLIENT_ID,
          'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
        },
      }
    );

    const paymentSessionId = response.data.payment_session_id;

    return res.status(200).json({
      success: true,
      paymentSessionId,
      orderId,
    });
  } catch (error) {
    console.error('Cashfree order creation failed:', error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to create Cashfree order',
    });
  }
}
