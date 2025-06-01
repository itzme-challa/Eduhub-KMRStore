// pages/checkout.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function Checkout() {
  const router = useRouter();
  const { productId, productName, amount, telegramLink } = router.query;
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => console.log('Cashfree SDK loaded');
    document.body.appendChild(script);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      toast.error('Please fill in all fields.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      toast.error('Please enter a valid email.');
      return false;
    }
    if (!/^\d{10}$/.test(formData.customerPhone)) {
      toast.error('Please enter a valid 10-digit phone number.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          productName,
          amount: parseFloat(amount),
          telegramLink,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create payment order');
      }
      const paymentSessionId = data.paymentSessionId;
      if (!window?.Cashfree || !paymentSessionId) {
        throw new Error('Cashfree SDK not loaded or session missing');
      }
      const cashfree = window.Cashfree({ mode: 'production' });
      cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self',
      });
      setFormData({ customerName: '', customerEmail: '', customerPhone: '' });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow checkout-page">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Checkout</h1>
          <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Order Details</h2>
            <div className="mb-6 space-y-2">
              <p><strong>Product:</strong> {productName}</p>
              <p><strong>Amount:</strong> ₹{amount}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="checkout-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="checkout-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (10 digits)
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="checkout-input"
                  required
                />
              </div>
              <div className="flex justify-between items-center mt-8">
                <Link href={`/products/${productId}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
                  Back to Product
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`checkout-button ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
