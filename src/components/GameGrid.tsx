import React, { CSSProperties } from 'react';
import { FixedSizeGrid as Grid, GridChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import GameCard from './GameCard';
import { ProcessedGame } from '../types';
import '../styles/GameGrid.css';

interface GameGridProps {
games: ProcessedGame[];
}

interface GridItemData {
games: ProcessedGame[];
columnCount: number;
}

const Cell = ({ columnIndex, rowIndex, style, data }: GridChildComponentProps<GridItemData>) => {
const { games, columnCount } = data;
const index = rowIndex * columnCount + columnIndex;

if (index >= games.length) {
return null;
}

const game = games[index];

// Добавляем отступы (gutter) через манипуляцию стилями
const gutter = 16; // Отступ между карточками
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
/>
);
};

const GameGrid: React.FC<GameGridProps> = ({ games }) => {
const MIN_COLUMN_WIDTH = 300;
const ROW_HEIGHT = 440; // Увеличил высоту, чтобы все влезало

return (
<div style={{ flex: 1, height: '100%', minHeight: '600px', width: '100%' }}>
<AutoSizer>
{({ height, width }) => {
// Вычисляем количество колонок
const columnCount = Math.floor(width / MIN_COLUMN_WIDTH) || 1;
// Растягиваем колонки, чтобы заполнить всю ширину
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
itemData={{ games, columnCount }}
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
