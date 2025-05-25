// SearchBar.jsx
import React from 'react';

export default function SearchBar({ onSearch }) {
  const handleInputChange = (e) => {
    onSearch(e.target.value);
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center bg-white border-2 border-gray-200 rounded-full p-2 shadow-sm focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-opacity-30 transition-all">
        <svg
          className="w-5 h-5 text-gray-500 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z"
          ></path>
        </svg>
        <input
          type="text"
          className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 placeholder-italic"
          placeholder="Search books, materials, or categories..."
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}
