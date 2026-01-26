import React, { CSSProperties, memo } from 'react';
import { FixedSizeGrid as Grid, GridChildComponentProps, areEqual } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import GameCard from './GameCard';
import { ProcessedGame } from '../types';
import '../styles/GameGrid.css';

interface GameGridProps {
  games: ProcessedGame[];
  onOpenModal: (game: ProcessedGame) => void;
}

interface GridItemData {
  games: ProcessedGame[];
  columnCount: number;
  onOpenModal: (game: ProcessedGame) => void;
}

// Отдельная ячейка сетки
const Cell = memo(({ columnIndex, rowIndex, style, data }: GridChildComponentProps<GridItemData>) => {
  const { games, columnCount, onOpenModal } = data;
  const index = rowIndex * columnCount + columnIndex;

  // Если индекс выходит за пределы (пустая ячейка в последней строке)
  if (index >= games.length) {
    return null;
  }

  const game = games[index];
  
  // Отступы между карточками
  const gutter = 16;
  
  // Корректируем стиль, чтобы учесть отступы
  const cardStyle: CSSProperties = {
    ...style,
    left: Number(style.left) + gutter,
    top: Number(style.top) + gutter,
    width: Number(style.width) - gutter,
    height: Number(style.height) - gutter,
  };

  return (
    <GameCard
      game={game}
      style={cardStyle}
      onOpenModal={onOpenModal}
    />
  );
}, areEqual);

const GameGrid: React.FC<GameGridProps> = ({ games, onOpenModal }) => {
  // Настройки сетки
  const MIN_COLUMN_WIDTH = 320; 
  const ROW_HEIGHT = 480; 

  if (games.length === 0) {
    return (
      <div className="no-games-found">
        <h2>No games found 😔</h2>
        <p>Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, height: '100%', width: '100%' }}>
      <AutoSizer>
        {({ height, width }) => {
          // Вычисляем количество колонок
          const columnCount = Math.floor(width / MIN_COLUMN_WIDTH) || 1;
          const columnWidth = width / columnCount;
          const rowCount = Math.ceil(games.length / columnCount);

          const itemData: GridItemData = {
            games,
            columnCount,
            onOpenModal,
          };

          return (
            <Grid
              columnCount={columnCount}
              columnWidth={columnWidth}
              height={height}
              rowCount={rowCount}
              rowHeight={ROW_HEIGHT}
              width={width}
              itemData={itemData}
              className="game-grid-scroll-container"
            >
              {Cell}
            </Grid>
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default GameGrid;
