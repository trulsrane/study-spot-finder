import { View, Text, Image, StyleSheet, Button, ScrollView } from 'react-native';
import { getProfile } from '@/src/hooks/useProfile';
import { useRouter, Link } from 'expo-router'
import { usePlaces } from '@/src/hooks/usePlaces';
import { useFavorites } from '@/src/hooks/useFavorites';
import { colors, spacing, type } from '@/src/theme';
import { Card } from '@/src/components/CardContainer';
import { translatePlaceToInfoCards } from '@/src/utils/translatePlaceToInfoCards';
import { useEffect } from 'react';


export default function ProfilePage() {
	const profile = getProfile();
	const router = useRouter();
	const { places, loading, error } = usePlaces();
	const { favorites, toggleFavorite, isFavorite } = useFavorites();
	const favoritePlaces = places.filter((p) => favorites.includes(p.id))
	
	if (loading) return <Text style={styles.message}>Laddar...</Text>;
	if (error) return <Text style={styles.message}>{error}</Text>;

  	return (
		<ScrollView style={styles.container}>
			<View style={styles.buttonContainer}>
				<Button title="Edit Profile" onPress={() => router.push('/profile/edit')} />
			</View>
			<View style={styles.profileinfo}>{profile.profilePictureUrl && (
				<Image
				source={require('../../../../assets/images/profile-pic.jpg')}
				style={styles.profilePicture}
				/>
			)}
			<Text style={styles.name}>{profile.name}</Text>
			<Text style={styles.bio}>Bio: {profile.bio}</Text>
			</View>
			<Text style={styles.caption}>Favorite study places:</Text>
			<View style={styles.list}>
				{favoritePlaces.map((item) => (
				<Link
					key={item.id}
					href={{ pathname: '/', params: { id: item.id } }}
					asChild
				>
					<Card {...translatePlaceToInfoCards(item)} isFavorite = {isFavorite(item.id)} onToggleFavorite={() => toggleFavorite(item.id)}/>
				</Link>
				))}
			</View>
		</ScrollView>
  	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,

	},
	profilePicture: {
		width: 200,
		height: 200,
		borderRadius: 100,
		marginBottom: 16,
	},
	profileinfo: {
		alignItems: 'center',
		paddingBottom: 16,
	},
	caption: {
		...type.heading,
		paddingBottom: 10,
	},
	name: {
		...type.title,
		color: colors.text,
		paddingBottom: 10,
	},
	bio: {
		fontSize: 14,
		color: '#666',
	},
	buttonContainer: {
		alignSelf: 'flex-end',
		marginVertical: 12,
	},
		list: {
		backgroundColor: colors.background,
		flex: 1,
	},
	message: {
		...type.body,
		color: colors.textMuted,
		padding: spacing.lg,
	},
	meta: {
		...type.caption,
		color: colors.textMuted,
		marginTop: spacing.xs,
	},
	row: {
		borderBottomColor: colors.border,
		borderBottomWidth: 1,
		padding: spacing.md,
	},
});