// src/types/index.ts

// Тип для ссылки на похожую игру
export interface SimilarGameRef {
  id: string | number;
  name: string;
  image: string;
}

// Интерфейс для ВХОДЯЩЕГО (сырого) JSON
// Поля сделаны опциональными для максимальной совместимости
export interface RawGame {
  id?: string | number;
  steamId?: string | number;
  name: string;
  // Варианты ключей для изображений
  header_image?: string;
  image?: string;
  // Варианты ключей для ссылок
  steam_url?: string;
  url?: string;
  link?: string;
  // Описания
  description?: string;
  short_description?: string;
  about_the_game?: string;
  // Списки тегов и жанров
  tags?: string[];
  genres?: string[];
  categories?: string[]; // "Single-player", "Multi-player" и т.д.
  // Новые данные
  similar_games?: SimilarGameRef[];
  review_score?: number | string;
  rating?: number | string;
}

// ОСНОВНОЙ интерфейс (внутренний), который используется в приложении
export interface Game {
  id: string;
  name: string;
  image: string;
  steam_url: string;
  coop: string;        // Строка видов "Single / Co-op" для фильтров
  genre: string;       // Основной жанр
  tags: string[];      // Теги Steam
  description: string;
  subgenres: string[]; // Дополнительные жанры
  rating?: string | number;
  similar_games: SimilarGameRef[]; // Новое поле
}

// Обработанная игра (с полями для поиска)
export interface ProcessedGame extends Game {
  searchableText: string;
  normalizedCoop: string;
  normalizedGenre: string;
  sanitizedDescription: string;
}

// Состояние фильтров
export interface FilterState {
  searchQuery: string;
  selectedTags: string[];
  selectedGenres: string[];
  excludedGenres: string[];
  excludedTags: string[];
  selectedCoop: string;
  sortBy: 'name' | 'genre' | 'coop';
  currentPage?: number;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  role?: string;
  tabIndex?: number;
}

export interface AppError {
  id: string;
  message: string;
  timestamp: number;
  componentStack?: string;
  userInfo?: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PerformanceMetrics {
  loadTime: number;
  filterTime: number;
  renderTime: number;
  memoryUsage?: number;
}

export interface VirtualizedItem {
  index: number;
  style: React.CSSProperties;
  data: any;
}
