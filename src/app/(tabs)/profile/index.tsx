import { View, Text, Image, StyleSheet, Button} from 'react-native';
import { getProfile } from '@/src/hooks/useProfile';
import { useRouter } from 'expo-router'

export default function ProfilePage() {
	const profile = getProfile();
	const router = useRouter();

  return (
    <View style={styles.container}>
		<View style={styles.buttonContainer}>
			<Button title="Edit Profile" onPress={() => router.push('/profile/edit')} />
		</View>
		{profile.profilePictureUrl && (
			<Image
			source={require('../../../../assets/images/profile-pic.jpg')}
			style={styles.profilePicture}
			/>
		)}
		<Text style={styles.name}>{profile.name}</Text>
		<Text style={styles.bio}>Bio: {profile.bio}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  profilePicture: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
	padding: 16
  },
  bio: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
	alignSelf: 'flex-end',
	marginVertical: 12,
  },
});