import React from 'react';
import '../styles/GameCard.css';

// Явно экспортируем интерфейс пропсов
export interface LoadingSkeletonProps {
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 12 }) => {
  const skeletons = Array(count).fill(null);

  return (
    <div className="game-grid-skeleton" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
      gap: '20px', 
      padding: '20px',
      width: '100%'
    }}>
      {skeletons.map((_, index) => (
        <div 
          key={index} 
          className="game-card skeleton-card" 
          style={{ 
            height: '450px', 
            background: '#1e1e1e', 
            borderRadius: '12px', 
            overflow: 'hidden',
            border: '1px solid #333',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div className="skeleton-image" style={{ 
            height: '180px', 
            background: '#2a2a2a',
            width: '100%' 
          }} />
          <div className="skeleton-content" style={{ padding: '16px', flex: 1 }}>
            <div style={{ height: '24px', width: '70%', background: '#2a2a2a', marginBottom: '12px', borderRadius: '4px' }} />
            <div style={{ height: '16px', width: '90%', background: '#2a2a2a', marginBottom: '8px', borderRadius: '4px' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
