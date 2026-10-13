import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, type } from '@/src/theme';

type Props = {
  // Instruktionen överst i panelen, beror på hur man flyttar platsen på kartan
  hint?: string;
  onCancel: () => void;
  onConfirm: () => void;
  // Placeringen på kartan (position, left, right, bottom)
  style?: StyleProp<ViewStyle>;
};

// Panelen som visas medan man placerar ut en ny plats. Används både på vanliga kartan och i planvyn för ett hus.
export function DraftPlaceBar({ hint = 'Drag the marker to adjust the location', onCancel, onConfirm, style }: Props) {
  return (
    <View style={[styles.bar, style]}>
      <Text style={styles.hint}>{hint}</Text>
      <View style={styles.buttons}>
        <Pressable style={[styles.button, styles.cancelButton]} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.addButton]} onPress={onConfirm}>
          <Text style={styles.buttonText}>Add place</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.buttonBackground,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  hint: {
    ...type.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
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
