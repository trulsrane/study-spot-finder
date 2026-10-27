import { useMemo, useState } from 'react';
import { Link, Stack } from 'expo-router';
import { FlatList, StyleSheet, Text } from 'react-native';

import { usePlaces } from '@/src/hooks/usePlaces';
import { useFavorites } from '@/src/hooks/useFavorites';
import { useUserLocation } from '@/src/hooks/useUserLocation';
import { colors, spacing, type, radius } from '@/src/theme';
import { Card } from '@/src/components/CardContainer';
import { translatePlaceToInfoCards } from '@/src/utils/translatePlaceToInfoCards';
import { createPlaceSearcher, searchPlaces } from '@/src/scripts/searchPlaces';

// Listan visar alla platser, så radien är stor nog för att alla i Umeå ska få ett avstånd
const DISTANCE_RADIUS_METERS = 50_000;

export default function List() {
  // Avstånden dyker upp när positionen är hämtad. Utan position visas listan utan avstånd.
  const { coords } = useUserLocation();
  const { places, loading: placesLoading, error: placesError } = usePlaces(coords, DISTANCE_RADIUS_METERS);
  const { favorites, loading: favoritesLoading, error: favoritesError, isFavorite, toggleFavorite } = useFavorites();
  const [query, setQuery] = useState('');

  // Närmast först. Platser utan avstånd (t.ex. när positionen saknas) hamnar sist.
  const placesByDistance = useMemo(
    () => [...places].sort((a, b) => (a.distance_meters ?? Infinity) - (b.distance_meters ?? Infinity)),
    [places],
  );

  const fuse = useMemo(() => createPlaceSearcher(places), [places]);
  // Under två tecken söks det inte, då visas hela listan som vanligt.
  // Sökträffarna behåller sökningens ordning, så att bästa träffen hamnar först.
  const isSearching = query.trim().length >= 2;
  const visiblePlaces = useMemo(
    () => (isSearching ? searchPlaces(fuse, query, places.length) : placesByDistance),
    [isSearching, fuse, query, places.length, placesByDistance],
  );

  // Utan position går listan inte att sortera på avstånd, då står det bara "All places"
  const subtitle = isSearching ? 'Search results:' : coords ? 'Places near you:' : 'All places:';

  const loading = placesLoading || favoritesLoading;
  const error = placesError ?? favoritesError;

  if (loading) return <Text style={styles.message}>Loading...</Text>;
  if (error) return <Text style={styles.message}>{error}</Text>;

  return (
    <>
    {/* iOS inbyggda sökfält i headern, under den stora titeln. Filtrerar listan medan man skriver. */}
    <Stack.Screen
      options={{
        headerSearchBarOptions: {
          placeholder: 'Search place...',
          autoCapitalize: 'none',
          onChangeText: (e) => setQuery(e.nativeEvent.text),
          onCancelButtonPress: () => setQuery(''),
        },
      }}
    />
    <FlatList
      data={visiblePlaces}
      keyExtractor={(place) => place.id}
      // FlatList ritar bara om när data ändras, så favorites måste skickas med för att hjärtat ska uppdateras.
      extraData={favorites}
      // Utan detta hamnar innehållet bakom den genomskinliga headern med stor titel.
      contentInsetAdjustmentBehavior="automatic"
	  style={styles.list}
	  contentContainerStyle={styles.listContent}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={<Text style={styles.subtitle}>{subtitle}</Text>}
      ListEmptyComponent={<Text style={styles.message}>{isSearching ? 'No results' : 'No places yet'}</Text>}
      renderItem={({ item }) => (
        // asChild gör att Pressable blir den klickbara ytan, istället för Links egen Text.
        <Link href={{ pathname: '/list/[id]', params: { id: item.id } }} asChild>
          <Card
            {...translatePlaceToInfoCards(item)}
			image={item.image_urls?.[0]}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        </Link>
      )}
    />
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.background,
    flex: 1,
  },
  
// För mycket padding?
// kolla med alla andra för att se vad de tycker :)
  listContent: {
	padding: spacing.md,
  },
  message: {
    ...type.body,
    color: colors.textMuted,
    padding: spacing.lg,
  },
  // Rubriken ovanför listan, t.ex. "Places near you:"
  subtitle: {
    ...type.heading,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  meta: {
    ...type.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  name: {
    ...type.heading,
    color: colors.text,
  },
  row: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    padding: spacing.md,
  },
  
});
