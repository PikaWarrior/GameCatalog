import React from 'react';
import '../styles/SearchBar.css';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="search-container">
      <div className="search-icon">
        🔍
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search games by name or description..."
        className="search-input"
        aria-label="Search games"
      />
      {searchQuery && (
        <button 
          onClick={() => setSearchQuery('')}
          className="clear-search"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SearchBar;
