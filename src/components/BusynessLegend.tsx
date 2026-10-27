import { useState } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Host, Image } from '@expo/ui/swift-ui';
import { frame, glassEffect } from '@expo/ui/swift-ui/modifiers';

import { colors, radius, spacing } from '@/src/theme';

const TITLE = 'Busyness';
const DOT_SIZE = 10;

// Samma färger som pricken på markörerna, så att legenden alltid stämmer med kartan
const LEVELS = [
  { label: 'Low', color: colors.busynessDotLow },
  { label: 'Medium', color: colors.busynessDotMedium },
  { label: 'High', color: colors.busynessDotHigh },
];

type Props = {
  // Placeringen på skärmen, t.ex. position och top
  style?: StyleProp<ViewStyle>;
};

// Förklarar vad färgen på pricken vid markörerna betyder (hur mycket folk det är på platsen).
// Byggd på samma sätt som PlaceMarker: glaset sitter på en Image, och prickarna ligger ovanpå som
// vanliga vyer. Ligger prickarna inuti glaset tappar de sin färg.
export function BusynessLegend({ style }: Props) {
  // Storleken på innehållet, så att glaset bakom blir exakt lika stort
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  return (
    <View style={style} pointerEvents="none">
      {size && (
        <Host matchContents>
          {/* Ikon som bara bär glaset, precis som ikonen i markören. Den görs pyttesmå och genomskinlig
              så att själva ikonen inte syns, bara glaset runt den. */}
          <Image
            systemName="circle"
            size={1}
            color="#00000000"
            modifiers={[
              frame({ width: size.width, height: size.height }),
              glassEffect({ glass: { variant: 'clear' }, shape: 'roundedRectangle', cornerRadius: radius.md }),
            ]}
          />
        </Host>
      )}

      <View
        style={styles.content}
        onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      >
        <Text style={styles.title}>{TITLE}</Text>
        {LEVELS.map(({ label, color }) => (
          <View key={label} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={styles.label}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Innehållet ligger ovanpå glaset, som pricken på markörerna
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    // Vit kant, samma som pricken på markörerna
    borderWidth: 1.5,
    borderColor: colors.lightText,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
});
