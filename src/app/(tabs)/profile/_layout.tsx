import { Stack } from 'expo-router';

export const unstable_settings = {
  // Ser till att reload alltid startar i tabbarna, annars hamnar man i root-layouten som inte har några tabbar.
  initialRouteName: '(tabs)',
};

export default function ProfileLayout() {
  return (
	<Stack>
		<Stack.Screen name="index" options={{title: 'Profile'}}/>
		<Stack.Screen name="edit" options={{title: 'Edit Profile'}} />
	</Stack>
  );
}