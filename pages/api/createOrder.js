import { getDatabase, ref, set } from 'firebase/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { courseId, courseName, amount, customerName, customerEmail, customerPhone, userId } = req.body;

  if (!courseId || !courseName || !amount || !customerName || !customerEmail || !customerPhone || !userId) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const cashfreeUrl = process.env.NEXT_PUBLIC_CASHFREE_MODE === 'PROD'
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders';

    const cashfreeResponse = await fetch(cashfreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': process.env.CASHFREE_CLIENT_ID,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: userId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },
        order_meta: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?order_id={order_id}&order_token={order_token}`,
          notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook`,
        },
      }),
    });

    const cashfreeData = await cashfreeResponse.json();
    console.log('Cashfree API response:', cashfreeData);

    if (!cashfreeResponse.ok || !cashfreeData.payment_session_id) {
      console.error('Cashfree order creation failed:', {
        status: cashfreeResponse.status,
        data: cashfreeData,
        clientId: process.env.CASHFREE_CLIENT_ID ? '[SET]' : '[UNSET]',
        clientSecret: process.env.CASHFREE_CLIENT_SECRET ? '[SET]' : '[UNSET]',
        mode: process.env.NEXT_PUBLIC_CASHFREE_MODE,
      });
      return res.status(cashfreeResponse.status || 500).json({
        success: false,
        error: cashfreeData.message || 'authentication Failed',
      });
    }

    const db = getDatabase();
    await set(ref(db, `purchases/${userId}/${courseId}`), {
      courseName,
      amount,
      orderId,
      paymentSessionId: cashfreeData.payment_session_id,
      timestamp: Date.now(),
    });

    return res.status(200).json({
      success: true,
      paymentSessionId: cashfreeData.payment_session_id,
      orderId,
    });
  } catch (error) {
    console.error('Create order error:', {
      message: error.message,
      stack: error.stack,
      clientId: process.env.CASHFREE_CLIENT_ID ? '[SET]' : '[UNSET]',
      clientSecret: process.env.CASHFREE_CLIENT_SECRET ? '[SET]' : '[UNSET]',
    });
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
