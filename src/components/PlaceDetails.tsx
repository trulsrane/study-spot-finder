import { StyleSheet, Text, View } from 'react-native';

import { spacing, type } from '@/src/theme';

// Används av listan och kartan för att visa detaljer om en plats. Innehållet är hårdkodat just nu, men kommer att bytas ut mot data från supabase i nästa steg.
export const PlaceDetails = ({ id }: { id: string }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Place {id}</Text>
      <Text style={styles.subtitle}>Opening hours, noise level, outlets, reviews</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    padding: spacing.lg,
  },
  subtitle: {
    ...type.body,
    color: '#6b7280',
    marginTop: spacing.sm,
  },
  title: type.title,
});
