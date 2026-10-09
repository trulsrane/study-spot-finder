import { useEffect, useState } from 'react';

import { Place } from '@/src/types/db';
import { fetchNearbyStudySpots } from '@/src/utils/googlePlaces';
import { useUserLocation } from '@/src/hooks/useUserLocation';
import { FALLBACK_COORDS } from '@/src/constants';


type PlacesResult = {
  places: Place[];
  loading: boolean;
  error: string | null;
};


// Hook to fetch nearby study spots based on the user's current location
export function useNearbyPlaces(): PlacesResult {
  const { coords, loading: locationLoading } = useUserLocation();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

	// Fetch nearby study spots based on the user's current location
  useEffect(() => {
    if (locationLoading) return; // wait until we know where the user is
    const { latitude, longitude } = coords ?? FALLBACK_COORDS;

    (async () => {
      try {
        const result = await fetchNearbyStudySpots(latitude, longitude);
        setPlaces(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    })();
  }, [locationLoading, coords]);

	return { places, loading, error };

}

export function useNearbyPlace(id: string) {
  const { places, loading, error } = useNearbyPlaces();
  const place = places.find((p) => p.id === id);
  return { place, loading, error };
}