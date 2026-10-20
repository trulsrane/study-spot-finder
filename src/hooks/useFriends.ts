import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { useSession } from '@/src/hooks/useSession';
import { Friendship, Profile } from '@/src/types/db';

type FriendProfile = Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>;

// En rad i friendships plus profilen för den andra personen (inte jag)
export type FriendshipWithProfile = Friendship & { other: FriendProfile | null };

export function useFriends() {
  const userId = useSession()?.user.id;
  const [rows, setRows] = useState<FriendshipWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Samma knep som i usePlaces: när reloadKey ändras hämtas listan igen
  const [reloadKey, setReloadKey] = useState(0);
  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!userId) { setRows([]); setLoading(false); return; }
    let cancelled = false;

    (async () => {
      // friendships pekar på profiles två gånger, så vi måste säga vilken nyckel som ska följas
      const { data, error } = await supabase
        .from('friendships')
        .select(`*,
          requester:profiles!friendships_requester_id_fkey(id, username, display_name, avatar_url),
          addressee:profiles!friendships_addressee_id_fkey(id, username, display_name, avatar_url)`)
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`) // RLS gör detta redan, men en extra spärr skadar inte
        .order('created_at', { ascending: false });
      if (cancelled) return;
      setError(error ? error.message : null); // nollställ gammalt fel när det går bra igen
      if (!error) {
        setRows((data ?? []).map(({ requester, addressee, ...f }) => ({
          ...f,
          other: f.requester_id === userId ? addressee : requester, // den andra personen, inte jag
        })));
      }
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [userId, reloadKey]);

  const friends = rows.filter((r) => r.status === 'accepted');
  const incoming = rows.filter((r) => r.status === 'pending' && r.addressee_id === userId);
  const outgoing = rows.filter((r) => r.status === 'pending' && r.requester_id === userId);

  // Returnerar { error, info }. info är texten från databasen, "Friend request sent!" eller "You are now friends!"
  async function sendRequest(username: string) {
    const { data, error } = await supabase.rpc('send_friend_request', { target_username: username });
    refetch();
    return { error: error ? error.message : null, info: error ? null : (data as string) };
  }

  // Returnerar ett felmeddelande, eller null om det gick bra (samma mönster som useProfile)
  async function acceptRequest(id: string) {
    const { error } = await supabase.rpc('accept_friend_request', { request_id: id });
    // Flytta raden direkt så att den inte går att trycka på igen, hämta sedan om (även vid fel)
    if (!error) setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'accepted' } : r)));
    refetch();
    return error ? error.message : null;
  }

  // Används för att avböja, ångra en skickad förfrågan och ta bort en vän
  async function removeFriendship(id: string) {
    const { error } = await supabase.rpc('remove_friendship', { friendship_id: id });
    if (!error) setRows((prev) => prev.filter((r) => r.id !== id));
    refetch();
    return error ? error.message : null;
  }

  return { friends, incoming, outgoing, loading, error, refetch, sendRequest, acceptRequest, removeFriendship };
}
