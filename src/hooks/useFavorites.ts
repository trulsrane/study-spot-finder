import { useState, useCallback } from 'react';

export function useFavorites(initialFavorites: string[] = []) {
	const [favorites, setFavorites] = useState<string[]>(initialFavorites);

	const toggleFavorite = useCallback((platsid: string) => {
		setFavorites((prev) =>
			prev.includes(platsid) ? prev.filter((id) => id !== platsid) : [...prev, platsid]
		);
	}, []);

	const isFavorite = useCallback((platsid: string) => favorites.includes(platsid), [favorites]);

	return { toggleFavorite, isFavorite, favorites, setFavorites };
}