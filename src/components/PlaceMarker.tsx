import { Platform, StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Host, Image } from '@expo/ui/swift-ui';
import { frame, glassEffect } from '@expo/ui/swift-ui/modifiers';

import { Place } from '@/src/types/db';
import { colors } from '@/src/theme';

const MARKER_SIZE = 32;
// Vald plats visas större så att man ser vilken som är öppen
const SELECTED_MARKER_SIZE = 42;
const DOT_SIZE = 10;

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
};

// Rund glasmarkör med en ikon och en färgad prick för hur mycket folk det är på platsen.
export function PlaceMarker({ place, selected, onPress }: Props) {
  const size = selected ? SELECTED_MARKER_SIZE : MARKER_SIZE;
  const iconSize = Math.round(size * 0.45);
  const dotColor = busynessDotColor[place.current_busyness];

  return (
    <Marker
      coordinate={{ latitude: place.latitude, longitude: place.longitude }}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      zIndex={selected ? 1 : 0}
    >
      {/* pointerEvents="none" så att trycket går till Marker:n och inte fastnar i glaset */}
      <View pointerEvents="none" style={{ width: size, height: size }}>
        {Platform.OS === 'ios' ? (
          // Liquid Glass, samma stil som klustren och knapparna på kartan
          <Host matchContents>
            <Image
              systemName="book.fill"
              size={iconSize}
              color={colors.text}
              modifiers={[
                frame({ width: size, height: size }),
                glassEffect({ glass: { variant: 'regular' }, shape: 'circle' }),
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
    </Marker>
  );
}

const styles = StyleSheet.create({
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
});
