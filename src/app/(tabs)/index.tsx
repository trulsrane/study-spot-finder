import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { LatLng, Marker, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Host, Image } from '@expo/ui/swift-ui';
import { accessibilityLabel, frame, glassEffect, onTapGesture } from '@expo/ui/swift-ui/modifiers';
import { useMapPlaces } from '@/src/hooks/useMapPlaces';
import { useUserLocation } from '@/src/hooks/useUserLocation';
import { useSession } from '@/src/hooks/useSession';
import { FALLBACK_COORDS } from '@/src/constants';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radius, spacing, type } from '@/src/theme';
import { MapSearchBar } from '@/src/components/MapSearchBar';
import { PlaceMarker } from '@/src/components/PlaceMarker';
import { MapCompass } from '@/src/components/MapCompass';

// Storlek på de runda knapparna nere på kartan (kompassen och plus-knappen)
const MAP_BUTTON_SIZE = 56;
// Ungefärlig höjd på kartans logga och "Legal"-länk längst ner
const MAP_ATTRIBUTION_HEIGHT = 28;

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
  // Hur många grader kartan är vriden från norr, används för att snurra kompassen
  const [heading, setHeading] = useState(0);
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const mapRef = useRef<MapView>(null);
  // Sätts när den native kartan är klar. Innan dess kraschar anrop som getCamera().
  const mapReady = useRef(false);

  // Hämtar kartans kamera (mitt, vridning osv.), eller null om kartan inte är redo
  const getCameraSafely = async () => {
    if (!mapReady.current || !mapRef.current) return null;
    try {
      return await mapRef.current.getCamera();
    } catch {
      return null;
    }
  };

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
    // Markören för platsen visas större tills man trycker någon annanstans på kartan
    setFocusedId(id);
    if (router.canGoBack()) {
      router.back();
    }
    router.push({ pathname: '/place/[id]', params: { id } });
  };

  // Långtryck på kartan sätter ut en grön markör där den nya platsen ska ligga
  const startDraft = (coordinate: LatLng) => {
    if (!session) {
      Alert.alert('Log in', 'You need to be logged in to add a place.');
      return;
    }
    setDraft(coordinate);
  };

  // Plus-knappen sätter ut markören mitt på den del av kartan som syns just nu
  const startDraftAtCenter = async () => {
    const camera = await getCameraSafely();
    if (camera) startDraft(camera.center);
  };

  // Läser av kartans vridning medan man rör kartan
  const updateHeading = async () => {
    const camera = await getCameraSafely();
    if (camera) setHeading(camera.heading);
  };


  // Kompassen sätts till norr direkt så att den inte hänger efter medan kartan snurrar tillbaka.
  const resetNorth = () => {
    setHeading(0);
    mapRef.current?.animateCamera({ heading: 0, pitch: 0 }, { duration: 300 });
  };

  // Knapparna lyfts över kartans logga och "Legal"-länken längst ner, som inte får täckas
  const mapButtonBottom = insets.bottom + MAP_ATTRIBUTION_HEIGHT + spacing.sm;

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
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={locationGranted}
        showsMyLocationButton={locationGranted}
        // Den inbyggda kompassen går inte att flytta, så vi visar en egen till vänster
        showsCompass={false}
        onRegionChange={updateHeading}
        // Läser av en sista gång när kartan stannat, så att kompassen alltid visar rätt till slut
        onRegionChangeComplete={updateHeading}
        initialRegion={initialRegion}
        onMapReady={() => {
          mapReady.current = true;
        }}
        onPress={() => setFocusedId(null)}
        onLongPress={(e) => startDraft(e.nativeEvent.coordinate)}
      >
        {places.map((place) => (
          <PlaceMarker
            key={place.id}
            place={place}
            selected={place.id === focusedId}
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
      </MapView>

      {/* Kompass nere till vänster, i höjd med plus-knappen. Döljs när panelen för ny plats visas. */}
      {!draft && (
        <MapCompass
          heading={heading}
          size={MAP_BUTTON_SIZE}
          onPress={resetNorth}
          style={[styles.compass, { bottom: mapButtonBottom }]}
        />
      )}

      <View style={[styles.searchBar, { top: insets.top + spacing.sm }]}>
        <MapSearchBar onSelect={(place) => router.setParams({ focus: place.id })} />
      </View>

      {!draft &&
        (Platform.OS === 'ios' ? (
          // Liquid Glass-knapp, samma stil som sökfältet och tab-baren
          <Host matchContents style={[styles.addPlaceButtonHost, { bottom: mapButtonBottom }]}>
            <Image
              systemName="plus"
              size={22}
              color={colors.text}
              modifiers={[
                frame({ width: MAP_BUTTON_SIZE, height: MAP_BUTTON_SIZE }),
                glassEffect({ glass: { variant: 'regular', interactive: true }, shape: 'circle' }),
                accessibilityLabel('Add place'),
                onTapGesture(startDraftAtCenter),
              ]}
            />
          </Host>
        ) : (
          <Pressable
            style={[styles.addPlaceButton, { bottom: mapButtonBottom }]}
            onPress={startDraftAtCenter}
            accessibilityLabel="Add place"
          >
            <Ionicons name="add" size={28} color={colors.text} />
          </Pressable>
        ))}

      {draft && (
        <View style={[styles.draftBar, { bottom: mapButtonBottom }]}>
          <Text style={styles.draftHint}>Drag the marker to adjust the location</Text>
          <View style={styles.draftButtons}>
            <Pressable style={[styles.draftButton, styles.cancelButton]} onPress={() => setDraft(null)}>
              <Text style={styles.buttonText}>Cancel</Text>
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
  compass: {
    position: 'absolute',
    left: spacing.md,
  },
  addPlaceButtonHost: {
    position: 'absolute',
    right: spacing.md,
  },
  addPlaceButton: {
    position: 'absolute',
    right: spacing.md,
    width: MAP_BUTTON_SIZE,
    height: MAP_BUTTON_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.greenButtonBackground,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
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
