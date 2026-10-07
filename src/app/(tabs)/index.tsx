import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import ClusteredMapView from 'react-native-map-clustering';
import MapView, { LatLng, Marker, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMapPlaces } from '@/src/hooks/useMapPlaces';
import { useUserLocation } from '@/src/hooks/useUserLocation';
import { useSession } from '@/src/hooks/useSession';
import { FALLBACK_COORDS } from '@/src/constants';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radius, spacing, type } from '@/src/theme';
import { MapSearchBar } from '@/src/components/MapSearchBar';



const fallbackRegion = {
  ...FALLBACK_COORDS,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function Map() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const session = useSession();
  const { places, refetch } = useMapPlaces();
  const { coords, loading: locationLoading } = useUserLocation();
  const [focusedId, setFocusedId] = useState<string | null>(null);
  // Positionen för en plats som håller på att läggas till (den gröna markören)
  const [draft, setDraft] = useState<LatLng | null>(null);
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const mapRef = useRef<MapView>(null);

  const locationGranted = coords !== null;
  // useMemo så att initialRegion inte blir ett nytt objekt varje render (den används i fokus-effekten nedan)
  const initialRegion = useMemo<Region | null>(() => {
    if (locationLoading) return null;
    return coords ? { ...coords, latitudeDelta: 0.08, longitudeDelta: 0.08 } : fallbackRegion;
  }, [locationLoading, coords]);

  // Hämtar om platserna när man kommer tillbaka till kartan, t.ex. efter att ha lagt till en plats.
  // Hoppar över första gången eftersom usePlaces redan hämtar när kartan öppnas.
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      refetch();
    }, [refetch])
  );

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

  // Långtryck på kartan sätter ut en grön markör där den nya platsen ska ligga
  const startDraft = (coordinate: LatLng) => {
    if (!session) {
      Alert.alert('Logga in', 'Du måste vara inloggad för att lägga till en plats.');
      return;
    }
    setDraft(coordinate);
  };

  // Öppnar formuläret med markörens position
  const confirmDraft = () => {
    if (!draft) return;
    router.push({
      pathname: '../place/newPlace',
      params: { lat: String(draft.latitude), lng: String(draft.longitude) },
    });
    setDraft(null);
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
        onLongPress={(e) => startDraft(e.nativeEvent.coordinate)}
        onClusterPress={(cluster, markers) => {
          const matchedIds = (markers ?? [])
            .map((marker: any) => {
              const coord = marker.properties?.coordinate;
              return places.find(
                (p) => p.latitude === coord?.latitude && p.longitude === coord?.longitude
              );
            })
            .filter((p): p is NonNullable<typeof p> => p !== undefined)
            .map((p) => p.id);

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

        {draft && (
          <Marker
            key="draft"
            coordinate={draft}
            pinColor="green"
            draggable
            onDragEnd={(e) => setDraft(e.nativeEvent.coordinate)}
          />
        )}
      </ClusteredMapView>

      <View style={[styles.searchBar, { top: insets.top + spacing.sm }]}>
        <MapSearchBar onSelect={(place) => router.setParams({ focus: place.id })} />
      </View>

      {draft && (
        <View style={[styles.draftBar, { bottom: insets.bottom + spacing.sm }]}>
          <Text style={styles.draftHint}>Dra markören för att justera platsen</Text>
          <View style={styles.draftButtons}>
            <Pressable style={[styles.draftButton, styles.cancelButton]} onPress={() => setDraft(null)}>
              <Text style={styles.buttonText}>Avbryt</Text>
            </Pressable>
            <Pressable style={[styles.draftButton, styles.addButton]} onPress={confirmDraft}>
              <Text style={styles.buttonText}>Add place</Text>
            </Pressable>
          </View>
        </View>
      )}
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
  draftBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.buttonBackground,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  draftHint: {
    ...type.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  draftButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  draftButton: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
  },
  addButton: {
    backgroundColor: colors.greenButtonBackground,
  },
  buttonText: {
    ...type.buttonText,
    color: colors.text,
  },
});
