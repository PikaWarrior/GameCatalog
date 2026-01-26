import { CSSProperties } from 'react';

// --- Новые интерфейсы для рекомендаций ---
export interface SimilarGame {
  name: string;
  url: string;
  image: string;
}

export interface Game {
  id?: string;
  name: string;
  image: string;
  steam_url: string;
  coop: string;
  genre: string;
  tags: string[];
  description: string;
  subgenres: string[];
  // Новые поля
  similar_games: SimilarGame[];
  similar_games_summary?: string[];
  rating?: string; // На случай если есть в будущем
}

export interface ProcessedGame extends Game {
  id: string;
  searchableText: string;
  normalizedCoop: string;
  normalizedGenre: string;
  sanitizedDescription: string;
}

export interface FilterState {
  searchQuery: string;
  selectedTags: string[];
  excludedTags: string[]; // Добавлено, так как используется в App
  selectedGenres: string[];
  excludedGenres: string[]; // Добавлено
  selectedCoop: string;
  sortBy: 'name' | 'genre' | 'coop';
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
  style: CSSProperties;
  data: any;
}
