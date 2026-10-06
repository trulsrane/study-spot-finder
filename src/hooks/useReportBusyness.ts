import { useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { BusynessReportInsert, BusynessReport} from '@/src/types/db';

export function useReportBusyness() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reportBusyness(input: BusynessReportInsert): Promise<BusynessReport | null> {
    setSaving(true);
    setError(null);           // nollställ innan nytt försök

    const { data, error } = await supabase
      .from('busyness_reports')
      .insert(input)
      .select()               
      .single();              

    setSaving(false);

    if (error) {
      setError(error.message);
      return null;            
    }

    return data;              
  }

  return { reportBusyness, saving, error };
}