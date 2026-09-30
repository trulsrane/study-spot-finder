import { Link } from 'expo-router';
import { FlatList, StyleSheet, Text } from 'react-native';

import { usePlaces } from '@/src/hooks/usePlaces';
import { colors, spacing, type } from '@/src/theme';
import { Card } from '@/src/components/CardContainer';
import { translatePlaceToInfoCards } from '@/src/utils/translatePlaceToInfoCards';

// För att testa databasen
import { useEffect } from 'react';
import { supabase } from '@/src/utils/supabase';

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
  const { places, loading, error } = usePlaces();

  if (loading) return <Text style={styles.message}>Laddar...</Text>;
  if (error) return <Text style={styles.message}>{error}</Text>;

  return (
    <FlatList
      data={places}
      keyExtractor={(place) => place.id}
      // Utan detta hamnar innehållet bakom den genomskinliga headern med stor titel.
      contentInsetAdjustmentBehavior="automatic"
	  contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        // asChild gör att Pressable blir den klickbara ytan, istället för Links egen Text.
        <Link href={{ pathname: '/list/[id]', params: { id: item.id } }} asChild>
          <Card {...translatePlaceToInfoCards(item)} />
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
