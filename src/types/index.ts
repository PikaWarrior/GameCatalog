// src/types/index.ts

export interface SimilarGameRef {
  id?: string | number;
  name: string;
  image: string;
  url?: string;
}

export interface RawGame {
  id?: string | number;
  name: string;
  header_image?: string;
  image?: string;
  steam_url?: string;
  url?: string;
  
  genre: string;
  subgenres: string[];
  tags: string[];
  coop?: string;
  
  description?: string;
  short_description?: string;
  
  rating?: string | number;
  review_score?: string | number;
  
  similar_games?: SimilarGameRef[];
  // НОВОЕ ПОЛЕ
  similar_games_summary?: string[]; 
}

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
  similar_games: SimilarGameRef[];
  // НОВОЕ ПОЛЕ
  similar_games_summary: string[];
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
