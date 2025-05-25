import { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import Link from 'next/link';

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
    <div className="search-bar-container">
      <div className="search-bar-wrapper">
        <div className="search-bar-inner">
          <span className="search-icon">
            <FaSearch aria-hidden="true" />
          </span>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search books, materials, or categories..."
            className="search-input"
            aria-label="Search products by name, description, or category"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="clear-button"
              aria-label="Clear search query"
            >
              <FaTimes />
            </button>
          )}
        </div>
        <div className="search-bar-background" />
      </div>
    </div>
  );
}
