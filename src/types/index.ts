export interface SimilarGameRef {
  id?: string | number;
  name: string;
  image: string;
  url?: string;
}

// Интерфейс для ВХОДЯЩЕГО JSON
// Используем [key: string]: any, чтобы позволить JSON иметь любые поля
// Но описываем ключевые для автодополнения
export interface RawGame {
  [key: string]: any; // Разрешаем любые дополнительные поля
  id?: string | number;
  name: string;
  tags?: any[];
  subgenres?: any[]; // Явно добавляем subgenres, так как оно было в твоем старом коде
  genre?: any[];
  categories?: any[];
  similar_games?: any[];
}

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
