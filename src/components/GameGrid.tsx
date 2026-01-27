import React, { CSSProperties, memo } from 'react';
import { FixedSizeGrid as Grid, GridChildComponentProps, areEqual } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import GameCard from './GameCard';
import { ProcessedGame } from '../types';
import '../styles/GameGrid.css';

interface GameGridProps {
  games: ProcessedGame[];
  onOpenModal: (game: ProcessedGame) => void;
  favorites: string[]; // Массив ID избранных игр
  onToggleFavorite: (id: string) => void; // Функция переключения
}

// Интерфейс данных, прокидываемых внутрь ячейки виртуального списка
interface GridItemData {
  games: ProcessedGame[];
  columnCount: number;
  onOpenModal: (game: ProcessedGame) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

// Компонент одной ячейки (Карточки)
const Cell = memo(({ columnIndex, rowIndex, style, data }: GridChildComponentProps<GridItemData>) => {
  const { games, columnCount, onOpenModal, favorites, onToggleFavorite } = data;
  const index = rowIndex * columnCount + columnIndex;

  // Если индекс выходит за пределы массива (пустая ячейка в последней строке)
  if (index >= games.length) {
    return null;
  }

  const game = games[index];
  const isFavorite = favorites.includes(game.id);
  
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
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
    />
  );
}, areEqual);

const GameGrid: React.FC<GameGridProps> = ({ 
  games, 
  onOpenModal,
  favorites,
  onToggleFavorite
}) => {
  const MIN_COLUMN_WIDTH = 320; // Минимальная ширина колонки
  const ROW_HEIGHT = 500; // Высота строки (карточки)

  return (
    <div className="game-grid-wrapper">
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
            // Важно передать favorites и onToggleFavorite сюда
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
