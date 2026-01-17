// Основные типы данных
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
}

export interface ProcessedGame extends Game {
  id: string;
  searchableText: string;
  normalizedCoop: string;
  normalizedGenre: string;
  sanitizedDescription: string;
  popularity?: number;
}

export interface FilterState {
  searchQuery: string;
  selectedTags: string[];
  selectedGenre: string;
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

// Типы для обработки ошибок
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

// Типы для производительности
export interface PerformanceMetrics {
  loadTime: number;
  filterTime: number;
  renderTime: number;
  memoryUsage?: number;
}

// Типы для виртуализации
export interface VirtualizedItem {
  index: number;
  style: React.CSSProperties;
  data: any;
}
