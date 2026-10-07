//import { useMemo } from 'react';
import { usePlaces } from '@/src/hooks/usePlaces';
//import { useNearbyPlaces } from '@/src/hooks/useNearbyPlaces';

export function useMapPlaces() {
	return usePlaces();
}

/*export function useMapPlaces() {
  const { places: dbPlaces, loading: dbLoading, error: dbError } = usePlaces();
  const { places: googlePlaces, loading: googleLoading, error: googleError } = useNearbyPlaces();

  // useMemo så att listan bara byggs om när någon av källorna ändras
  const places = useMemo(() => [...dbPlaces, ...googlePlaces], [dbPlaces, googlePlaces]);
  const loading = dbLoading || googleLoading;
  const error = dbError ?? googleError;

  return { places, loading, error };
}
*/
