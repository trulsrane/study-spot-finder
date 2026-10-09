import { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Host, HStack, Image, TextField, TextFieldRef } from '@expo/ui/swift-ui';
import {
  autocorrectionDisabled,
  glassEffect,
  padding,
  submitLabel,
} from '@expo/ui/swift-ui/modifiers';

import { usePlaces } from '@/src/hooks/usePlaces';
import { useDebounceValue } from '@/src/hooks/useDebounceValue';
import { createPlaceSearcher, searchPlaces } from '@/src/scripts/searchPlaces';
import { Place } from '@/src/types/db';
import { colors, radius, spacing, type } from '@/src/theme';

type Props = { onSelect: (place: Place) => void };

// Sökfält som ligger ovanpå kartan. Söker fuzzy bland platserna i databasen
// och väntar tills användaren slutat skriva innan sökningen körs.
export function MapSearchBar({ onSelect }: Props) {
  const { places } = usePlaces();
  const [query, setQuery] = useState('');
  const fieldRef = useRef<TextFieldRef>(null);
  const debouncedQuery = useDebounceValue(query, 300);

  const fuse = useMemo(() => createPlaceSearcher(places), [places]);
  const searchResults = useMemo(() => searchPlaces(fuse, debouncedQuery), [fuse, debouncedQuery]);

  const showNoResults = debouncedQuery.trim().length >= 2 && searchResults.length === 0;

  // SwiftUI-fältet är inte "controlled" som TextInput, så det töms och stängs via ref.
  const clearQuery = () => {
    setQuery('');
    fieldRef.current?.clear();
  };

  const handleSelect = (place: Place) => {
    onSelect(place);
    clearQuery();
    fieldRef.current?.blur();
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' ? (
        // Riktigt SwiftUI-sökfält med Liquid Glass, samma som tab-baren.
        <Host matchContents={{ vertical: true }}>
          <HStack
            spacing={spacing.sm}
            modifiers={[
              padding({ horizontal: spacing.md, vertical: spacing.sm + spacing.xs }),
              glassEffect({ glass: { variant: 'regular', interactive: true }, shape: 'capsule' }),
            ]}>
            <Image systemName="magnifyingglass" color={colors.textMuted} />
            <TextField
              ref={fieldRef}
              placeholder="Search place..."
              onTextChange={setQuery}
              modifiers={[submitLabel('search'), autocorrectionDisabled()]}
            />
            {query.length > 0 && (
              <Image systemName="xmark.circle.fill" color={colors.textMuted} onPress={clearQuery} />
            )}
          </HStack>
        </Host>
      ) : (
        <View style={styles.inputRow}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search place..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Träfflistan visas bara när det finns något att visa */}
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          style={styles.results}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSelect(item)}
              style={styles.resultItem}>
              <Ionicons name="location-outline" size={18} color={colors.tint} />
              <View style={{ flex: 1 }}>
                <Text style={styles.resultTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.address ? (
                  <Text style={styles.resultSubtitle} numberOfLines={1}>
                    {item.address}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {showNoResults && (
        <View style={styles.results}>
          <Text style={styles.noResults}>No results</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  inputRow: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  input: {
    ...type.body,
    color: colors.text,
    flex: 1,
    paddingVertical: spacing.xs,
  },
  results: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    maxHeight: 280,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  resultItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
  },
  resultTitle: {
    ...type.body,
    color: colors.text,
    fontWeight: '600',
  },
  resultSubtitle: {
    ...type.caption,
    color: colors.textMuted,
  },
  separator: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.md,
  },
  noResults: {
    ...type.caption,
    color: colors.textMuted,
    padding: spacing.md,
  },
});
