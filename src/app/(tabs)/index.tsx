import { Link, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ClusteredMapView from 'react-native-map-clustering';
import { Marker, Region } from 'react-native-maps'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNearbyPlaces } from '@/src/hooks/useNearbyPlaces';
import { colors, radius, spacing, type } from '@/src/theme';

// Fallback region if location permission is denied or not available.
const fallbackRegion ={
latitude: 63.8258,
  longitude: 20.2630,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

// Full bleed map så att den tar upp hela skärmen.
export default function Map() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
 const { places, loading, error } = useNearbyPlaces();
  // State to track if location permission is granted and the initial region for the map.
  const [locationGranted, setLocationGranted] = useState(false); 
  const [initialRegion, setInitialRegion] = useState < Region | null > (null);

// Request location permission and get the current position on component mount.
  useEffect(() => {
	(async () => {
	  const { status } = await Location.requestForegroundPermissionsAsync();
	  const granted = status === 'granted';
	  setLocationGranted(granted);
		// If permission is granted, get the current position and set the initial region for the map. Otherwise, use the fallback region.
	  if (granted) {
		const position = await Location.getCurrentPositionAsync({});
		setInitialRegion({
		  latitude: position.coords.latitude,
		  longitude: position.coords.longitude,
		  latitudeDelta: 0.08,
		  longitudeDelta: 0.08,
		});
		// If permission is denied, use the fallback region.
	  } else {
		setInitialRegion(fallbackRegion);
	  }

	})();
  }, []);
	// If the initial region is not set yet, render an empty view to avoid rendering the map with undefined region.
  if (!initialRegion) {
	return  <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <ClusteredMapView	
		style={styles.map}
		showsUserLocation={locationGranted}
		showsMyLocationButton={locationGranted}
		initialRegion={initialRegion} 
		radius={60}
        
      >
    {places.map((place) => (
			<Marker
				key={place.id}
				coordinate={{ latitude: place.latitude, longitude: place.longitude }}	
				title={place.name}
				description={place.address}
				onPress={() => {
					if (router.canGoBack()){
						router.back();
					}
					router.push({pathname: '/place/[id]', params: { id: place.id }});
				}}
			/>
		
		
    ))}
    </ClusteredMapView>
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