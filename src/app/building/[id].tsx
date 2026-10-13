import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlaces } from '@/src/hooks/usePlaces';
import { useSession } from '@/src/hooks/useSession';
import { useCampusBuildings } from '@/src/hooks/useCampusBuildings';
import { MazeMapHandle, MazeMapView } from '@/src/components/MazeMapView';
import { MapAddButton } from '@/src/components/MapAddButton';
import { DraftPlaceBar } from '@/src/components/DraftPlaceBar';
import { defaultZ, findBuilding, floorToZ, zToFloorName } from '@/src/utils/campusBuildings';
import { MAZEMAP_CAMPUS_ID } from '@/src/constants';
import { colors, spacing, type } from '@/src/theme';
import { MapDraft, MapSpot, MazeMapConfig } from '@/src/types/mazemap';

// Planvyn för ett hus på campus: MazeMap med våningsväljare och husets studieplatser.
// Öppnas från husets bubbla på kartan.
export default function BuildingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const session = useSession();
  const insets = useSafeAreaInsets();
  const { buildings, error: buildingsError } = useCampusBuildings();
  const { places, refetch } = usePlaces();
  const mapRef = useRef<MazeMapHandle>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MapDraft | null>(null);

  const building = buildings.find((b) => b.id === id);

  // Hämtar om platserna när man kommer tillbaka, t.ex. efter att ha lagt till en plats.
  // Hoppar över första gången eftersom usePlaces redan hämtar när skärmen öppnas.
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

  // Kartan startar mitt på huset, på entréplanet. useMemo så att kartan inte laddas om i onödan.
  const config = useMemo<MazeMapConfig | null>(() => {
    if (!building) return null;
    return {
      campusId: MAZEMAP_CAMPUS_ID,
      center: { lat: building.center.latitude, lng: building.center.longitude },
      zoom: 18,
      zLevel: defaultZ(building),
    };
  }, [building]);

  // Alla platser ritas ut, så att man ser grannhusen också. Våningsnamnet ("2") översätts till
  // MazeMaps våningsnummer för huset platsen ligger i. Saknas våningen (eller finns den inte i huset)
  // visas platsen på entréplanet. Platser utanför husen ligger utomhus och syns på alla våningar.
  const spots = useMemo<MapSpot[]>(
    () =>
      places.map((place) => {
        const placeBuilding = findBuilding(buildings, place.latitude, place.longitude);
        return {
          id: place.id,
          lat: place.latitude,
          lng: place.longitude,
          zLevel: placeBuilding ? (floorToZ(placeBuilding, place.floor) ?? defaultZ(placeBuilding)) : null,
          busyness: place.current_busyness,
        };
      }),
    [places, buildings]
  );

  const openPlace = (placeId: string) => {
    // Markören visas större tills man trycker någon annanstans på kartan, som på vanliga kartan
    setSelectedId(placeId);
    router.push({ pathname: '/place/[id]', params: { id: placeId } });
  };

  const startDraftAtCenter = () => {
    if (!session) {
      Alert.alert('Log in', 'You need to be logged in to add a place.');
      return;
    }
    mapRef.current?.startDraftAtCenter();
  };

  // Långt tryck på kartan sätter ut nålen direkt i WebView:n, så inloggningen kollas här i efterhand
  const handleDraftChange = (next: MapDraft) => {
    if (!session) {
      mapRef.current?.clearDraft();
      Alert.alert('Log in', 'You need to be logged in to add a place.');
      return;
    }
    setDraft(next);
  };

  const cancelDraft = () => {
    mapRef.current?.clearDraft();
    setDraft(null);
  };

  // Öppnar formuläret med nålens position, och fyller i hus och våning åt användaren
  const confirmDraft = () => {
    if (!draft) return;
    const draftBuilding = findBuilding(buildings, draft.lat, draft.lng);
    router.push({
      pathname: '/place/newPlace',
      params: {
        lat: String(draft.lat),
        lng: String(draft.lng),
        building: draftBuilding?.name ?? '',
        floor: draftBuilding ? (zToFloorName(draftBuilding, draft.zLevel) ?? '') : '',
      },
    });
    cancelDraft();
  };

  const bottom = insets.bottom + spacing.md;

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: building?.name ?? '' }} />

      {config ? (
        <MazeMapView
          ref={mapRef}
          config={config}
          spots={spots}
          selectedId={selectedId}
          onSpotPress={openPlace}
          onMapPress={() => setSelectedId(null)}
          onDraftChange={handleDraftChange}
        />
      ) : (
        // Byggnaderna hämtas från MazeMap, så det tar en stund första gången
        <Text style={styles.message}>
          {buildingsError
            ? `Could not load the building: ${buildingsError}`
            : buildings.length
              ? 'Could not find the building.'
              : 'Loading...'}
        </Text>
      )}

      {config && !draft && <MapAddButton onPress={startDraftAtCenter} style={[styles.addButton, { bottom }]} />}

      {draft && (
        <DraftPlaceBar
          hint="Move the map to place the pin"
          onCancel={cancelDraft}
          onConfirm={confirmDraft}
          style={[styles.draftBar, { bottom }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  message: {
    ...type.body,
    color: colors.textMuted,
    padding: spacing.lg,
  },
  addButton: {
    position: 'absolute',
    right: spacing.md,
  },
  draftBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
  },
});
