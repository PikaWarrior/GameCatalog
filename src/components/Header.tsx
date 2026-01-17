import React from 'react';
import '../styles/Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <h1 className="logo">🎮 Game Catalog</h1>
          <p className="subtitle">A collection of 169 unique games</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">12+</span>
            <span className="stat-label">Genres</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">200+</span>
            <span className="stat-label">Tags</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">5</span>
            <span className="stat-label">Modes</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
