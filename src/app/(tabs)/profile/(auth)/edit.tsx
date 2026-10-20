import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { View, TextInput, Button, StyleSheet, Text, Alert, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../../../hooks/useProfile';
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { supabase } from '@/src/utils/supabase';

export default function editProfilePage() {
	const { profile, loading, error, updateProfile } = useProfile();
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

	const uploadImage = async(uri: string, mimeType?: string) => {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) throw new Error('Not logged in');

		const base64 = await new FileSystem.File(uri).base64();  
		const arrayBuffer = decode(base64);
		const fileExt = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
		const fileName = `${user.id}/${Date.now()}.${fileExt}`;
		const { error } = await supabase.storage
			.from('profile_pictures') // Replace with your storage bucket name
			.upload(fileName, arrayBuffer, {
				contentType: mimeType ?? `image/${fileExt}`
			});
		if (error) throw error;
		return supabase.storage.from('profile_pictures').getPublicUrl(fileName).data.publicUrl;
	};

	const pickImage = async () => {
		const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		
		if(status !== 'granted') {
			if(!canAskAgain){
				Alert.alert("Premission needed", "Enable photo access in your device settings",
				[
					{text: "Cancel", style: 'cancel'},
					{text: "Open settings", onPress: () => Linking.openSettings()},
				]
				);
			}
			return;
		}
		
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			aspect: [1, 1],
		});

		if(result.canceled) return;
		
		const imageUri = result.assets[0];
		try {
			const publicUrl = await uploadImage(imageUri.uri, imageUri.mimeType);
			setprofilePictureUrl(publicUrl);
		} catch (error: any) {
			Alert.alert('Upload failed', error.message ?? 'Something went wrong');
		}
	}

	const handleSave = async () => {
		const saveError = await updateProfile({
			username: name,
			description: bio,
			avatar_url: profilePictureUrl,
		});
		if (saveError) alert(saveError);
		else router.back();
	}

	if (loading) return <Text style={styles.message}>Loading...</Text>;
	if (error) return <Text style={styles.message}>{error}</Text>;

	return (
		<View style={styles.container}>
			{profilePictureUrl ? ( <Image source={{ uri: profilePictureUrl }} style={styles.preview} resizeMode="cover" />
			) : (
				<View style={[styles.preview, styles.previewPlaceholder]}>
					<Ionicons name="person-outline" size={80} color="grey" />
				</View>
			)}
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
  previewPlaceholder: {
    backgroundColor: 'lightgrey',
    alignItems: 'center',
    justifyContent: 'center',
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