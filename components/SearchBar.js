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
    <div className="relative max-w-xl mx-auto mb-8">
      <div className="flex items-center bg-white rounded-lg shadow-md border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
        <span className="pl-4 text-gray-500">
          <FaSearch className="h-5 w-5" aria-hidden="true" />
        </span>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search by name, description, or category..."
          className="w-full px-4 py-2 text-gray-700 rounded-lg focus:outline-none"
          aria-label="Search products"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="pr-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Clear search"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
