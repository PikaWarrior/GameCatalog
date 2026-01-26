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
  
  // Картинки и ссылки
  header_image?: string;
  image?: string;
  steam_url?: string;
  url?: string;
  
  // Твои конкретные поля
  genre: string;          // Одиночная строка! (Например: "RPG")
  subgenres: string[];    // Массив строк! (Например: ["Action", "Indie"])
  tags: string[];         // Массив строк!
  
  coop?: string;          // Может быть в JSON
  
  description?: string;
  short_description?: string;
  
  rating?: string | number;
  review_score?: string | number;
  
  similar_games?: SimilarGameRef[];
}

// ВНУТРЕННИЙ ФОРМАТ (React использует это)
export interface Game {
  id: string;
  name: string;
  image: string;
  steam_url: string;
  
  coop: string;
  genre: string;       // Главный жанр
  subgenres: string[]; // Список поджанров
  tags: string[];      // Список тегов
  
  description: string;
  rating?: string | number;
  similar_games: SimilarGameRef[];
}

export interface ProcessedGame extends Game {
  searchableText: string;
  normalizedCoop: string;
  normalizedGenre: string; // Для сортировки
  sanitizedDescription: string;
}

// ... Остальные интерфейсы (FilterState и т.д.) оставляем как есть
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
