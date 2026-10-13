import { Platform, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Host, Image } from '@expo/ui/swift-ui';
import { accessibilityLabel, frame, glassEffect, onTapGesture } from '@expo/ui/swift-ui/modifiers';
import { colors, radius } from '@/src/theme';

// Storlek på de runda knapparna nere på kartorna (kompassen och plus-knappen)
export const MAP_BUTTON_SIZE = 56;

type Props = {
  onPress: () => void;
  // Placeringen på kartan (position, right, bottom)
  style?: StyleProp<ViewStyle>;
};

// Plus-knappen som sätter ut en ny plats. Används både på vanliga kartan och i planvyn för ett hus.
export function MapAddButton({ onPress, style }: Props) {
  if (Platform.OS === 'ios') {
    // Liquid Glass-knapp, samma stil som sökfältet och tab-baren
    return (
      <Host matchContents style={style}>
        <Image
          systemName="plus"
          size={22}
          color={colors.text}
          modifiers={[
            frame({ width: MAP_BUTTON_SIZE, height: MAP_BUTTON_SIZE }),
            glassEffect({ glass: { variant: 'regular', interactive: true }, shape: 'circle' }),
            accessibilityLabel('Add place'),
            onTapGesture(onPress),
          ]}
        />
      </Host>
    );
  }

  return (
    <Pressable style={[styles.button, style]} onPress={onPress} accessibilityLabel="Add place">
      <Ionicons name="add" size={28} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
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
});
