import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { spacing, type } from '@/src/theme';

// Full bleed map så att den tar upp hela skärmen.
export default function Map() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Map goes here</Text>
      <Link href={{ pathname: '/place/[id]', params: { id: '1' } }} style={styles.link}>
        Open an example place
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    flex: 1,
    justifyContent: 'center',
  },
  link: {
    ...type.body,
    color: '#2563eb',
    marginTop: spacing.sm,
  },
  placeholder: {
    ...type.title,
    color: '#6b7280',
  },
});
