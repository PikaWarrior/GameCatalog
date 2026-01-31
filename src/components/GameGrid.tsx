import React, { CSSProperties, memo } from 'react';
import { FixedSizeGrid as Grid, GridChildComponentProps, areEqual } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import GameCard from './GameCard';
import { ProcessedGame } from '../types';
import '../styles/GameGrid.css';

interface GameGridProps {
  games: ProcessedGame[];
  onOpenModal: (game: ProcessedGame) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

interface GridItemData {
  games: ProcessedGame[];
  columnCount: number;
  onOpenModal: (game: ProcessedGame) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  isScrolling?: boolean; // 🆕 Добавил флаг скролла в данные
}

// 🆕 Получаем isScrolling прямо из пропсов Cell, которые дает react-window
const Cell = memo(({ columnIndex, rowIndex, style, data, isScrolling }: GridChildComponentProps<GridItemData> & { isScrolling?: boolean }) => {
  const { games, columnCount, onOpenModal, favorites, onToggleFavorite } = data;
  const index = rowIndex * columnCount + columnIndex;

  if (index >= games.length) {
    return null;
  }

  const game = games[index];
  const isFavorite = favorites.includes(game.id);
  
  const gutter = 16;
  const cardStyle: CSSProperties = {
    ...style,
    left: Number(style.left) + gutter / 2,
    top: Number(style.top) + gutter / 2,
    width: Number(style.width) - gutter,
    height: Number(style.height) - gutter,
  };

  return (
    <GameCard 
      game={game} 
      style={cardStyle} 
      onOpenModal={onOpenModal}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      isScrolling={isScrolling} // 🚀 Передаем флаг в карточку
    />
  );
}, areEqual);

const GameGrid: React.FC<GameGridProps> = ({ 
  games, 
  onOpenModal,
  favorites,
  onToggleFavorite
}) => {
  const MIN_COLUMN_WIDTH = 320; 
  const ROW_HEIGHT = 400; // Подбираем высоту под новый CSS

  return (
    <div className="game-grid-wrapper" style={{ flex: 1, height: '100%' }}>
      {games.length === 0 ? (
        <div className="no-results">
           <h3>Игры не найдены</h3>
           <p>Попробуйте изменить фильтры или поисковый запрос</p>
        </div>
      ) : (
        <AutoSizer>
          {({ height, width }) => {
            const columnCount = Math.floor(width / MIN_COLUMN_WIDTH) || 1;
            const columnWidth = width / columnCount;
            const rowCount = Math.ceil(games.length / columnCount);

            const itemData: GridItemData = {
              games,
              columnCount,
              onOpenModal,
              favorites,
              onToggleFavorite
            };

            return (
              <Grid
                className="game-grid-scroll"
                columnCount={columnCount}
                columnWidth={columnWidth}
                height={height}
                rowCount={rowCount}
                rowHeight={ROW_HEIGHT}
                width={width}
                itemData={itemData}
                overscanRowCount={2}
                useIsScrolling // ⚡ ВКЛЮЧАЕМ ТУРБО-РЕЖИМ (react-window будет передавать isScrolling в Cell)
              >
                {/* 
                   ⚠️ ВАЖНО: react-window передает isScrolling в компонент, если useIsScrolling=true.
                   Но типы TS могут ругаться. В Cell мы это обработали.
                */}
                {Cell}
              </Grid>
            );
          }}
        </AutoSizer>
      )}
    </div>
  );
};

export default GameGrid;
