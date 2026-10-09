import { useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { CheckIn, CheckInInsert, CheckOut} from '@/src/types/db';

export function useCheckIn() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkIn(input: CheckInInsert): Promise<CheckIn | null> {
    setSaving(true);
    setError(null);           // nollställ innan nytt försök

    const { data, error } = await supabase
      .from('check_ins')
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

  return { checkIn, saving, error };
}

async function checkOut(checkInId: string): Promise<CheckOut | null> {
  const { data, error } = await supabase
    .from('check_ins')
    .update({ check_out_time: new Date().toISOString() })
    .eq('id', checkInId)
    .select()
    .single();
}