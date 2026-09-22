import { mockPlaces } from '@/src/data/mockPlaces';
import { Place } from '@/src/types/place';

type PlacesResult = {
  places: Place[];
  loading: boolean;
  error: string | null;
};

type PlaceResult = {
  place: Place | undefined;
  loading: boolean;
  error: string | null;
};

export function usePlaces(): PlacesResult {
  return { places: mockPlaces, loading: false, error: null };
}

export function usePlace(id: string): PlaceResult {
  const place = mockPlaces.find((p) => p.id === id);
  return { place, loading: false, error: null };
}