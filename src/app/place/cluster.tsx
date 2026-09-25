import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useNearbyPlaces } from '@/src/hooks/useNearbyPlaces';
import { colors, radius, spacing, type } from '@/src/theme';

/**
 * Screen to display a list of places in a cluster. This is used when a cluster of markers is pressed on the map.
 * It retrieves the IDs of the places in the cluster from the query parameters and fetches the corresponding place data.	
 * @returns A FlatList of places in the cluster, each rendered as a TouchableOpacity that navigates to the place's detail view when pressed.
 */
export default function ClusterListScreen() {
  const { ids } = useLocalSearchParams<{ ids: string }>();
  const router = useRouter();
  const { places } = useNearbyPlaces();

  const idList = ids ? ids.split(',') : [];
  const clusterPlaces = places.filter((p) => idList.includes(p.id));

  const openPlace = (id: string) => {
    router.replace({ pathname: '/place/[id]', params: { id } });
  };

  return (
	// Render a FlatList of places in the cluster. Each place is rendered as a card with its name, address, and busyness. When a card is pressed, 
	// it navigates to the place's detail view.
	// The FlatList uses the place's ID as the key and applies styles for the screen, content, and individual cards.
	// The FlatList is wrapped in a View to provide a container for the list.

    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={clusterPlaces}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => openPlace(item.id)}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.address ?? '—'}</Text>
          <Text style={styles.cardBusyness}>{item.busyness}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  cardTitle: {
    ...type.heading,
    color: colors.text,
  },
  cardSubtitle: {
    ...type.body,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardBusyness: {
    ...type.caption,
    color: colors.tint,
    marginTop: spacing.xs,
  },
});