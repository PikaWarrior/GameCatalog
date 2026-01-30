export interface SimilarGameRef {
  id?: string | number;
  name: string;
  image: string;
  url?: string;
}

export interface RawGame {
  id?: string | number;
  name: string;
  headerimage?: string;
  image?: string;
  steamurl?: string;
  url?: string;
  genre: string;
  subgenres: string[];
  tags: string[];
  coop?: string;
  description?: string;
  shortdescription?: string;
  aboutthegame?: string;
  rating?: string | number;
  reviewscore?: string | number;
  similargames?: SimilarGameRef[];
  similargamessummary?: string;
}

export interface Game {
  id: string;
  name: string;
  image: string;
  steamurl: string;
  coop: string;
  genre: string;
  subgenres: string[];
  tags: string[];
  description: string;
  rating?: string | number;
  similargames: SimilarGameRef[];
  similargamessummary: string;
}

export interface ProcessedGame extends Game {
  searchableText: string;
  normalizedCoop: string;
  normalizedGenre: string;
  sanitizedDescription: string;
  slug: string; // 🆕 Добавлено для ссылок
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
  filterMode: 'AND' | 'OR'; // 🆕 Режим фильтрации
}
