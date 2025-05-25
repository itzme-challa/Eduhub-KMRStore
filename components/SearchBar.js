import { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative max-w-3xl mx-auto mb-12 px-4 sm:px-6 md:px-0">
      <div className="relative flex items-center bg-white/90 backdrop-blur-md rounded-full shadow-xl border-2 border-transparent bg-clip-padding bg-gradient-to-r from-indigo-500 to-purple-500 p-0.5 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] focus-within:ring-4 focus-within:ring-indigo-300 focus-within:ring-opacity-50">
        <div className="flex items-center w-full bg-white rounded-full">
          <span className="pl-5 text-indigo-600">
            <FaSearch className="h-5 w-5" aria-hidden="true" />
          </span>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search books, materials, or categories..."
            className="w-full px-4 py-3 text-gray-900 bg-transparent focus:outline-none placeholder-gray-500 font-medium text-sm sm:text-base md:text-lg transition-colors duration-200"
            aria-label="Search products by name, description, or category"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="pr-5 text-gray-600 hover:text-indigo-600 focus:outline-none transition-colors duration-200"
              aria-label="Clear search query"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-100 to-purple-100 opacity-30 rounded-full" />
      </div>
    </div>
  );
}
