import { useSession } from '@/src/hooks/useSession';
import { Stack } from 'expo-router';

export default function ProfileLayout() {
  const session = useSession();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(noAuth)" />
      </Stack.Protected>
    </Stack>
  );
}