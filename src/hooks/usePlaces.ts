import { useEffect, useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { Place } from '@/src/types/db';
import { Database } from '@/src/types/database.types';
import { Coords } from '@/src/hooks/useUserLocation';

type NearbyRow = Database['public']['Functions']['places_nearby']['Returns'][number];

// distance_meters räknas ut av places_nearby (PostGIS) i Supabase.
// Den är null när ingen position skickats in, eller när platsen ligger utanför radien.
export type PlaceWithDistance = Place & { distance_meters: number | null };

export function usePlaces(coords?: Coords | null, radiusMeters?: number) {
  const [places, setPlaces] = useState<PlaceWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Plockar ut talen så att effekten inte körs om varje gång skärmen skickar in ett nytt coords-objekt
  const lat = coords?.latitude;
  const lng = coords?.longitude;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Hämtar platserna och avstånden samtidigt. Avstånden hämtas bara om vi har en position.
      // Om radiusMeters är undefined används standardradien i SQL-funktionen.
      const [placesResult, nearbyResult] = await Promise.all([
        supabase
        .from('places')
        .select('*'),
        lat !== undefined && lng !== undefined
          ? supabase.rpc('places_nearby', { lat, lng, radius_meters: radiusMeters })
          : null,
      ]);
      if (cancelled) return;

      const error = placesResult.error ?? nearbyResult?.error;
      if (error) {
        setError(error.message);
      } else {
        // place_id -> avstånd i meter
        const distances = new Map<string, number>();
        ((nearbyResult?.data ?? []) as NearbyRow[]).forEach((row) => distances.set(row.id, row.distance_meters));

        setPlaces((placesResult.data ?? []).map((place: Place) => ({
          ...place,
          distance_meters: distances.get(place.id) ?? null,
        })));
      }
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [lat, lng, radiusMeters]);

  return { places, loading, error }; // returnerar en lista med alla platser (med avstånd om en position skickats in), samt laddningsstatus och eventuellt felmeddelande
}
