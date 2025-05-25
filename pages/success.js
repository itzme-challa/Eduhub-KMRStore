import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Constants for default values
const DEFAULT_IMAGE = '/images/default-book.jpg';
const DEFAULT_PRICE = 10;
const DEFAULT_RATING = 4.2;

export default function Success() {
  const router = useRouter();
  const { product_id } = router.query;
  const [telegramLink, setTelegramLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!product_id) return;

    const fetchData = async () => {
      try {
        const [productsRes, materialRes] = await Promise.all([
          fetch('/products.json').then((res) => res.json()).catch(() => []),
          fetch('/material.json').then((res) => res.json()).catch(() => []),
        ]);

        // Find max product ID from productsData
        const maxProductId = productsRes && productsRes.length > 0
          ? Math.max(...productsRes.map(p => Number(p.id) || 0))
          : 0;

        // Transform material.json into product-like objects
        const materialProducts = transformMaterialToProducts(materialRes, maxProductId);

        // Combine products from both sources
        const combinedProducts = [...productsRes, ...materialProducts];

        // Find product by ID
        const product = combinedProducts.find((p) => p.id === parseInt(product_id));

        if (product && (product.telegramLink || product.link)) {
          const link = product.telegramLink || product.link;
          setTelegramLink(link);
          setTimeout(() => {
            window.location.href = link;
          }, 5000); // Redirect after 5 seconds
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading product:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [product_id]);

  function transformMaterialToProducts(materialData, startId) {
    let idCounter = startId + 1;
    const category = 'NEET,JEE,BOARDS';

    if (!Array.isArray(materialData)) return [];

    return materialData.flatMap((group) =>
      (group.items || []).map((item) => ({
        id: idCounter++,
        name: item.label || 'Untitled',
        telegramLink: `https://t.me/Material_eduhubkmrbot?start=${item.key}`,
        description: `${item.label || 'Material'} - ${group.title || 'General'}`,
        category,
        price: DEFAULT_PRICE, // Default price of 10
        image: DEFAULT_IMAGE, // Default image
        rating: Number((Math.random() * (5.0 - DEFAULT_RATING) + DEFAULT_RATING).toFixed(1)), // Random rating between 4.2 and 5.0
      }))
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="success-card max-w-lg mx-auto bg-white/90 backdrop-blur-md rounded-xl shadow-xl border-2 border-transparent bg-clip-padding bg-gradient-to-r from-indigo-500 to-purple-500 p-0.5 transition-all duration-300 hover:shadow-2xl">
            <div className="bg-white rounded-xl p-8">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : telegramLink ? (
                <>
                  <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
                    Payment Successful!
                  </h1>
                  <p className="text-center text-gray-600 mb-6 text-sm md:text-base">
                    Thank you for your purchase. You will be redirected to the material in 5 seconds.
                  </p>
                  <p className="text-center">
                    <a
                      href={telegramLink}
                      className="inline-block px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Click here to join now
                    </a>
                  </p>
                </>
              ) : (
                <p className="text-center text-gray-600 text-sm md:text-base">
                  Error: Telegram link not found.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
