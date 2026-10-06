import { useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { Place, PlaceInsert } from '@/src/types/db';

export function useAddPlace() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addPlace(input: PlaceInsert): Promise<Place | null> {
    setSaving(true);
    setError(null);           // nollställ innan nytt försök

    const { data, error } = await supabase
      .from('places')
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

  return { addPlace, saving, error };
}