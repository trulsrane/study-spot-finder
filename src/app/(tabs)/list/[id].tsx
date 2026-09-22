import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { usePlace } from '@/src/hooks/usePlaces';
import { colors, spacing, type } from '@/src/theme';

// Detaljsidan som pushas från listan. Visar alla fält i Place just nu, ta bort de rader ni inte vill ha.
export default function PlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { place } = usePlace(id);

  if (!place) return <Text style={styles.missing}>Hittade ingen plats med id {id}</Text>;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{place.name}</Text>
      <Text style={styles.row}>Id: {place.id}</Text>
      <Text style={styles.row}>Adress: {place.address ?? '—'}</Text>
      <Text style={styles.row}>Byggnad: {place.building ?? '—'}</Text>
      <Text style={styles.row}>Våning: {place.floor ?? '—'}</Text>
      <Text style={styles.row}>Öppettider: {place.openingHours ?? '—'}</Text>
      <Text style={styles.row}>Beläggning: {place.busyness}</Text>
      <Text style={styles.row}>Uppdaterad: {place.busynessUpdatedAt ?? '—'}</Text>
      <Text style={styles.row}>Faciliteter: {place.amenities.join(', ') || '—'}</Text>
      <Text style={styles.row}>Latitud: {place.latitude}</Text>
      <Text style={styles.row}>Longitud: {place.longitude}</Text>
      <Text style={styles.row}>Bild: {place.imageUrl ?? '—'}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  missing: {
    ...type.body,
    color: colors.textMuted,
    padding: spacing.lg,
  },
  row: {
    ...type.body,
    color: colors.text,
    marginTop: spacing.sm,
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  title: {
    ...type.title,
    color: colors.text,
    marginBottom: spacing.sm,
  },
});
