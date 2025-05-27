import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Link from 'next/link';
import Rating from './Rating';

export default function ProductCard({ product }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => console.log('Cashfree SDK loaded');
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script); // Cleanup on unmount
    };
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

  const handleBuyNow = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          amount: product.price,
          telegramLink: product.telegramLink,
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
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="product-card bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Image Section */}
      <Link href={`/products/${product.id}`} className="block relative w-full h-48 md:h-64">
        <Image
          src={product.image || '/default-book.jpg'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={product.id <= 4} // Prioritize loading for first few cards
          placeholder="blur"
          blurDataURL="/placeholder.jpg" // Add a placeholder image for better UX
        />
      </Link>

      {/* Content Section */}
      <div className="p-4 md:p-6 flex flex-col space-y-3">
        <Link href={`/products/${product.id}`}>
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1">
            {product.name}
          </h2>
        </Link>
        <p className="text-gray-600 text-sm md:text-base line-clamp-2">{product.description}</p>
        <Rating rating={product.rating} />
        <div className="flex justify-between items-center">
          <span className="text-xl md:text-2xl font-bold text-indigo-600">₹{product.price}</span>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isLoading}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label={`Buy ${product.name}`}
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
              'Buy Now'
            )}
          </button>
        </div>
      </div>

      {/* Modal for User Details */}
      {isModalOpen && (
        <div className="modal fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="modal-content bg-white rounded-xl p-6 md:p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900">Enter Your Details</h2>
            <form onSubmit={handleBuyNow} className="space-y-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">
                  Phone (10 digits)
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                  aria-required="true"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
