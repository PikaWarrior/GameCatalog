// src/types/index.ts

// Обновленный тип: id необязателен (так как в JSON его нет), добавлен url
export interface SimilarGameRef {
  id?: string | number;
  name: string;
  image: string;
  url?: string;
}

// Интерфейс для ВХОДЯЩЕГО (сырого) JSON
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
  // Списки
  tags?: string[];
  genres?: string[];
  categories?: string[];
  // Новые данные
  similar_games?: SimilarGameRef[] | { name: string; url: string; image: string }[]; // Поддержка структуры JSON
  similar_games_summary?: string[]; // Поле из JSON, которое вызывало ошибку
  review_score?: number | string;
  rating?: number | string;
}

// ОСНОВНОЙ интерфейс (внутренний)
export interface Game {
  id: string;
  name: string;
  image: string;
  steam_url: string;
  coop: string;
  genre: string;
  tags: string[];
  description: string;
  subgenres: string[];
  rating?: string | number;
  similar_games: SimilarGameRef[];
}

export interface ProcessedGame extends Game {
  searchableText: string;
  normalizedCoop: string;
  normalizedGenre: string;
  sanitizedDescription: string;
}

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
