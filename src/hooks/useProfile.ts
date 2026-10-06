import { useEffect, useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { Profile, ProfileUpdate } from '@/src/types/db';

export function useProfile(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // returnerar null om det inte finns någon profil med det id:t
      if (cancelled) return;
      if (error) setError(error.message);
      else setProfile(data);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [userId]);

  return { profile, loading, error }; // returnerar profilen, laddningsstatus och eventuellt felmeddelande
}

// Returnerar ett felmeddelande, eller null om det gick bra.
export async function updateProfile(userId: string, updates: ProfileUpdate) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  return error ? error.message : null; // returnerar felmeddelande om det finns ett, annars null. null betyder att det gick bra.
}
