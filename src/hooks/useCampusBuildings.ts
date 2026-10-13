import { useEffect, useState } from 'react';
import { Building, fetchCampusBuildings } from '@/src/utils/campusBuildings';

// Campusbyggnaderna från MazeMap. Går hämtningen fel blir listan tom,
// och då visas alla platser som vanliga markörer på kartan.
export function useCampusBuildings() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCampusBuildings()
      .then((result) => {
        if (!cancelled) setBuildings(result);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => { cancelled = true; };
  }, []);

  return { buildings, error };
}
