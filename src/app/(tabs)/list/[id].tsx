import { useLocalSearchParams } from 'expo-router';

import { PlaceDetails } from '@/src/components/PlaceDetails';

// Pushas på stacken när man klickar på en plats i listan. List-taben har sin egna stack, så tab-baren är fortfarande synlig.
export default function ListPlace() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <PlaceDetails id={id} />;
}
