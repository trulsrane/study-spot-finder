import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ClusteredMapView from 'react-native-map-clustering';
import { Marker, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNearbyPlaces } from '@/src/hooks/useNearbyPlaces';
import { Place } from '@/src/types/place';
import { Link,useLocalSearchParams,useRouter } from 'expo-router';
import { spacing } from '@/src/theme';
import { colors, radius, type } from '@/src/theme';


// Fallback region if location permission is denied or not available.
const fallbackRegion = {
  latitude: 63.8258,
  longitude: 20.2630,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

// Full bleed map så att den tar upp hela skärmen.
export default function Map() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {places} = useNearbyPlaces();
  const [locationGranted, setLocationGranted] = useState(false);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const { focus } = useLocalSearchParams<{ focus?: string }>(); // Hook som renderar om map om focus har ett värde

  // Request location permission and set the initial region based on the user's location or fallback region.
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocationGranted(granted);
	  // If granted, get the user's current position and set the initial region accordingly. Otherwise, use the fallback region.
      if (granted) {
        const position = await Location.getCurrentPositionAsync({});
        setInitialRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        });
      } else {
        setInitialRegion(fallbackRegion);
      }
    })();
  }, []);

  // Körs vid anrop på platsinfo från en annan sida än maps. T.ex. favoritplatser
  // Hade eventuellt kunna lägga till så att kartan centreras över markören som motsvarar platsen
  useEffect(() => {
    if (!focus) return; // körs endast om focus har ett värde
    router.setParams({ focus: undefined }); // rensar focus så att hooken inte körs varje gång man öppnar maps
    router.push({ pathname: '/place/[id]', params: { id: focus } }); // öppnar modalen
  }, [focus]); // Gör så att den körs varje gång focus ändras


	// If the initial region is not set yet, render an empty view to avoid rendering the map prematurely.
  if (!initialRegion) {
    return <View style={styles.container} />;
  }

  // Function to handle opening a place's detail view. If the router can go back, it navigates back first before pushing the new route.
  const openPlace = (id: string) => {
    if (router.canGoBack()) {
      router.back();
    }
    router.push({ pathname: '/place/[id]', params: { id } });
  };

  // Render the clustered map view with markers for each nearby place. When a cluster is pressed, it navigates to a cluster detail view with the IDs of the places in that cluster.
  return (
    <View style={styles.container}>
      <ClusteredMapView
        style={styles.map}
        showsUserLocation={locationGranted}
        showsMyLocationButton={locationGranted}
        initialRegion={initialRegion}
        radius={60} // Cluster radius in pixels
		// When a cluster is pressed, find the matching place IDs and navigate to the cluster detail view.
        onClusterPress={(cluster, markers) => {
          const matchedIds = (markers ?? [])
            .map((marker: any) => {
              const coord = marker.properties?.coordinate; 
              return places.find(
                (p) => p.latitude === coord?.latitude && p.longitude === coord?.longitude 
              );
            })
            .filter((p): p is Place => Boolean(p))
            .map((p) => p.id);
			
			if  (router.canGoBack()){
				router.back();
			}
			// Navigate to the cluster detail view with the matched place IDs as a comma-separated string in the query parameters.
			router.push({
            pathname: '/place/[id]',
            params: { id: 'cluster', ids: matchedIds.join(',') },
          });
        }}
      >
		{/* Render a marker for each nearby place. When a marker is pressed, it opens the place's detail view. */}
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            title={place.name}
            description={place.address}
            onPress={() => openPlace(place.id)}
          />
        ))}
      </ClusteredMapView>
	  <Link
 		href={{ pathname: '/place/[id]', params: { id: 'kulturbageriet' } }}
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