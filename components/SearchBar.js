import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value); // Pass the search query to the parent component
  };

  return (
    <div className="relative w-full max-w-lg mx-auto mb-8">
      <div className="flex items-center bg-white rounded-lg shadow-md border border-gray-200">
        <span className="pl-4 text-gray-500">
          <FaSearch className="h-5 w-5" />
        </span>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search by name, description, or category..."
          className="w-full px-4 py-2 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}
