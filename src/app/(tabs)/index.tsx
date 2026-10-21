import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import MapView, { LatLng, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMapPlaces } from '@/src/hooks/useMapPlaces';
import { useCampusBuildings } from '@/src/hooks/useCampusBuildings';
import { useUserLocation } from '@/src/hooks/useUserLocation';
import { useSession } from '@/src/hooks/useSession';
import { FALLBACK_COORDS } from '@/src/constants';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { spacing,colors } from '@/src/theme';
import { MapSearchBar } from '@/src/components/MapSearchBar';
import { PlaceMarker } from '@/src/components/PlaceMarker';
import { BuildingMarker } from '@/src/components/BuildingMarker';
import { MapCompass } from '@/src/components/MapCompass';
import { MAP_BUTTON_SIZE, MapAddButton } from '@/src/components/MapAddButton';
import { DraftPlaceBar } from '@/src/components/DraftPlaceBar';
import { BusynessLegend } from '@/src/components/BusynessLegend';
import { findBuilding } from '@/src/utils/campusBuildings';
import { pickVisibleLabels } from '@/src/utils/pickVisibleLabels';

// Ungefärlig höjd på kartans logga och "Legal"-länk längst ner
const MAP_ATTRIBUTION_HEIGHT = 28;
// Ungefärlig höjd på sökfältet högst upp, så att legenden kan läggas precis under det
const SEARCH_BAR_HEIGHT = 48;
// Namnen på platserna visas bara när man zoomat in så här långt (mindre värde = mer inzoomat)
const LABEL_ZOOM_DELTA = 0.01;

