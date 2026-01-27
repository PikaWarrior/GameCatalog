import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useFavorites = () => {
  // Храним массив ID игр (строки)
  const [favorites, setFavorites] = useLocalStorage<string[]>('favorite_games_v1', []);

  const toggleFavorite = useCallback((gameId: string) => {
    setFavorites((prev) => {
      if (prev.includes(gameId)) {
        // Если уже есть - удаляем
        return prev.filter((id) => id !== gameId);
      } else {
        // Если нет - добавляем
        return [...prev, gameId];
      }
    });
  }, [setFavorites]);

  const isFavorite = useCallback((gameId: string) => {
    return favorites.includes(gameId);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite };
};
