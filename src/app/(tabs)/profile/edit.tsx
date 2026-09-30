import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { View, TextInput, Button, Image, StyleSheet, Text } from 'react-native';
import { useProfile, updateProfile } from '../../../hooks/useProfile';
import { TEST_USER_ID } from '@/src/constants';

export default function editProfilePage() {
	const { profile, loading, error } = useProfile(TEST_USER_ID);
	const router = useRouter();

	const [name, setName] = useState('');
	const[bio, setBio] = useState('');
	const [profilePictureUrl, setprofilePictureUrl] = useState('');

	// Fyll i fälten när profilen har hämtats från databasen
	useEffect(() => {
		if (!profile) return;
		setName(profile.username);
		setBio(profile.description ?? '');
		setprofilePictureUrl(profile.avatar_url ?? '');
	}, [profile]);

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

	const handleSave = async () => {
		const saveError = await updateProfile(TEST_USER_ID, {
			username: name,
			description: bio,
			avatar_url: profilePictureUrl,
		});
		if (saveError) alert(saveError);
		else router.back();
	}

	if (loading) return <Text style={styles.message}>Laddar...</Text>;
	if (error) return <Text style={styles.message}>{error}</Text>;

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
  message: { padding: 16 },
});