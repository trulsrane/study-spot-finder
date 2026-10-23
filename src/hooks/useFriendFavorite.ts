import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/src/utils/supabase';

// place_id:n som en given användare har sparat i saved_places. Bara läsning.
export function useFriendFavorite(userId?: string) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useFocusEffect(useCallback(() => {
    if (!userId) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('saved_places')
        .select('place_id')
        .eq('user_id', userId);
      if (cancelled) return;
      if (error) setError(error.message);
      else setFavorites((data ?? []).map((row) => row.place_id));
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [userId, reloadKey]));

  return { favorites, loading, error, refetch };
}