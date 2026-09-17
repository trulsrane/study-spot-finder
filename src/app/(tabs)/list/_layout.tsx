import { Stack } from 'expo-router';

// List-taben har sin egna stack, så klickar man på en plats i listan så pushas en ny skärm på stacken.
export default function ListLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Study places', headerLargeTitle: true }} />
      <Stack.Screen name="[id]" options={{ title: 'Place' }} />
    </Stack>
  );
}
