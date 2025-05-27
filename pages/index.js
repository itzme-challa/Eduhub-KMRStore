import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/products.json')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading products:', error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="hero bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">
              Discover Your Next Favorite Book
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto font-light">
              Explore our curated collection of premium study materials and books to excel in your learning journey.
            </p>
          </div>
        </div>

        {/* Products Grid Section */}
        <div className="container mx-auto px-4 py-12 md:py-16">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 md:mb-12 text-gray-900">
                Our Collection
              </h2>
              <div className="product-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
