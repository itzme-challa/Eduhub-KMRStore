import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Constants for default values
const DEFAULT_IMAGE = '/images/default-book.jpg';
const DEFAULT_PRICE = 10;
const DEFAULT_RATING = 0;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, materialRes] = await Promise.all([
          fetch('/products.json'),
          fetch('/material.json'),
        ]);

        const productsData = await productsRes.json().catch(() => []);
        const materialData = await materialRes.json().catch(() => []);

        // Find max product ID from productsData
        const maxProductId = productsData && productsData.length > 0
          ? Math.max(...productsData.map(p => Number(p.id) || 0))
          : 0;

        const materialProducts = transformMaterialToProducts(materialData, maxProductId);
        const allProducts = [...(productsData || []), ...materialProducts];
        setProducts(allProducts);
        setFilteredProducts(allProducts); // Initialize filtered products
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  function transformMaterialToProducts(materialData, startId) {
    let idCounter = startId + 1;
    const category = 'NEET,JEE,BOARDS';

    if (!Array.isArray(materialData)) return [];

    return materialData.flatMap((group) =>
      (group.items || []).map((item) => ({
        id: idCounter++,
        name: item.label || 'Untitled',
        link: `https://t.me/Material_eduhubkmrbot?start=${item.key}`,
        description: `${item.label || 'Material'} - ${group.title || 'General'}`,
        category,
        price: DEFAULT_PRICE, // Default price of 10
        image: DEFAULT_IMAGE, // Default image
        rating: DEFAULT_RATING, // Default rating of 0
      }))
    );
  }

  const handleSearch = (query) => {
    const lowerQuery = query.toLowerCase();
    if (!query) {
      setFilteredProducts(products);
      return;
    }
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
    );
    setFilteredProducts(filtered);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <ToastContainer />
      <main className="flex-grow">
        <div className="hero bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Your Next Favorite Book
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              Explore our curated collection of premium study materials and books to excel in your learning journey.
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <SearchBar onSearch={handleSearch} />
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center text-gray-500">
              {products.length === 0 ? 'No products available at the moment.' : 'No products match your search.'}
            </p>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Collection</h2>
              <div className="product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
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
