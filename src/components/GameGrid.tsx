import React, { CSSProperties } from 'react';
import { FixedSizeGrid as Grid, GridChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import GameCard from './GameCard';
import { ProcessedGame } from '../types';
import '../styles/GameGrid.css';

interface GameGridProps {
  games: ProcessedGame[];
  onGameClick: (game: ProcessedGame) => void; // <-- 1. Добавляем проп для клика
}

// Расширяем интерфейс данных, которые передаются в ячейку
interface GridItemData {
  games: ProcessedGame[];
  columnCount: number;
  onGameClick: (game: ProcessedGame) => void; // <-- 2. Пробрасываем в данные ячейки
}

const Cell = ({ columnIndex, rowIndex, style, data }: GridChildComponentProps<GridItemData>) => {
  const { games, columnCount, onGameClick } = data;
  const index = rowIndex * columnCount + columnIndex;

  if (index >= games.length) {
    return null;
  }

  const game = games[index];

  // Добавляем отступы (gutter) через манипуляцию стилями
  const gutter = 16;
  const cardStyle: CSSProperties = {
    ...style,
    left: Number(style.left) + gutter / 2,
    top: Number(style.top) + gutter / 2,
    width: Number(style.width) - gutter,
    height: Number(style.height) - gutter,
    cursor: 'pointer', // <-- 3. Показываем, что карточка кликабельна
  };

  return (
    // Оборачиваем GameCard в div, чтобы отловить клик,
    // так как сам GameCard может не принимать onClick
    <div 
      style={cardStyle}
      onClick={() => onGameClick(game)} // <-- 4. Вызываем обработчик
    >
      <GameCard 
        game={game} 
        // style удаляем отсюда, так как он уже применен к обертке div
        // Если GameCard поддерживает style, можно вернуть обратно в него
      />
    </div>
  );
};

const GameGrid: React.FC<GameGridProps> = ({ games, onGameClick }) => {
  const MIN_COLUMN_WIDTH = 300; 
  const ROW_HEIGHT = 440;

  return (
    <div style={{ flex: 1, height: '100%', minHeight: '600px', width: '100%' }}>
      <AutoSizer>
        {({ height, width }) => {
          const columnCount = Math.floor(width / MIN_COLUMN_WIDTH) || 1;
          const columnWidth = width / columnCount;
          const rowCount = Math.ceil(games.length / columnCount);

          return (
            <Grid
              columnCount={columnCount}
              columnWidth={columnWidth}
              height={height}
              rowCount={rowCount}
              rowHeight={ROW_HEIGHT}
              width={width}
              // Передаем onGameClick внутрь itemData
              itemData={{ games, columnCount, onGameClick }} 
              className="game-grid-container"
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
