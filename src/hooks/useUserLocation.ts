import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type Coords = { latitude: number; longitude: number };

// Hämtar användarens position en gång.
// coords är null om användaren inte gett tillgång till sin position, eller om den inte gick att hämta.
// Skärmen får själv välja om den ska använda FALLBACK_COORDS då.
export function useUserLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const position = await Location.getCurrentPositionAsync({});
        if (cancelled) return;
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      } catch {
        // Ingen position, coords förblir null
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { coords, loading }; // returnerar positionen (eller null) och om vi fortfarande väntar på den
}
