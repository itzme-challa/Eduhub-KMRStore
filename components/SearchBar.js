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
    <div className="relative max-w-2xl mx-auto mb-10 px-4 sm:px-0">
      <div className="relative flex items-center bg-white rounded-xl shadow-lg border border-indigo-200 overflow-hidden transition-all duration-300 hover:shadow-xl focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
        <span className="pl-4 text-indigo-600">
          <FaSearch className="h-5 w-5" aria-hidden="true" />
        </span>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search books, materials, or categories..."
          className="w-full px-4 py-3 text-gray-800 bg-transparent focus:outline-none placeholder-gray-400 text-sm sm:text-base"
          aria-label="Search products by name, description, or category"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="pr-4 text-gray-500 hover:text-indigo-600 focus:outline-none transition-colors duration-200"
            aria-label="Clear search query"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-50" />
      </div>
    </div>
  );
}
