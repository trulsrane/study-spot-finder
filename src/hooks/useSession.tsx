import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { Session } from '@supabase/supabase-js';

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Runs once straight away with the saved session, then on every login and logout
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (loading) return null; // wait until we know whether the user is logged in
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
