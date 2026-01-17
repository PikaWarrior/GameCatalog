import React from 'react';
import { Menu } from 'lucide-react';
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
        <button className="menu-btn" onClick={onToggleSidebar} aria-label="Toggle Sidebar">
          <Menu size={24} color="#e2e8f0" />
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