// Hus utan studieplatser visas bara när man zoomat in så här långt, annars blir campus fullt av bubblor
const SHOW_EMPTY_BUILDINGS_DELTA = 0.012;

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
  const { buildings } = useCampusBuildings();
  const { coords, loading: locationLoading } = useUserLocation();
  const [focusedId, setFocusedId] = useState<string | null>(null);
  // Positionen för en plats som håller på att läggas till (den gröna markören)
  const [draft, setDraft] = useState<LatLng | null>(null);
  // Hur många grader kartan är vriden från norr, används för att snurra kompassen
  const [heading, setHeading] = useState(0);
  const [zoomedIn, setZoomedIn] = useState(false);
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const mapRef = useRef<MapView>(null);
  // Sätts när den native kartan är klar. Innan dess kraschar anrop som getCamera().
  const mapReady = useRef(false);

  // Platserna som visar sitt namn just nu. Bara när man zoomat in, och bara namn som inte krockar.
  const [labelIds, setLabelIds] = useState<Set<string>>(new Set());
  // Senaste området kartan stannade på, så att namnen kan räknas om när platserna eller valet ändras
  const lastRegion = useRef<Region | null>(null);

  // Hämtar kartans kamera (mitt, vridning osv.), eller null om kartan inte är redo
  const getCameraSafely = async () => {
    if (!mapReady.current || !mapRef.current) return null;
    try {
      return await mapRef.current.getCamera();
    } catch {
      return null;
    }
  };

  // Platser inne i ett campushus visas som en siffra i husets bubbla, övriga som vanliga markörer
  const { placesOutside, countByBuilding } = useMemo(() => {
    // Vanligt objekt, eftersom komponenten heter Map och skuggar JavaScripts Map
    const counts: Record<string, number> = {};
    const outside: typeof places = [];
    places.forEach((place) => {
      const building = findBuilding(buildings, place.latitude, place.longitude);
      if (building) counts[building.id] = (counts[building.id] ?? 0) + 1;
      else outside.push(place);
    });
    return { placesOutside: outside, countByBuilding: counts };
  }, [places, buildings]);

  // Räknar ut vilka namn som får plats. Frågar kartan var varje markör hamnar på skärmen,
  // så att det blir rätt även när kartan är vriden.
  const updateLabels = async (region: Region) => {
    const map = mapRef.current;
    if (region.latitudeDelta >= LABEL_ZOOM_DELTA || !mapReady.current || !map) {
      setLabelIds(new Set());
      return;
    }
    // Bara platser i närheten av det som syns, så att vi inte frågar kartan om alla platser
    // Platser inne i ett hus har ingen egen markör, så de behöver inget namn
    const nearby = placesOutside.filter(
      (p) =>
        Math.abs(p.latitude - region.latitude) < region.latitudeDelta &&
        Math.abs(p.longitude - region.longitude) < region.longitudeDelta
    );
    try {
      const points = await Promise.all(
        nearby.map((p) => map.pointForCoordinate({ latitude: p.latitude, longitude: p.longitude }))
      );
      setLabelIds(pickVisibleLabels(nearby.map((place, i) => ({ place, point: points[i] })), focusedId));
    } catch {
      // Kartan kan ha försvunnit medan vi väntade, då struntar vi i att uppdatera
    }
  };

  // Den valda markören är större och får välja namn först, så räkna om när valet eller platserna ändras
  useEffect(() => {
    if (lastRegion.current) updateLabels(lastRegion.current);
  }, [placesOutside, focusedId]);

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

  // Öppnar planvyn för huset. En öppen platspanel stängs först, så att planvyn inte hamnar under den.
  const openBuilding = (id: string) => {
    setFocusedId(null);
    if (router.canGoBack()) {
      router.back();
    }
    router.push({ pathname: '/building/[id]', params: { id } });
  };

  // Långtryck på kartan sätter ut en grön markör där den nya platsen ska ligga
  const startDraft = (coordinate: LatLng) => {
    if (!session) {
      Alert.alert('Log in', 'You need to be logged in to add a place.');
      return;
    }
    setDraft(coordinate);
    mapRef.current?.animateCamera({ center: coordinate }, { duration: 300 });
  };

  // Plus-knappen börjar lägga till en plats mitt på den del av kartan som syns just nu
  const startDraftAtCenter = async () => {
    const camera = await getCameraSafely();
    if (camera) startDraft(camera.center);
  };

  // Läser av kartans vridning medan man rör kartan
  const updateHeading = async () => {
    const camera = await getCameraSafely();
    if (camera) setHeading(camera.heading);
  };

  // När kartan stannat: uppdatera kompassen, och om man håller på att lägga till en plats
  // är nålens position kartans nya mittpunkt
  const handleRegionChangeComplete = (region: Region) => {
    updateHeading();
    lastRegion.current = region;
    updateLabels(region);
    if (draft) setDraft({ latitude: region.latitude, longitude: region.longitude });
  };


  // Kompassen sätts till norr direkt så att den inte hänger efter medan kartan snurrar tillbaka.
  const resetNorth = () => {
    setHeading(0);
    mapRef.current?.animateCamera({ heading: 0, pitch: 0 }, { duration: 300 });
  };

  // Knapparna lyfts över kartans logga och "Legal"-länken längst ner, som inte får täckas
  const mapButtonBottom = insets.bottom + MAP_ATTRIBUTION_HEIGHT + spacing.sm;

  // Öppnar formuläret med nålens position. Läser kartans mittpunkt direkt, ifall kartan fortfarande rör sig.
  const confirmDraft = async () => {
    if (!draft) return;
    const position = (await getCameraSafely())?.center ?? draft;
    router.push({
      pathname: '../place/newPlace',
      params: { lat: String(position.latitude), lng: String(position.longitude) },
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
        onRegionChangeComplete={handleRegionChangeComplete}
        initialRegion={initialRegion}
        onMapReady={() => {
          mapReady.current = true;
        }}
        onPress={() => setFocusedId(null)}
        onLongPress={(e) => startDraft(e.nativeEvent.coordinate)}
      >
        {placesOutside.map((place) => (
          <PlaceMarker
            key={place.id}
            place={place}
            selected={place.id === focusedId}
            showLabel={labelIds.has(place.id)}
            onPress={() => openPlace(place.id)}
          />
        ))}

        {buildings.map((building) => {
          const count = countByBuilding[building.id] ?? 0;
          if (count === 0 && !zoomedIn) return null;
          return (
            <BuildingMarker
              key={building.id}
              building={building}
              count={count}
              onPress={() => openBuilding(building.id)}
            />
          );
        })}
      </MapView>

      {/* Nålen för en ny plats står still mitt på kartan, man flyttar och zoomar kartan under den.
          pointerEvents="none" så att man kan dra i kartan rakt genom nålen. */}
      {draft && (
        <View style={styles.draftPinLayer} pointerEvents="none">
          <View style={styles.draftPin}>
            <Ionicons name="location" size={DRAFT_PIN_SIZE} color={colors.busynessDotLow} />
          </View>
          {/* Liten prick som visar exakt var spetsen pekar */}
          <View style={styles.draftPinDot} />
		  

        </View>
      )}

      {/* Kompass nere till vänster, i höjd med plus-knappen. Döljs när panelen för ny plats visas. */}
      {!draft && (
        <MapCompass
          heading={heading}
          size={MAP_BUTTON_SIZE}
          onPress={resetNorth}
          style={[styles.compass, { bottom: mapButtonBottom }]}
        />
      )}

      {/* Förklaring till färgen på prickarna, uppe till vänster under sökfältet. Ligger före sökfältet
          så att träfflistan hamnar ovanpå. Döljs när man lägger till en plats. */}
      {!draft && (
        <BusynessLegend
          style={[styles.legend, { top: insets.top + spacing.sm + SEARCH_BAR_HEIGHT + spacing.sm }]}
        />
      )}

      <View style={[styles.searchBar, { top: insets.top + spacing.sm }]}>
        <MapSearchBar onSelect={(place) => router.setParams({ focus: place.id })} />
      </View>

      {!draft && (
        <MapAddButton onPress={startDraftAtCenter} style={[styles.addPlaceButton, { bottom: mapButtonBottom }]} />
      )}

      {draft && (
        <DraftPlaceBar
          hint="Move the map to place the pin"
          onCancel={() => setDraft(null)}
          onConfirm={confirmDraft}
          style={[styles.draftBar, { bottom: mapButtonBottom }]}
        />
      )}
    </View>
  );
}

const DRAFT_PIN_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  draftPinLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftPin: {
    position: 'absolute',
    // Ikonens spets ska peka på kartans mittpunkt, så den lyfts upp nästan en hel ikonhöjd
    transform: [{ translateY: -DRAFT_PIN_SIZE * 0.45 }],
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  draftPinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text,
    opacity: 0.5,
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
  legend: {
    position: 'absolute',
    left: spacing.md,
  },
  addPlaceButton: {
    position: 'absolute',
    right: spacing.md,
  },
  draftBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
  },
});
