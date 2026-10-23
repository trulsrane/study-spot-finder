import { Platform, StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Host, HStack, Image, Text as SwiftText } from '@expo/ui/swift-ui';
import { font, foregroundStyle, frame, glassEffect } from '@expo/ui/swift-ui/modifiers';

import { Building } from '@/src/utils/campusBuildings';
import { CheckInWithProfile } from '@/src/hooks/useCheckIns';
import { FriendAvatar } from '@/src/components/FriendAvatar';
import { colors, spacing } from '@/src/theme';

const BUBBLE_HEIGHT = 30;
const FRIEND_SIZE = 18;
// Hur långt vännens bild sticker ut nedanför och till höger om bubblan
const FRIEND_OVERHANG = FRIEND_SIZE / 2;

// Fast storlek (som PlaceMarker), så att kartan vet hur stor markören är innan glaset ritats
function bubbleWidth(count: number) {
  return 46 + 9 * (String(count).length - 1);
}

type Props = {
  building: Building;
  count: number; // Antal studieplatser i huset
  friendHere?: CheckInWithProfile; // En vän som är incheckad på en plats i huset
  onPress: () => void;
};

// Bubbla för ett hus på campus, med hur många studieplatser som finns där. Leder till planvyn för huset.
export function BuildingMarker({ building, count, friendHere, onPress }: Props) {
  const width = bubbleWidth(count);
  // Markören måste rymma vännens bild, annars klipps den bort. Bubblan ligger kvar uppe till vänster.
  const extra = friendHere ? FRIEND_OVERHANG : 0;
  const totalWidth = width + extra;
  const totalHeight = BUBBLE_HEIGHT + extra;

  return (
    <Marker
      // Ny key när vännen eller siffran ändras, så att markören ritas om i rätt storlek (som i PlaceMarker)
      key={`${count}-${friendHere?.user_id ?? ''}`}
      coordinate={building.center}
      onPress={onPress}
      // Håller bubblans mitt på husets mitt även när markören är större för vännens bild
      anchor={{ x: width / 2 / totalWidth, y: BUBBLE_HEIGHT / 2 / totalHeight }}
      // Under platsernas markörer om de skulle överlappa
      zIndex={-1}
      accessibilityLabel={`${building.name}, ${count} study spots`}
    >
      {/* pointerEvents="none" så att trycket går till Marker:n och inte fastnar i glaset */}
      <View pointerEvents="none" style={{ width: totalWidth, height: totalHeight }}>
        {Platform.OS === 'ios' ? (
          // Liquid Glass, samma stil som PlaceMarker
          <Host matchContents>
            <HStack
              spacing={4}
              modifiers={[
                frame({ width, height: BUBBLE_HEIGHT }),
                glassEffect({ glass: { variant: 'regular' }, shape: 'capsule' }),
              ]}
            >
              <Image systemName="building.2.fill" size={13} color={colors.text} />
              <SwiftText modifiers={[font({ size: 15, weight: 'semibold', design: 'rounded' }), foregroundStyle(colors.text)]}>
                {String(count)}
              </SwiftText>
            </HStack>
          </Host>
        ) : (
          <View style={[styles.fallback, { width, height: BUBBLE_HEIGHT }]}>
            <Ionicons name="business" size={13} color={colors.text} />
            <Text style={styles.count}>{count}</Text>
          </View>
        )}
        {friendHere && <FriendAvatar profile={friendHere.profiles} size={FRIEND_SIZE} style={styles.friend} />}
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.buttonBackground,
    elevation: 4,
  },
  friend: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  count: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});
