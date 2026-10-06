import { useEffect, useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { Profile, ProfileUpdate } from '@/src/types/db';
import { useSession } from '@/src/hooks/useSession';

// Profilen för den inloggade användaren. Utan inloggning är profile null.
export function useProfile() {
  const userId = useSession()?.user.id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Inte inloggad: ingen profil att hämta
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

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

  // Returnerar ett felmeddelande, eller null om det gick bra.
  async function updateProfile(updates: ProfileUpdate) {
    if (!userId) return 'Du måste vara inloggad';
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    return error ? error.message : null; // returnerar felmeddelande om det finns ett, annars null. null betyder att det gick bra.
  }

  return { profile, loading, error, updateProfile }; // returnerar profilen, laddningsstatus, eventuellt felmeddelande och funktionen för att uppdatera profilen
}
