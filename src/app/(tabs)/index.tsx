import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ClusteredMapView from 'react-native-map-clustering';
import MapView, { Marker, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMapPlaces } from '@/src/hooks/useMapPlaces';
import { Place } from '@/src/types/db';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radius, spacing, type } from '@/src/theme';
import { MapSearchBar } from '@/src/components/MapSearchBar';

const fallbackRegion = {
  latitude: 63.8258,
  longitude: 20.2630,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function Map() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { places } = useMapPlaces();
  const [locationGranted, setLocationGranted] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocationGranted(granted);
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

  // Körs när en annan sida (t.ex. profilen) vill visa en plats på kartan.
  useEffect(() => {
    if (!focus || !initialRegion) return;
    const place = places.find((p) => p.id === focus);
    if (!place) return;

    setFocusedId(place.id);
    const delta = 0.001;
    mapRef.current?.animateToRegion(
      {
        latitude: place.latitude - delta * 0.15,
        longitude: place.longitude,
        latitudeDelta: delta,
        longitudeDelta: delta,
      },
      500
    );
    router.setParams({ focus: undefined });
    router.push({ pathname: '/place/[id]', params: { id: place.id } });
  }, [focus, initialRegion, places]);

  if (!initialRegion) {
    return <View style={styles.container} />;
  }

  const openPlace = (id: string) => {
    if (router.canGoBack()) {
      router.back();
    }
    router.push({ pathname: '/place/[id]', params: { id } });
  };

  return (
    <View style={styles.container}>
      <ClusteredMapView
		clusteringEnabled={false}
        style={styles.map}
        showsUserLocation={locationGranted}
        showsMyLocationButton={locationGranted}
        initialRegion={initialRegion}
        radius={60}
        mapRef={(ref: any) => {
          mapRef.current = ref;
        }}
        onPress={() => setFocusedId(null)}
        onClusterPress={(cluster, markers) => {
          const matchedIds = (markers ?? [])
            .map((marker: any) => {
              const coord = marker.properties?.coordinate;
              return places.find(
                (p) => p.latitude === coord?.latitude && p.longitude === coord?.longitude
              );
            })
            .filter((p: Place | undefined): p is Place => Boolean(p))
            .map((p: Place) => p.id);

          if (router.canGoBack()) {
            router.back();
          }
          router.push({
            pathname: '/place/cluster',
            params: { ids: matchedIds.join(',') },
          });
        }}
      >
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            title={place.name}
            description={place.address ?? undefined}
            onPress={() => openPlace(place.id)}
          />
        ))}
      </ClusteredMapView>
	  <View style={[styles.searchBar, { top: insets.top + spacing.sm }]}>
		<MapSearchBar onSelect={(place) => router.setParams({ focus: place.id })} />
	  </View>
	
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
  searchBar: {
	position: 'absolute',
	left: spacing.md,
	right: spacing.md,
  },
});