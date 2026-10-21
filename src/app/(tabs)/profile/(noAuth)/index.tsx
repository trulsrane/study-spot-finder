import { useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuth from '@/src/hooks/useAuth';
import { AuthButton, AuthInput, authStyles } from '@/src/components/AuthForm';
import { colors, radius, spacing, type } from '@/src/theme';

// Det man får tillgång till när man loggar in
const benefits = [
  { icon: 'heart-outline', text: 'Save your favorite places' },
  { icon: 'log-in-outline', text: "Check in and see who's there" },
  { icon: 'add', text: 'Add new study spots' },
] as const;

export default function LoginScreen() {
  const passwordRef = useRef<TextInput>(null);
  const { email, setEmail, password, setPassword, loading, error, signInWithEmail } = useAuth();

  return (
    <KeyboardAvoidingView style={authStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[authStyles.content, styles.content]}
        // Håller innehållet fritt från statusraden och tab-baren
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        {/* Samma bok-ikon som markörerna på kartan */}
        <View style={styles.logo}>
          <Ionicons name="book" size={40} color={colors.icon} />
        </View>

        <Text style={authStyles.title}>Find your study spot</Text>
        <Text style={authStyles.subtitle}>Log in to get the most out of the app</Text>

        {/* Gröna ikoncirklar, samma som amenities på platsernas infosida */}
        
        <View style={authStyles.form}>
          <AuthInput
            icon="mail-outline"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <AuthInput
            ref={passwordRef}
            icon="lock-closed-outline"
            placeholder="Password"
            secure
            value={password}
            onChangeText={setPassword}
            textContentType="password"
            autoComplete="current-password"
            returnKeyType="go"
            onSubmitEditing={signInWithEmail}
          />

          {error && <Text style={authStyles.error}>{error}</Text>}

          <AuthButton title="Log in" loading={loading} onPress={signInWithEmail} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          {/* Registreringen har en egen sida med användarnamn, se signup.tsx */}
          <Link href="/profile/signup" style={styles.link}>
            Sign up
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
  },
  logo: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.greenButtonBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefits: {
    gap: spacing.sm + 4,
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.amenityCircle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    ...type.body,
    color: colors.text,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  footerText: {
    ...type.body,
    color: colors.textMuted,
  },
  link: {
    ...type.body,
    fontWeight: '600',
    color: colors.text,
    textDecorationLine: 'underline',
  },
});