import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { auth } from '../firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import Script from 'next/script';

export default function Checkout() {
  const router = useRouter();
  const { courseId, courseName, amount } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [user, setUser] = useState(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState(null);

  useEffect(() => {
    console.log('Checkout useEffect: Checking authentication');
    const unsubscribe = auth.onAuthStateChanged(
      (currentUser) => {
        if (!currentUser) {
          console.log('No authenticated user found, redirecting to /profile');
          toast.error('Please log in to proceed with the purchase.');
          router.push('/profile');
        } else {
          console.log('Authenticated user found:', currentUser.uid);
          setUser(currentUser);
          setFormData((prev) => ({
            ...prev,
            customerEmail: currentUser.email || prev.customerEmail,
          }));
        }
      },
      (error) => {
        console.error('Auth state change error:', error);
        toast.error('Authentication error. Please try again.');
      }
    );
    return () => {
      console.log('Cleaning up auth listener');
      unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    console.log('Button state - isLoading:', isLoading, 'user:', !!user, 'sdkLoaded:', sdkLoaded, 'user.uid:', user?.uid, 'sdkError:', sdkError);
  }, [isLoading, user, sdkLoaded, sdkError]);

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

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    console.log('Form submitted, validating...');
    if (!validateForm() || !user) {
      toast.error('Unable to proceed. Please ensure you are logged in and all fields are valid.');
      return;
    }

    if (!sdkLoaded) {
      toast.error('Payment SDK not loaded. Please try again or refresh the page.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Sending request to /api/createOrder with body:', {
        courseId,
        courseName,
        amount: parseFloat(amount),
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        userId: user.uid,
      });

      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      console.log('Response from /api/createOrder:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      const paymentSessionId = data.paymentSessionId;
      if (!paymentSessionId) {
        throw new Error('Payment session ID not received');
      }

      if (!window?.Cashfree) {
        throw new Error('Cashfree SDK not available');
      }

      const cashfree = new window.Cashfree({ 
        mode: process.env.NEXT_PUBLIC_CASHFREE_MODE || 'PROD' 
      });
      console.log('Initializing Cashfree checkout with session ID:', paymentSessionId);

      try {
        const checkoutResult = await cashfree.checkout({
          paymentSessionId,
          redirectTarget: '_top',
        });
        console.log('Cashfree checkout initiated successfully, result:', checkoutResult);
        setFormData({ customerName: '', customerEmail: '', customerPhone: '' });
      } catch (checkoutError) {
        console.error('Cashfree checkout error:', checkoutError);
        throw new Error(`Payment initiation failed: ${checkoutError.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(`Checkout failed: ${error.message}`);
      if (error.message.includes('authentication')) {
        toast.error('Please check your payment provider credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrySdkLoad = () => {
    console.log('Retrying SDK load');
    setSdkError(null);
    setSdkLoaded(false);
    const script = document.createElement('script');
    script.src = `https://sdk.cashfree.com/js/v3/cashfree.js?ts=${Date.now()}`;
    script.async = true;
    script.onload = () => {
      console.log('Cashfree SDK retry loaded successfully');
      setSdkLoaded(true);
      setSdkError(null);
    };
    script.onerror = (e) => {
      console.error('Cashfree SDK retry failed:', e);
      setSdkError('Failed to load payment SDK on retry.');
      toast.error('Failed to load payment SDK on retry. Please refresh the page.');
    };
    document.body.appendChild(script);
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
      <Script 
        src="https://sdk.cashfree.com/js/v3/cashfree.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Cashfree SDK loaded successfully');
          setSdkLoaded(true);
          setSdkError(null);
        }}
        onError={(e) => {
          console.error('Failed to load Cashfree SDK:', e);
          setSdkError('Failed to load payment SDK.');
          toast.error('Failed to load payment SDK. Please try again or refresh the page.');
        }}
      />
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Checkout</h1>
          <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Enter Your Details</h2>
            {sdkError && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                <p>{sdkError}</p>
                <button
                  onClick={handleRetrySdkLoad}
                  className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Retry Loading Payment SDK
                </button>
              </div>
            )}
            <form onSubmit={handleProceedToPayment} className="space-y-6">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="John Doe"
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
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (10 digits)
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="1234567890"
                  required
                />
              </div>
              <div className="order-summary bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Order Summary</h3>
                <p className="text-gray-600"><strong>Course:</strong> {courseName}</p>
                <p className="text-gray-600"><strong>Amount:</strong> ₹{amount}</p>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !user || !sdkLoaded}
                  className={`proceed-button ${isLoading || !user || !sdkLoaded ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
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
