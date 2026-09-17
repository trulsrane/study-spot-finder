import { useLocalSearchParams } from 'expo-router';

import { PlaceDetails } from '@/src/components/PlaceDetails';

// Opened from the map as a bottom sheet. The sheet options live in src/app/_layout.tsx.
export default function PlaceSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <PlaceDetails id={id} />;
}
