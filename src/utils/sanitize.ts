import sanitizeHtml from 'sanitize-html';
import { Game } from '../types';

export const sanitizeGameData = (game: any): Game => {
  return {
    ...game,
    // Безопасная очистка описания
    description: sanitizeHtml(game.description || '', {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li'],
      allowedAttributes: {}
    }),
    // Гарантируем массивы
    tags: Array.isArray(game.tags) ? game.tags : [],
    subgenres: Array.isArray(game.subgenres) ? game.subgenres : [],
    
    // Новые поля
    similar_games: Array.isArray(game.similar_games) ? game.similar_games : [],
    similar_games_summary: Array.isArray(game.similar_games_summary) ? game.similar_games_summary : [],
    steam_url: game.steam_url || '',
    image: game.image || ''
  };
};
