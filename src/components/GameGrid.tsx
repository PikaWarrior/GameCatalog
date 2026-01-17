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

// Интерфейс данных, прокидываемых внутрь ячейки виртуального списка
interface GridItemData {
  games: ProcessedGame[];
  columnCount: number;
  onOpenModal: (game: ProcessedGame) => void;
}

// Компонент одной ячейки (Карточки)
// Используем memo и areEqual для оптимизации рендеринга при скролле
const Cell = memo(({ columnIndex, rowIndex, style, data }: GridChildComponentProps<GridItemData>) => {
  const { games, columnCount, onOpenModal } = data;
  const index = rowIndex * columnCount + columnIndex;

  // Если индекс выходит за пределы массива (пустая ячейка в последней строке), ничего не рендерим
  if (index >= games.length) {
    return null;
  }

  const game = games[index];
  
  // Вычисляем отступы (gutter) между карточками
  const gutter = 20;
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
    />
  );
}, areEqual);

const GameGrid: React.FC<GameGridProps> = ({ games, onOpenModal }) => {
  const MIN_COLUMN_WIDTH = 320; // Минимальная ширина колонки
  const ROW_HEIGHT = 500; // Высота строки (карточки)

  return (
    <div className="game-grid-wrapper" style={{ flex: 1, height: '100%', width: '100%' }}>
      {games.length === 0 ? (
        <div className="no-results">
           <h3>Игры не найдены</h3>
           <p>Попробуйте изменить фильтры или поисковый запрос</p>
        </div>
      ) : (
        <AutoSizer>
          {({ height, width }) => {
            // Вычисляем количество колонок динамически
            const columnCount = Math.floor(width / MIN_COLUMN_WIDTH) || 1;
            const columnWidth = width / columnCount;
            const rowCount = Math.ceil(games.length / columnCount);

            // Упаковываем все необходимые данные для ячейки
            const itemData: GridItemData = {
              games,
              columnCount,
              onOpenModal,
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
                overscanRowCount={2} // Рендерим чуть больше строк для плавного скролла
              >
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
