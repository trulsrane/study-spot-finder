import { useRouter } from 'expo-router';
import { FlatList, View, StyleSheet, Text } from 'react-native';

import { usePlaces } from '@/src/hooks/usePlaces';
import { colors, spacing, type } from '@/src/theme';
import { Card } from '@/src/components/CardContainer';
import { translatePlaceToInfoCards } from '@/src/utils/translatePlaceToInfoCards';
// const mockCards = [
// 	{ id: '1', title: 'Kulturbageriet', status: 'Öppet', tag: 'LUGNT', rating: 4.5, image: null, amenities: [] },
// 	{ id: '2', title: 'MIT-balkongen', status: 'Stängt', tag: 'MYCKET FOLK', rating: 4, image: null, amenities: [] },
// ]

export default function List() {
  const { places, loading, error } = usePlaces();

  if (loading) return <Text style={styles.message}>Laddar...</Text>;
  if (error) return <Text style={styles.message}>{error}</Text>;

  return (
	<View style={{flex: 1}}>
      <FlatList
        data={places}
        keyExtractor={(place) => place.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card
            {...translatePlaceToInfoCards(item)}
            onPress={() => useRouter().push(`/place/${item.id}`)}
          />
        )}
      />
    </View>
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
