import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '@/src/theme';
import { CheckInWithProfile } from '@/src/hooks/useCheckIns';

type Props = {
  profile: CheckInWithProfile['profiles'];
  size: number;
  style?: StyleProp<ViewStyle>;
};

// Rund profilbild, eller första bokstaven i namnet om personen inte har någon bild
export function FriendAvatar({ profile, size, style }: Props) {
  const name = profile?.display_name ?? profile?.username ?? '?';

  return (
    <View style={[styles.frame, { width: size, height: size, borderRadius: size / 2 }, style]}>
      {profile?.avatar_url ? (
        <Image source={{ uri: profile.avatar_url }} style={styles.image} />
      ) : (
        <Text style={[styles.initial, { fontSize: Math.round(size * 0.55) }]}>{name.charAt(0).toUpperCase()}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.amenityCircle,
    // Samma vita kant som busyness-pricken
    borderWidth: 1.5,
    borderColor: colors.lightText,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initial: {
    fontWeight: '700',
    color: colors.text,
  },
});
