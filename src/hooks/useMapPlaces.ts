import {useMemo} from 'react';
import {useNearbyPlaces} from '@/src/hooks/useNearbyPlaces';
import {mockPlaces} from '@/src/data/mockPlaces';

// Hook to combine mock places with nearby places fetched from Google Places API
export function useMapPlaces() {
  const {places: googlePlaces, loading, error} = useNearbyPlaces();

  // Combine mock places with Google Places, ensuring no duplicates based on Google Place ID
  const places = useMemo(() => {
	const hardcodedGoogleIds = new Set (
		mockPlaces.map((p) => p.googlePlaceId).filter(Boolean)
	);
	// Filter out Google Places that have the same Google Place ID as any of the mock places
	const extra = googlePlaces.filter((p)=> !hardcodedGoogleIds.has(p.googlePlaceId));
	return [...mockPlaces, ...extra];
  }, [googlePlaces])
  return {places, loading, error};
} 