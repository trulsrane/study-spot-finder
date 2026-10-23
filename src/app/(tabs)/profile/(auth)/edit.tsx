import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { View, TextInput, StyleSheet, Text, Alert, Linking, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../../../hooks/useProfile';
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { supabase } from '@/src/utils/supabase';
import { TabBarIcon } from '@/src/components/TabBarIcon';
import { colors, spacing,radius, type } from '@/src/theme';

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
			.from('profile_pictures')
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

	const handleLogout = () => {
		Alert.alert('Log out', 'Are you sure you want to log out?', [
			{ text: 'Cancel', style: 'cancel' },
			{ text: 'Log out', style: 'destructive', onPress: () => supabase.auth.signOut() },
		]);
	}

	if (loading) return <Text style={styles.message}>Loading...</Text>;
	if (error) return <Text style={styles.message}>{error}</Text>;

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.content}
			contentInsetAdjustmentBehavior="automatic" // Håller innehållet fritt från rubriken och flikfältet
			keyboardShouldPersistTaps="handled"
		>
			{profilePictureUrl ? ( <Image source={{ uri: profilePictureUrl }} style={styles.preview} resizeMode="cover" />
			) : (
				<View style={[styles.preview, styles.previewPlaceholder]}>
					<Ionicons name="person-outline" size={80} color="grey" />
				</View>
			)}
			<TouchableOpacity style={styles.pictureButton} activeOpacity={0.6} onPress={pickImage}>
				<Ionicons name="camera-outline" size={18} color={colors.primary} />
				<Text style={styles.pictureButtonText}>Choose profile picture</Text>
			</TouchableOpacity>
			<TextInput style={styles.input} value={name} onChangeText={setName} placeholder='Name'/>
			<TextInput style={styles.input} value={bio} onChangeText={setBio} placeholder='Bio'/>

			<View style={styles.buttons}>
				<TouchableOpacity style={[styles.button, styles.saveButton]} activeOpacity={0.8} onPress={handleSave}>
					<Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.button, styles.logoutButton]} activeOpacity={0.8} onPress={handleLogout}>
					<Ionicons name="log-out-outline" size={18} color={colors.logout} />
					<Text style={[styles.buttonText, styles.logoutButtonText]}>Log out</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	content: {
		padding: spacing.md,
		paddingBottom: spacing.xl,
	},
	preview: {
		width: 200,
		height: 200,
		borderRadius: 100,
		marginBottom: spacing.sm,
		alignSelf: 'center',
	},
	previewPlaceholder: {
		backgroundColor: 'lightgrey',
		alignItems: 'center',
		justifyContent: 'center',
	},
	pictureButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.xs,
		alignSelf: 'center',
		padding: spacing.sm,
		marginBottom: spacing.sm,
	},
	pictureButtonText: {
		...type.buttonText,
		color: colors.primary,
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: radius.sm,
		padding: 10,
		marginVertical: spacing.sm,
	},
	message: {
		padding: 16,
	},

	// Knapparna ligger under varandra med samma grundstil
	buttons: {
		gap: spacing.sm,
		marginTop: spacing.lg,
	},
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.sm,
		borderRadius: radius.pill,
		paddingVertical: spacing.sm + 4,
	},
	buttonText: {
		...type.buttonText,
	},
	saveButton: {
		backgroundColor: colors.primary,
	},
	saveButtonText: {
		color: colors.lightText,
	},
	logoutButton: {
		borderWidth: 1.5,
		borderColor: colors.logout,
	},
	logoutButtonText: {
		color: colors.logout,
	},
});