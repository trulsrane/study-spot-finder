import { useState } from 'react';
import { Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Host, Image } from '@expo/ui/swift-ui';
import { frame, glassEffect } from '@expo/ui/swift-ui/modifiers';

import { amenityOptions } from '@/src/utils/translatePlaceToInfoPage';
import { colors, radius, spacing, type } from '@/src/theme';

const CHIP_HEIGHT = 32;
// Luft ovanför och under knapparna så att glasets kant inte klipps av ScrollView:n
const EDGE_SPACE = spacing.xs;
// Hela radens höjd, så att kartan kan lägga saker precis under den
export const AMENITY_FILTER_HEIGHT = CHIP_HEIGHT + EDGE_SPACE * 2;

type Props = {
  // Nycklarna för bekvämligheterna som är valda, t.ex. ['wifi', 'outlets']
  selected: string[];
  onToggle: (key: string) => void;
  // Placeringen på skärmen, t.ex. position och top
  style?: StyleProp<ViewStyle>;
};

// Rad med glasknappar under sökfältet som filtrerar kartan på bekvämligheter. Raden går att scrolla i sidled.
export function AmenityFilter({ selected, onToggle, style }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={styles.row}
    >
      {amenityOptions.map((a) => (
        <FilterChip
          key={a.key}
          icon={a.icon}
          label={a.label}
          active={selected.includes(a.key)}
          onPress={() => onToggle(a.key)}
        />
      ))}
    </ScrollView>
  );
}

type ChipProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
};

// Byggd på samma sätt som BusynessLegend: glaset sitter på en osynlig Image bakom, och ikonen och texten
// ligger ovanpå som vanliga vyer. Ligger de inuti glaset tappar de sin färg.
// Vald knapp är helt grön i stället för glas, eftersom grönt glas blir gråaktigt i ljust läge.
function FilterChip({ icon, label, active, onPress }: ChipProps) {
  // Knappens storlek, så att glaset bakom blir exakt lika stort
  const [width, setWidth] = useState<number | null>(null);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {width !== null && !active && (
        <View style={styles.glass} pointerEvents="none">
          <Host matchContents>
            <Image
              systemName="circle"
              size={1}
              color="#00000000"
              modifiers={[
                frame({ width, height: CHIP_HEIGHT }),
                glassEffect({ glass: { variant: 'clear', tint: colors.glassTint }, shape: 'capsule' }),
              ]}
            />
          </Host>
        </View>
      )}

      <View
        style={[styles.content, active && styles.contentSelected]}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        <Ionicons name={icon} size={14} color={active ? colors.lightText : colors.text} />
        <Text style={[styles.label, active && styles.labelSelected]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingVertical: EDGE_SPACE,
  },
  pressed: {
    opacity: 0.7,
  },
  // Glaset ligger bakom innehållet och tar inte emot tryck
  glass: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  content: {
    height: CHIP_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: radius.pill,
  },
  // Samma gröna som primärknapparna, med vit ikon och text
  contentSelected: {
    backgroundColor: colors.busynessDotLow,
  },
  label: {
    ...type.caption,
    fontWeight: '600',
    color: colors.text,
  },
  labelSelected: {
    color: colors.lightText,
  },
});
