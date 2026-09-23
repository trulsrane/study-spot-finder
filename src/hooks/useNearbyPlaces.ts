import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

import { Place } from '@/src/types/place';
import { fetchNearbyStudySpots } from '@/src/utils/googlePlaces';


type PlacesResult = {
  places: Place[];
  loading: boolean;
  error: string | null;
};

const FALLBACK_COORDS = { latitude: 63.8258, longitude: 20.2630 };
// Hook to fetch nearby study spots based on the user's current location
export function useNearbyPlaces(): PlacesResult {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

	// Fetch nearby study spots based on the user's current location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        const coords =
          status === 'granted'
            ? await Location.getCurrentPositionAsync({}).then((pos) => pos.coords)
            : FALLBACK_COORDS;
		
        const result = await fetchNearbyStudySpots(coords.latitude, coords.longitude);
        setPlaces(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Något gick fel');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { places, loading, error };
}