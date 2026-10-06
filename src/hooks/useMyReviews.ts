import { useEffect, useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { Review, Place } from '@/src/types/db';

// En recension plus platsen den gäller. `places` är ingen kolumn i reviews-tabellen,
// den kommer från join:en i select-strängen nedan.
export type ReviewWithPlace = Review & {
  places: Pick<Place, 'name'> | null;
};

// Alla recensioner som en användare har skrivit, nyast först.
export function useMyReviews(userId: string) {
  const [reviews, setReviews] = useState<ReviewWithPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, places(name)') // places(...) följer place_id till places-tabellen
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) setError(error.message);
      else setReviews(data ?? []);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [userId]);

  return { reviews, loading, error }; // returnerar användarens recensioner, laddningsstatus och eventuellt felmeddelande
}
