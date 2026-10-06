import { useSession } from '@/src/hooks/useSession';
import { Stack } from 'expo-router';

export const unstable_settings = {
  // Ser till att reload alltid startar i tabbarna, annars hamnar man i root-layouten som inte har några tabbar.
  initialRouteName: '(tabs)',
};

const session = useSession();

export default function ProfileLayout() {
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