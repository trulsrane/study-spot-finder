import { useEffect, useState } from 'react';
import { supabase } from '@/src/utils/supabase';

// favorites är en lista med place_id:n från tabellen saved_places.
export function useFavorites(userId: string) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase.from('saved_places').select('place_id').eq('user_id', userId);
      if (cancelled) return;
      if (error) setError(error.message);
      else setFavorites((data ?? []).map((row) => row.place_id));
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [userId]);

  function isFavorite(placeId: string) {
    return favorites.includes(placeId);
  }

  // Sparar i databasen först, och uppdaterar listan bara om det gick bra.
  async function toggleFavorite(placeId: string) {
    if (isFavorite(placeId)) {
      const { error } = await supabase.from('saved_places').delete().eq('user_id', userId).eq('place_id', placeId);
      if (error) setError(error.message);
      else setFavorites((prev) => prev.filter((id) => id !== placeId));
    } else {
      const { error } = await supabase.from('saved_places').insert({ user_id: userId, place_id: placeId });
      if (error) setError(error.message);
      else setFavorites((prev) => [...prev, placeId]);
    }
  }

  return { favorites, loading, error, isFavorite, toggleFavorite };
}
