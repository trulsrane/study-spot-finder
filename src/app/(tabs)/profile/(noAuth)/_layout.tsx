import { Stack } from 'expo-router';

export default function NoAuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
