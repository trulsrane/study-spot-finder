import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { PopularTime } from '@/src/types/db';

// Hämtar snittet av trängselrapporterna per veckodag och timme (räknas ut i databasen, se popular_times).
// placeId är undefined för Google-platser, de har ingen historik hos oss
export function usePopularTimes(placeId?: string) {
  const [popularTimes, setPopularTimes] = useState<PopularTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Ökas för att hämta om, t.ex. när någon precis har rapporterat
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!placeId) { setLoading(false); return; }
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase.rpc('popular_times', { p_place_id: placeId });
      if (cancelled) return;
      if (error) setError(error.message);
      else setPopularTimes(data ?? []);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [placeId, reloadKey]);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return { popularTimes, loading, error, refetch };
}
