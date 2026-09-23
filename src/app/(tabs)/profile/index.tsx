import { View, Text, Image, StyleSheet } from 'react-native';
import { useProfile } from '@/src/hooks/useProfile';

export default function ProfilePage() {
	const profile = useProfile();

  return (
    <View style={styles.container}>
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
    justifyContent: 'flex-start',
	marginTop: 50,
    padding: 16,
  },
  profilePicture: {
    width: 200,
    height: 200,
    borderRadius: 30,
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
});