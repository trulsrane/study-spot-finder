import { useEffect, useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { Review, ReviewInsert, Profile } from '@/src/types/db';

// En recension plus författaren. `profiles` är ingen kolumn i reviews-tabellen,
// den kommer från join:en i select-strängen nedan.
export type ReviewWithAuthor = Review & {
  profiles: Pick<Profile, 'username' | 'display_name' | 'avatar_url'> | null;
};

export function useReviews(placeId: string) {
  const [reviews, setReviews] = useState<ReviewWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
  // räknar ut medelvärdet av alla betyg, avrundat till en decimal.
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  // Sparar en ny recension för platsen och lägger den först i listan om det gick bra.
  // Returnerar ett felmeddelande, eller null om det gick bra. Felet läggs inte i `error`,
  // så att skärmen inte byts ut mot felmeddelandet och det användaren skrivit försvinner.
  async function submitReview(input: Pick<ReviewInsert, 'user_id' | 'rating' | 'comment'>) {
    setSubmitting(true);

    const { data, error } = await supabase
      .from('reviews')
      .insert({ ...input, place_id: placeId })
      .select('*, profiles(username, display_name, avatar_url)') // samma join som ovan, så den nya recensionen också har info om användaren
      .single();

    setSubmitting(false);

    if (error) return error.message;
    setReviews((prev) => [data, ...prev]); // listan är sorterad nyast först
    return null;
  }

  return { reviews, averageRating, count: reviews.length, loading, error, submitReview, submitting }; // returnerar recensionerna, medelbetyget, antalet recensioner, laddningsstatus, eventuellt felmeddelande, samt funktionen för att skicka en recension
}
