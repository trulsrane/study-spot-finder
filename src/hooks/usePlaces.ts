import { useEffect, useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { Place } from '@/src/types/db';

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase.from('places').select('*');
      if (cancelled) return;
      if (error) setError(error.message);
      else setPlaces(data ?? []);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, []);

  return { places, loading, error };
}