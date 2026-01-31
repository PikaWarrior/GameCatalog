export interface SimilarGameRef {
  id?: string | number;
  name: string;
  image: string;
  url?: string;      // Ссылка на игру
  steamUrl?: string; // Иногда приходит как steam_url
}

// Сырые данные из JSON
export interface RawGame {
  id?: string | number;
  name: string;
  header_image?: string;
  image?: string;
  steam_url?: string; // В JSON это steam_url
  url?: string;
  genre: string;
  subgenres: string[];
  tags: string[];
  coop?: string;
  description?: string;
  short_description?: string;
  about_the_game?: string;
  rating?: string | number;
  review_score?: string | number;
  similar_games?: SimilarGameRef[]; // В JSON это similar_games
  similar_games_summary?: string[];
}

// Внутренний формат приложения (camelCase)
export interface Game {
  id: string;
  name: string;
  image: string;
  steamUrl: string; // 🔄 Переименовал в steamUrl
  coop: string;
  genre: string;
  subgenres: string[];
  tags: string[];
  description: string;
  rating?: string | number;
  similarGames: SimilarGameRef[]; // 🔄 Переименовал
  similarGamesSummary: string[];  // 🔄 Переименовал
  slug?: string;
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
  filterMode: 'AND' | 'OR';
}
