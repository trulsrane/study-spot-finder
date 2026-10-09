import { useEffect, useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { CheckIn, Profile} from '@/src/types/db';
import { useSession } from '@/src/hooks/useSession';

export type CheckInWithProfile = CheckIn & {
  profiles: Pick<Profile, 'username' | 'display_name' | 'avatar_url'> | null;
};

// placeId is undefined for Google places, which can't have check-ins
export function useCheckIns(placeId?: string) {
  const userId = useSession()?.user.id;
  const [checkIns, setCheckIns] = useState<CheckInWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!placeId) { setLoading(false); return; }
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*, profiles(username, display_name, avatar_url)')
        .eq('place_id', placeId)
        .is('checked_out_at', null);
      if (cancelled) return;
      if (error) setError(error.message);
      else setCheckIns(data ?? []);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [placeId]);

  const myCheckIn = checkIns.find((c) => c.user_id === userId);

  async function checkIn() {
    if (!userId) { setError('You need to be logged in to check in'); return; }
    if (!placeId) { setError('You can only check in to places in the database'); return; }
    setSaving(true);
    const { data, error } = await supabase
      .from('check_ins')
      .insert({ user_id: userId, place_id: placeId })
      .select('*, profiles(username, display_name, avatar_url)')
      .single();
    if (error) setError(error.message);
    else setCheckIns((prev) => [...prev, data]);
    setSaving(false);
  }
  async function checkOut() {
    if (!myCheckIn) { setError('You are not checked in'); return; }
    setSaving(true);
    const { error } = await supabase
      .from('check_ins')
      .update({ checked_out_at: new Date().toISOString() })
      .eq('id', myCheckIn.id);
    if (error) setError(error.message);
    else setCheckIns((prev) => prev.filter((c) => c.id !== myCheckIn.id)); // tas bort ur listan så knappen byter till "Check in"
    setSaving(false);
  }

  return { checkIns, myCheckIn, loading, error, saving, checkIn, checkOut };
}