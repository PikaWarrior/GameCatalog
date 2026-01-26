import React from 'react';
import { Gamepad2, RotateCcw } from 'lucide-react';
import '../styles/Header.css';

interface HeaderProps {
  totalGames: number;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const Header: React.FC<HeaderProps> = ({ totalGames, onReset, hasActiveFilters }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <Gamepad2 className="logo-icon" size={32} />
          <h1>Game Library</h1>
          <span className="game-count">{totalGames} games</span>
        </div>
        
        <div className="header-actions">
          {hasActiveFilters && (
            <button 
              onClick={onReset} 
              className="reset-filters-btn"
              title="Reset all filters"
            >
              <RotateCcw size={16} style={{ marginRight: '6px' }} />
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
