import { Place } from '@/src/types/place';

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

type GooglePlace = {
  id: string;
  displayName: { text: string };
  location: { latitude: number; longitude: number };
  formattedAddress: string;
};
// Fetches nearby study spots (cafes, libraries, universities) from the Google Places API
export async function fetchNearbyStudySpots(
  latitude: number,
  longitude: number
): Promise<Place[]> {
  const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY!,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.formattedAddress',
    },
	// Request body for the Google Places API call
    body: JSON.stringify({
      includedTypes: ['cafe', 'library', 'university'],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius: 5000,
        },
      },
    }),
  });
  const data = await response.json();
  const googlePlaces = (data.places ?? []) as GooglePlace[];

  return googlePlaces.map((googlePlace) => ({
    id: googlePlace.id,
    name: googlePlace.displayName.text,
    latitude: googlePlace.location.latitude,
    longitude: googlePlace.location.longitude,
    address: googlePlace.formattedAddress,
    busyness: 'unknown',
    amenities: [],
  }));
}