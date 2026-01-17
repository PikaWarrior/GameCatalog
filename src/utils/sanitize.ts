import sanitizeHtml from 'sanitize-html';
import { Game } from '../types';

export const sanitizeGameData = (game: any): Game => {
  return {
    ...game,
    description: sanitizeHtml(game.description || '', {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li'],
      allowedAttributes: {}
    }),
    tags: Array.isArray(game.tags) ? game.tags : [],
    subgenres: Array.isArray(game.subgenres) ? game.subgenres : []
  };
};
