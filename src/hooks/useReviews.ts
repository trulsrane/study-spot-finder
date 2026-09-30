import { useEffect, useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { Review, Profile } from '@/src/types/db';

// En recension plus författaren. `profiles` är ingen kolumn i reviews-tabellen,
// den kommer från join:en i select-strängen nedan.
export type ReviewWithAuthor = Review & {
  profiles: Pick<Profile, 'username' | 'display_name' | 'avatar_url'> | null;
};

export function useReviews(placeId: string) {
  const [reviews, setReviews] = useState<ReviewWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(username, display_name, avatar_url)') // profiles(...) följer user_id till profiles-tabellen
        .eq('place_id', placeId)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) setError(error.message);
      else setReviews(data ?? []);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [placeId]);

  // null (inte 0) när det saknas recensioner, så skärmen kan skilja på "inga betyg" och "betyg 0".
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  return { reviews, averageRating, count: reviews.length, loading, error };
}
