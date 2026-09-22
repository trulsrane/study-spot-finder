import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';

import { usePlaces } from '@/src/hooks/usePlaces';
import { colors, spacing, type } from '@/src/theme';

export default function List() {
  const { places, loading, error } = usePlaces();

  if (loading) return <Text style={styles.message}>Laddar...</Text>;
  if (error) return <Text style={styles.message}>{error}</Text>;

  return (
    <FlatList
      data={places}
      keyExtractor={(place) => place.id}
      // Utan detta hamnar innehållet bakom den genomskinliga headern med stor titel.
      contentInsetAdjustmentBehavior="automatic"
      style={styles.list}
      renderItem={({ item }) => (
        // asChild gör att Pressable blir den klickbara ytan, istället för Links egen Text.
        <Link href={{ pathname: '/list/[id]', params: { id: item.id } }} asChild>
          <Pressable style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
          </Pressable>
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
