import { Platform, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Host, Image, Text as SwiftUIText, ZStack } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  font,
  foregroundStyle,
  frame,
  glassEffect,
  offset,
  onTapGesture,
  rotationEffect,
} from '@expo/ui/swift-ui/modifiers';

import { colors, radius } from '@/src/theme';

// Väderstrecken och åt vilket håll från mitten de ligger (y är nedåt på skärmen)
const DIRECTIONS = [
  { label: 'N', x: 0, y: -1 },
  { label: 'E', x: 1, y: 0 },
  { label: 'S', x: 0, y: 1 },
  { label: 'W', x: -1, y: 0 },
];
// Avstånd från kompassens mitt till bokstäverna, och storleken på rutan runt varje bokstav.
// Bokstäverna ligger lite in från kanten så att de inte krockar med markeringen upptill.
const LETTER_RADIUS = 15;
const LETTER_BOX = 18;
// Storlek på den fasta markeringen upptill på kompassen
const MARKER_SIZE = 7;

type Props = {
  // Hur många grader kartan är vriden från norr
  heading: number;
  // Kompassens diameter
  size: number;
  onPress: () => void;
  // Placeringen på skärmen, t.ex. position och bottom
  style?: StyleProp<ViewStyle>;
};

// Kompass som snurrar med kartan. Tryck på den för att vrida tillbaka kartan så att norr är uppåt.
export function MapCompass({ heading, size, onPress, style }: Props) {
  if (Platform.OS === 'ios') {
    return (
      // Liquid Glass, samma stil som sökfältet och knapparna på kartan
      <Host matchContents style={style}>
        <ZStack
          modifiers={[
            frame({ width: size, height: size }),
            glassEffect({ glass: { variant: 'regular', interactive: true }, shape: 'circle' }),
            accessibilityLabel('Compass, tap to point north up'),
            onTapGesture(onPress),
          ]}
        >
          {/* Hela "urtavlan" med väderstrecken snurrar tillsammans med kartan */}
          <ZStack modifiers={[frame({ width: size, height: size }), rotationEffect(-heading)]}>
            {DIRECTIONS.map(({ label, x, y }) => (
              <SwiftUIText
                key={label}
                modifiers={[
                  font({ size: 12, weight: 'semibold' }),
                  foregroundStyle(colors.text),
                  offset({ x: x * LETTER_RADIUS, y: y * LETTER_RADIUS }),
                ]}
              >
                {label}
              </SwiftUIText>
            ))}
          </ZStack>
          {/* Fast markering upptill som inte snurrar: visar åt vilket håll kartan är vriden */}
          <Image
            systemName="arrowtriangle.down.fill"
            size={MARKER_SIZE}
            color={colors.text}
            modifiers={[offset({ y: -(size / 2 - MARKER_SIZE / 2 - 2) })]}
          />
        </ZStack>
      </Host>
    );
  }

  return (
    <Pressable
      style={[styles.compass, { width: size, height: size }, style]}
      onPress={onPress}
      accessibilityLabel="Compass, tap to point north up"
    >
      <View style={{ width: size, height: size, transform: [{ rotate: `${-heading}deg` }] }}>
        {DIRECTIONS.map(({ label, x, y }) => (
          <Text
            key={label}
            style={[
              styles.letter,
              {
                left: size / 2 + x * LETTER_RADIUS - LETTER_BOX / 2,
                top: size / 2 + y * LETTER_RADIUS - LETTER_BOX / 2,
              },
            ]}
          >
            {label}
          </Text>
        ))}
      </View>
      {/* Fast markering upptill som inte snurrar: visar åt vilket håll kartan är vriden */}
      <Ionicons name="caret-down" size={MARKER_SIZE + 2} color={colors.text} style={styles.marker} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  compass: {
    borderRadius: radius.pill,
    backgroundColor: colors.buttonBackground,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  marker: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
  letter: {
    position: 'absolute',
    width: LETTER_BOX,
    height: LETTER_BOX,
    lineHeight: LETTER_BOX,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
});
