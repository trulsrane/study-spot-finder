import { Stack } from 'expo-router';

export const unstable_settings = {
  // Ser till att reload alltid startar i tabbarna, annars hamnar man i root-layouten som inte har några tabbar.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen
        name="place/[id]"
        options={{
          // En native modal som dyker upp ovanpå tabbarna. Man kan dra 30%, 60% eller hela vägen upp. Kartan är fortfarande synlig bakom modalen.
          presentation: 'formSheet',
          sheetAllowedDetents: [0.3, 0.6, 1],
          sheetLargestUndimmedDetentIndex: 1,
          sheetGrabberVisible: true,
          headerShown: false,
        }}
      />
	  <Stack.Screen
		name="place/cluster"
		options={{
			presentation: 'formSheet',
    		sheetAllowedDetents: [0.3, 0.6, 1],
    		sheetLargestUndimmedDetentIndex: 1,
   		 	sheetGrabberVisible: true,
    		headerShown: false
    	}}
	  />
	</Stack>
	);
}
