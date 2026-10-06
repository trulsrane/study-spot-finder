import { Stack } from 'expo-router';

export default function NoAuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Login or Sign up' }} />
      <Stack.Screen name="signup" options={{ title: 'Sign up' }} />
    </Stack>
  );
}