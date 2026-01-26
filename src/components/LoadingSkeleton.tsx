import React from 'react';
import '../styles/GameCard.css';

interface LoadingSkeletonProps {
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 12 }) => {
  // Создаем массив нужной длины, заполняя его null
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
          {/* Имитация картинки */}
          <div className="skeleton-image" style={{ 
            height: '180px', 
            background: '#2a2a2a',
            width: '100%' 
          }} />
          
          {/* Имитация контента */}
          <div className="skeleton-content" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Заголовок */}
            <div style={{ 
              height: '24px', 
              width: '70%', 
              background: '#2a2a2a', 
              marginBottom: '12px', 
              borderRadius: '4px' 
            }} />
            
            {/* Описание */}
            <div style={{ 
              height: '16px', 
              width: '90%', 
              background: '#2a2a2a', 
              marginBottom: '8px', 
              borderRadius: '4px' 
            }} />
            <div style={{ 
              height: '16px', 
              width: '60%', 
              background: '#2a2a2a', 
              marginBottom: 'auto', 
              borderRadius: '4px' 
            }} />
            
            {/* Теги */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <div style={{ height: '20px', width: '50px', background: '#2a2a2a', borderRadius: '10px' }} />
              <div style={{ height: '20px', width: '60px', background: '#2a2a2a', borderRadius: '10px' }} />
              <div style={{ height: '20px', width: '40px', background: '#2a2a2a', borderRadius: '10px' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
