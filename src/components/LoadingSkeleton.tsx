import React from 'react';
import '../styles/GameCard.css'; // Используем те же стили

const GameCardSkeleton = () => {
  return (
    <div className="game-card skeleton-card">
      <div className="game-card__image-wrap skeleton-pulse" />
      <div className="game-card__content">
        <div className="skeleton-line skeleton-title skeleton-pulse" />
        <div className="skeleton-line skeleton-text skeleton-pulse" />
        <div className="skeleton-line skeleton-text skeleton-pulse" style={{ width: '70%' }} />
        <div className="skeleton-tags">
           <div className="skeleton-tag skeleton-pulse" />
           <div className="skeleton-tag skeleton-pulse" />
        </div>
      </div>
    </div>
  );
};

export default GameCardSkeleton;
