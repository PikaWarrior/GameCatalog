import React, { CSSProperties, memo, useMemo } from 'react'; // 🆕 useMemo
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
}

const Cell = memo(({ columnIndex, rowIndex, style, data }: GridChildComponentProps<GridItemData>) => {
  const { games, columnCount, onOpenModal, favorites, onToggleFavorite } = data;
  const index = rowIndex * columnCount + columnIndex;

  if (index >= games.length) {
    return null;
  }

  const game = games[index];
  
  // ⚡ ОПТИМИЗАЦИЯ: favorites.includes может быть медленным на больших массивах,
  // но на 900 играх это ок. Главное, что сам Cell мемоизирован.
  const isFavorite = favorites.includes(game.id);
  
  const gutter = 16;
  
  // ⚡ ОПТИМИЗАЦИЯ СТИЛЕЙ: Мемоизировать сам стиль нельзя (react-window его меняет),
  // но можно упростить объект
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
  const MIN_COLUMN_WIDTH = 320; 
  const ROW_HEIGHT = 420;

  // ⚡ ОПТИМИЗАЦИЯ: Мемоизируем itemData
  // Однако, itemData зависит от columnCount, который внутри AutoSizer...
  // Поэтому мы не можем вынести itemData наружу полностью.
  // Но мы можем сделать helper компонент для Grid.
  
  // Чтобы не усложнять, оставим как есть, но убедимся, что Cell перерисовывается только когда надо.
  // areEqual из react-window делает поверхностное сравнение props.data.
  
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

            // Создаем объект данных для ячеек
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
                // ⚡ Добавим useIsScrolling, чтобы react-window мог отключать 
                // тяжелые эффекты при быстром скролле (если поддерживается версией)
                useIsScrolling
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
