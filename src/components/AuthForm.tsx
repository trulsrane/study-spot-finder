import {Ref, useState} from 'react'
import { ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, type } from '../theme';

// Inloggnings- och registreringsformulär. Delade komponenter för att sidorna ska se likadana ut.
type InputProps = TextInputProps & {
	ref?: Ref<TextInput>;
	icon: keyof typeof Ionicons.glyphMap;
	secure? : boolean;
};
// Inloggnings- och registreringsformulär. Delade komponenter för att sidorna ska se likadana ut.
export function AuthInput({ ref, icon, secure, ...inputProps }: InputProps) {
  const [hidden, setHidden] = useState(true);

  // Rad med ikon, textfält och eventuellt öga för att visa/låsa lösenordet.
  //  Textfältet är en TextInput som kan fokuseras från föräldern via ref.
  return (
    <View style={styles.inputRow}>
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <TextInput
        ref={ref}
        style={styles.input}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={secure && hidden}
        {...inputProps}
      />
      {secure && (
        <Pressable
          onPress={() => setHidden((h) => !h)}
          hitSlop={8}
          accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
        >
          <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

type ButtonProps = {
  title: string;
  loading: boolean;
  onPress: () => void;
};

// Grön pill-knapp, samma som "Save place". Visar en spinner och går inte att trycka på medan den laddar.
export function AuthButton({ title, loading, onPress }: ButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, (loading || pressed) && styles.buttonDimmed]}
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
    >
      {loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.buttonText}>{title}</Text>}
    </Pressable>
  );
}

// Delade stilar för inloggning och registrering, så att sidorna ser likadana ut
export const authStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    ...type.title,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...type.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: -spacing.md, // Närmare rubriken än resten av sidan
  },
  form: {
    gap: spacing.sm + 4,
  },
  error: {
    ...type.caption,
    color: colors.favorite,
  },
  info: {
    ...type.caption,
    color: colors.text,
    backgroundColor: colors.busynessLow,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    overflow: 'hidden',
  },
});

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.buttonBackground,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  input: {
    ...type.body,
    flex: 1,
    color: colors.text,
    paddingVertical: spacing.sm + 6,
  },
  button: {
    minHeight: 50, // Samma höjd med och utan spinner, så att sidan inte hoppar
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.greenButtonBackground,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  buttonDimmed: {
    opacity: 0.6,
  },
  buttonText: {
    ...type.buttonText,
    color: colors.text,
  },
});