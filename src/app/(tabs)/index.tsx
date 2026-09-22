import { Link } from 'expo-router';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, type } from '@/src/theme';

// Full bleed map så att den tar upp hela skärmen.
export default function Map() {
  const insets = useSafeAreaInsets();
  const [locationGranted, setLocationGranted] = useState(false);

  useEffect(() => {
	(async () => {
	  const { status } = await Location.requestForegroundPermissionsAsync();
	  setLocationGranted(status === 'granted');
	})();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
		showsUserLocation={locationGranted}
		showsMyLocationButton={locationGranted}
        initialRegion={{
          latitude: 63.8258,
          longitude: 20.2630,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      />
      <Link
        href={{ pathname: '/place/[id]', params: { id: '1' } }}
        style={{
          ...styles.link,
          bottom: insets.bottom + spacing.xl * 2,
        }}
      >
        Open an example place
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  link: {
    ...type.body,
    color: colors.tint,
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
});