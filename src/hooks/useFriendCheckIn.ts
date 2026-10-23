import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { useSession } from '@/src/hooks/useSession';
import { CheckInWithProfile } from '@/src/hooks/useCheckIns';

// Vänners pågående incheckningar per plats (place_id -> incheckningar, senast först).
// RLS släpper bara igenom vänner som delar sin plats, så appen behöver inte själv kolla vänskap.
export function useFriendCheckIns() {
  const userId = useSession()?.user.id;
  const [byPlace, setByPlace] = useState<Record<string, CheckInWithProfile[]>>({});
  const [reloadKey, setReloadKey] = useState(0);
  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!userId) { setByPlace({}); return; }
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*, profiles(username, display_name, avatar_url)')
        .is('checked_out_at', null)
        .neq('user_id', userId) // mina egna incheckningar syns också via RLS, men de ska inte visas som en vän
        .order('checked_in_at', { ascending: false });
      if (cancelled) return;
      if (error) { console.warn('Friend check-ins:', error.message); return; }

      const grouped: Record<string, CheckInWithProfile[]> = {};
      (data as CheckInWithProfile[]).forEach((c) => {
        if (!grouped[c.place_id]) grouped[c.place_id] = [];
        grouped[c.place_id].push(c);
      });
      setByPlace(grouped);
    })();

    return () => { cancelled = true; };
  }, [userId, reloadKey]);

  return { byPlace, refetch };
}
