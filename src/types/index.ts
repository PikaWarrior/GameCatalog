// src/types/index.ts

export interface SimilarGameRef {
  id?: string | number;
  name: string;
  image: string;
  url?: string;
}

// ВХОДЯЩИЙ ФОРМАТ (Строго по твоему JSON)
export interface RawGame {
  id?: string | number;
  name: string;
  
  header_image?: string;
  image?: string;
  steam_url?: string;
  url?: string;
  
  genre: string;          // Строка
  subgenres: string[];    // Массив строк
  tags: string[];         // Массив строк
  coop?: string;
  
  description?: string;
  short_description?: string;
  
  rating?: string | number;
  review_score?: string | number;
  
  similar_games?: SimilarGameRef[];
  similar_games_summary?: string[]; // Текстовое объяснение схожести
}

// ВНУТРЕННИЙ ФОРМАТ
export interface Game {
  id: string;
  name: string;
  image: string;
  steam_url: string;
  
  coop: string;
  genre: string;
  subgenres: string[];
  tags: string[];
  
  description: string;
  rating?: string | number;
  
  similar_games: SimilarGameRef[];     // Для карточек (картинки)
  similar_games_summary: string[];     // Для модалки (текст)
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
