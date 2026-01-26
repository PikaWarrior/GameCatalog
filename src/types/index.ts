// src/types/index.ts

export interface SimilarGameRef {
  id?: string | number;
  name: string;
  image: string;
  url?: string;
}

// ВХОДЯЩИЙ JSON: Разрешаем any[], чтобы приложение не падало от объектов в массивах
export interface RawGame {
  id?: string | number;
  steamId?: string | number;
  name: string;
  header_image?: string;
  image?: string;
  steam_url?: string;
  url?: string;
  link?: string;
  description?: string;
  short_description?: string;
  about_the_game?: string;
  
  // Разрешаем любой мусор на входе, чистить будем в sanitize.ts
  tags?: any[]; 
  genres?: any[];
  categories?: any[];
  
  similar_games?: any[];
  similar_games_summary?: string[];
  review_score?: number | string;
  rating?: number | string;
  coop?: string; // На случай если в JSON уже есть строка
}

// ВНУТРЕННИЙ интерфейс: Здесь всё строго типизировано
export interface Game {
  id: string;
  name: string;
  image: string;
  steam_url: string;
  coop: string;
  genre: string;
  tags: string[];      // Строго массив строк!
  description: string;
  subgenres: string[]; // Строго массив строк!
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

// Вспомогательные типы
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
