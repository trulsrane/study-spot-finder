import { Stack } from 'expo-router';
import { colors } from '@/src/theme';

export default function NoAuthLayout() {
  return (
    <Stack
      screenOptions={{
        // Headern smälter ihop med sidan, i appens färger
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerBackTitle: 'Log in',
      }}
    >
      {/* Inloggningen har egen rubrik på sidan, så headern behövs inte */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ title: '' }} />
    </Stack>
  );
}
