import { Link } from 'expo-router';
import { FlatList, StyleSheet, Text } from 'react-native';

import { usePlaces } from '@/src/hooks/usePlaces';
import { useFavorites } from '@/src/hooks/useFavorites';
import { useUserLocation } from '@/src/hooks/useUserLocation';
import { colors, spacing, type } from '@/src/theme';
import { Card } from '@/src/components/CardContainer';
import { translatePlaceToInfoCards } from '@/src/utils/translatePlaceToInfoCards';

// För att testa databasen
import { useEffect } from 'react';
import { supabase } from '@/src/utils/supabase';

// Listan visar alla platser, så radien är stor nog för att alla i Umeå ska få ett avstånd
const DISTANCE_RADIUS_METERS = 50_000;

export default function List() {

  // För att testa connection med databasen
  useEffect(() => {
  supabase
    .from('places')
    .select('*')
    .then(({ data, error }) => {
      console.log('ERROR:', error);
      console.log('ROWS:', data?.length);
      console.log('FIRST:', data?.[0]);
    });
  }, []);
  // Avstånden dyker upp när positionen är hämtad. Utan position visas listan utan avstånd.
  const { coords } = useUserLocation();
  const { places, loading: placesLoading, error: placesError } = usePlaces(coords, DISTANCE_RADIUS_METERS);
  const { favorites, loading: favoritesLoading, error: favoritesError, isFavorite, toggleFavorite } = useFavorites();

  const loading = placesLoading || favoritesLoading;
  const error = placesError ?? favoritesError;

  if (loading) return <Text style={styles.message}>Loading...</Text>;
  if (error) return <Text style={styles.message}>{error}</Text>;

  return (
    <FlatList
      data={places}
      keyExtractor={(place) => place.id}
      // FlatList ritar bara om när data ändras, så favorites måste skickas med för att hjärtat ska uppdateras.
      extraData={favorites}
      // Utan detta hamnar innehållet bakom den genomskinliga headern med stor titel.
      contentInsetAdjustmentBehavior="automatic"
	  contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        // asChild gör att Pressable blir den klickbara ytan, istället för Links egen Text.
        <Link href={{ pathname: '/list/[id]', params: { id: item.id } }} asChild>
          <Card
            {...translatePlaceToInfoCards(item)}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.background,
    flex: 1,
  },
  message: {
    ...type.body,
    color: colors.textMuted,
    padding: spacing.lg,
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
