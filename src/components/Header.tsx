import React from 'react';
import SearchBar from './SearchBar';
import '../styles/Header.css';

interface HeaderProps {
  totalGames: number;
  visibleGames: number;
  onSearch: (value: string) => void;
  searchTerm: string;
}

const Header: React.FC<HeaderProps> = ({ totalGames, visibleGames, onSearch, searchTerm }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1>Game Catalog</h1>
        <p>Total: {totalGames} | Visible: {visibleGames}</p>
        <SearchBar value={searchTerm} onChange={onSearch} />
      </div>
    </header>
  );
};
export default Header;
