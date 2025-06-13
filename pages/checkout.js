import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { auth } from '../firebase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Script from 'next/script';

export default function Checkout() {
  const router = useRouter();
  const { courseId, courseName, amount } = router.query;
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        toast.error('Please log in to proceed with the purchase.');
        router.push('/profile');
      } else {
        setUser(currentUser);
        setFormData((prev) => ({
          ...prev,
          customerEmail: currentUser.email || prev.customerEmail,
        }));
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to proceed.');
      return;
    }

    if (!courseId || !courseName || !amount) {
      toast.error('Invalid course details. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          courseName,
          amount: parseFloat(amount),
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      const { paymentSessionId } = data;

      const cashfree = new window.Cashfree({
        mode: process.env.NEXT_PUBLIC_CASHFREE_MODE || 'PROD',
      });

      cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self',
      });
    } catch (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  if (!courseId || !courseName || !amount) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12">
            <p className="text-center text-xl text-gray-600">Invalid course details</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="beforeInteractive" />
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="contact-card">
            <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Course Details</h2>
              <p><strong>Course:</strong> {courseName}</p>
              <p><strong>Price:</strong> ₹{amount}</p>
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
                  className="input-field"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Your phone number"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="contact-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Proceed to Payment'}
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
