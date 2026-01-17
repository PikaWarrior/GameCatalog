import React from 'react';
import SearchBar from './SearchBar';
import '../styles/Header.css';

interface HeaderProps {
  totalGames: number;
  visibleGames: number;
  onSearch: (value: string) => void;
  searchTerm: string;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  totalGames, visibleGames, onSearch, searchTerm, onToggleSidebar 
}) => {
  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="menu-btn" 
          onClick={onToggleSidebar} 
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar"
        >
          {/* Чистый SVG "Гамбургер" (3 линии) без лишних библиотек */}
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1>Game Catalog</h1>
      </div>
      
      <div className="header-center">
        <span className="stats-pill">
          Showing <b>{visibleGames}</b> of {totalGames}
        </span>
      </div>

      <div className="header-right">
        <SearchBar value={searchTerm} onChange={onSearch} />
      </div>
    </header>
  );
};

export default Header;
