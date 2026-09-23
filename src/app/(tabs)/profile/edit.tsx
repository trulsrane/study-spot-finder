import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { View, TextInput, Button, Image, StyleSheet } from 'react-native';
import { getProfile, updateProfile } from '../../../hooks/useProfile';

export default function editProfilePage() {
	const profile = getProfile();
	const router = useRouter();

	const [name, setName] = useState(profile.name);
	const[bio, setBio] = useState(profile.bio ?? '');
	const [profilePictureUrl, setprofilePictureUrl] = useState(profile.profilePictureUrl ?? '');

	const pickImage = async () => {
		const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
		if(status !== 'granted') {
			alert('You need to give the app access to your photos to be able to choose a profile picture.')
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
		});

		if(!result.canceled){
			setprofilePictureUrl(result.assets[0].uri);
		}
	}

	const handleSave = () => {
		updateProfile({ name, bio, profilePictureUrl });
		router.back();
	}

	return (
		// Kommer behöva ändra Image source='' sen när vi fått upp databasen
		<View style={styles.container}>
			<Image source={require('../../../../assets/images/profile-pic.jpg')}
				style={styles.preview}
			/>
			<Button title="Choose profile picture" onPress={pickImage} />
			<TextInput style={styles.input} value={name} onChangeText={setName} placeholder='Name'/>
			<TextInput style={styles.input} value={bio} onChangeText={setBio} placeholder='Bio'/>
			<Button title='Save' onPress={handleSave}/>
		</View>
	);
}
	
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 16,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 12,
  },
});