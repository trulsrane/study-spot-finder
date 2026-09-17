import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';

import { spacing, type } from '@/src/theme';

// Hårdkodade exempelplatser. Byts ut mot supabase-data i nästa steg. Varje plats har ett id som används för att navigera till en detaljvy.
const PLACES = [
  { id: '1', name: 'Kulturbageriet' },
  { id: '2', name: 'Trädgården i MIT' },
  { id: '3', name: 'Naturhuset' },
];

export default function List() {
  return (
    <FlatList
      data={PLACES}
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
    backgroundColor: 'white',
    flex: 1,
  },
  name: type.body,
  row: {
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    padding: spacing.md,
  },
});
