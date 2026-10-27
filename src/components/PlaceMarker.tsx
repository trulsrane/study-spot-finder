import { Platform, StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Host, Image } from '@expo/ui/swift-ui';
import { frame, glassEffect } from '@expo/ui/swift-ui/modifiers';
import { FriendAvatar } from '@/src/components/FriendAvatar';
import { CheckInWithProfile } from '@/src/hooks/useCheckIns';

import { Place } from '@/src/types/db';
import { currentBusyness } from '@/src/utils/busyness';
import { colors } from '@/src/theme';

// Storlekarna exporteras så att kartan kan räkna ut var namnen hamnar och undvika krockar
export const MARKER_SIZE = 32;
// Vald plats visas större så att man ser vilken som är öppen
export const SELECTED_MARKER_SIZE = 42;
const DOT_SIZE = 10;
const LABEL_GAP = 2;
export const LABEL_MAX_WIDTH = 120;
const LABEL_LINE_HEIGHT = 14;
// Lika mycket plats läggs under cirkeln som namnet tar ovanför, så att cirkeln alltid är i mitten
export const LABEL_SPACE = LABEL_LINE_HEIGHT + LABEL_GAP;

// Färgen på pricken som visar hur mycket folk det är. Okänt visar ingen prick.
const busynessDotColor: Record<Place['current_busyness'], string | null> = {
  low: colors.busynessDotLow,
  medium: colors.busynessDotMedium,
  high: colors.busynessDotHigh,
  unknown: null,
};

type Props = {
  place: Place;
  selected: boolean;
  onPress: () => void;
  showLabel: boolean;
  friendHere?: CheckInWithProfile;
};

// Rund glasmarkör med en ikon och en färgad prick för hur mycket folk det är på platsen.
export function PlaceMarker({ place, selected, onPress, showLabel, friendHere }: Props) {
  const size = selected ? SELECTED_MARKER_SIZE : MARKER_SIZE;
  const iconSize = Math.round(size * 0.45);
  const busyness = currentBusyness(place);
  const dotColor = busynessDotColor[busyness];

  return (
    <Marker
      // Kartan hänger inte med när en markör byter storlek, och ritar den då förskjuten.
      // En ny key när storleken eller pricken ändras gör att markören skapas om och ritas rätt i stället.
      key={`${selected}-${showLabel}-${busyness}-${friendHere ?.user_id ?? ''}`}
      coordinate={{ latitude: place.latitude, longitude: place.longitude }}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      zIndex={selected ? 1 : 0}
    >
      {/* pointerEvents="none" så att trycket går till Marker:n och inte fastnar i glaset */}
      <View pointerEvents="none" style={[styles.column, showLabel && { paddingBottom: LABEL_SPACE }]}>
        {showLabel && (
          <Text style={styles.label} numberOfLines={1}>
            {place.name}
          </Text>
        )}

        <View style={{ width: size, height: size }}>
          {Platform.OS === 'ios' ? (
            <Host matchContents>
              <Image
                systemName="book.fill"
                size={iconSize}
                color={colors.text}
                modifiers={[
                  frame({ width: size, height: size }),
                  glassEffect({ glass: { variant: 'clear' }, shape: 'circle' }),
                ]}
              />
            </Host>
          ) : (
            <View style={[styles.fallback, { width: size, height: size }]}>
              <Ionicons name="book" size={iconSize} color={colors.text} />
            </View>
          )}

          {dotColor && <View style={[styles.dot, { backgroundColor: dotColor }]} />}
        </View>
        {friendHere && (
            <FriendAvatar profile={friendHere.profiles} size={Math.round(size * 0.7)} style={styles.friend} />
          )}
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  column: {
    alignItems: 'center',
  },
  label: {
    marginBottom: LABEL_GAP,
    maxWidth: LABEL_MAX_WIDTH,
    height: LABEL_LINE_HEIGHT,
    lineHeight: LABEL_LINE_HEIGHT,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    // Vit skugga runt texten så att den syns mot kartan
    textShadowColor: colors.lightText,
    textShadowRadius: 1,
    textShadowOffset: { width: 0, height: 0 },
    zIndex: 1, // så att texten hamnar ovanför glasmarkören
  },
  fallback: {
    borderRadius: 999,
    backgroundColor: colors.buttonBackground,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  dot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 1.5,
    borderColor: colors.lightText,
  },
  friend: {
    position: 'absolute',
    left: 0,
    top: 15,
  },
});
