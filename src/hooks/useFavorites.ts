import { useState, useCallback } from 'react';
import { mockPlaces } from '@/src/data/mockPlaces';

const seededFavorites = mockPlaces.map((place) => place.id);

export function useFavorites(initialFavorites: string[] = seededFavorites) {
	const [favorites, setFavorites] = useState<string[]>(initialFavorites);

	const toggleFavorite = useCallback((platsid: string) => {
		setFavorites((prev) =>
			prev.includes(platsid) ? prev.filter((id) => id !== platsid) : [...prev, platsid]
		);
	}, []);

	const isFavorite = useCallback((platsid: string) => favorites.includes(platsid), [favorites]);

	return { toggleFavorite, isFavorite, favorites, setFavorites };
}