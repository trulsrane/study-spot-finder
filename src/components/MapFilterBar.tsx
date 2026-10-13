import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { placeFilters } from '@/src/utils/placeFilters';
import { colors, radius, spacing, type } from '@/src/theme';

type Props = {
  selected: string[];
  onChange: (selected: string[]) => void;
};

// Snabbfilter under sökfältet på kartan. Tryck för att slå på/av ett filter, flera kan vara valda samtidigt.
export function MapFilterBar({ selected, onChange }: Props) {
  const toggle = (key: string) =>
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // Raden går ända ut till skärmkanterna när man scrollar, men börjar i linje med sökfältet
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {selected.length > 0 && (
        <Pressable style={styles.chip} onPress={() => onChange([])} accessibilityLabel="Clear filters">
          <Ionicons name="close" size={15} color={colors.text} />
        </Pressable>
      )}

      {placeFilters.map((filter) => {
        const isSelected = selected.includes(filter.key);
        return (
          <Pressable
            key={filter.key}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => toggle(filter.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <Ionicons name={filter.icon} size={15} color={colors.text} />
            <Text style={styles.label}>{filter.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginHorizontal: -spacing.md,
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: spacing.md,
    // Plats för skuggan, annars klipps den av ScrollView:n
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm - 1,
    borderRadius: radius.pill,
    backgroundColor: colors.buttonBackground,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  chipSelected: {
    backgroundColor: colors.greenButtonBackground,
  },
  label: {
    ...type.caption,
    fontWeight: '600',
    color: colors.text,
  },
});
