import { View, Text, Image, StyleSheet, Button, ScrollView } from 'react-native';
import { useProfile } from '@/src/hooks/useProfile';
import { useRouter, Link } from 'expo-router'
import { usePlaces } from '@/src/hooks/usePlaces';
import { useFavorites } from '@/src/hooks/useFavorites';
import { useMyReviews } from '@/src/hooks/useMyReviews';
import { colors, spacing, type } from '@/src/theme';
import { Card } from '@/src/components/CardContainer';
import { translatePlaceToInfoCards } from '@/src/utils/translatePlaceToInfoCards';
import { supabase } from '@/src/utils/supabase';


export default function ProfilePage() {
	const router = useRouter();
	const { profile, loading: profileLoading, error: profileError } = useProfile();
	const { places, loading: placesLoading, error: placesError } = usePlaces();
	const { favorites, loading: favoritesLoading, error: favoritesError, toggleFavorite, isFavorite } = useFavorites();
	const favoritePlaces = places.filter((p) => favorites.includes(p.id))
	const { reviews, loading: reviewsLoading, error: reviewsError } = useMyReviews();

	const loading = profileLoading || placesLoading || favoritesLoading;
	const error = profileError ?? placesError ?? favoritesError;

	if (loading) return <Text style={styles.message}>Loading...</Text>;
	if (error) return <Text style={styles.message}>{error}</Text>;
	if (!profile) return <Text style={styles.message}>No profile found</Text>;

  	return (
		<ScrollView style={styles.container}>
			<View style={styles.buttonContainer}>
				<Button title="Edit Profile" onPress={() => router.push('/profile/edit')} />
				<Button title="Log out" onPress={() => supabase.auth.signOut()} />
			</View>
			<View style={styles.profileinfo}>{profile.avatar_url && (
				<Image
				source={require('@/assets/images/profile-pic.jpg')}
				style={styles.profilePicture}
				/>
			)}
			<Text style={styles.name}>{profile.username}</Text>
			<Text style={styles.bio}>Bio: {profile.description}</Text>
			</View>
			<Text style={styles.caption}>Favorite study places:</Text>
			<View style={styles.list}>
				{favoritePlaces.map((item) => (
				<Link
					key={item.id}
					href={{ pathname: '/', params: { focus: item.id } }} // focus skickas med som en sträng i URLen som läses av i maps och triggar en hook
					asChild
				>
					<Card {...translatePlaceToInfoCards(item)} isFavorite = {isFavorite(item.id)} onToggleFavorite={() => toggleFavorite(item.id)}/>
				</Link>
				))}
			</View>

			{/* Tillfälligt: rå data för att testa useFavorites och useMyReviews */}
			<Text>useFavorites (place_id:n):</Text>
			<Text>{JSON.stringify(favorites, null, 2)}</Text>
			<Text>useMyReviews:</Text>
			<Text>{reviewsLoading ? 'Laddar...' : reviewsError ?? JSON.stringify(reviews, null, 2)}</Text>
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