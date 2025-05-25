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
    <div className="w-full flex justify-center px-4 mb-10">
      <div className="w-full max-w-3xl relative">
        <div className="flex items-center bg-white rounded-2xl shadow-[0_10px_30px_rgba(80,72,229,0.15)] border border-gray-200 hover:shadow-[0_12px_36px_rgba(80,72,229,0.25)] transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-400">
          <span className="pl-5 text-indigo-500">
            <FaSearch className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search books, materials, or categories..."
            className="w-full px-4 py-3 text-gray-800 bg-transparent focus:outline-none placeholder-gray-400 text-base sm:text-lg"
            aria-label="Search products"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="pr-5 text-gray-400 hover:text-indigo-500 transition-colors duration-200"
              aria-label="Clear search query"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-transparent opacity-70" />
      </div>
    </div>
  );
}
