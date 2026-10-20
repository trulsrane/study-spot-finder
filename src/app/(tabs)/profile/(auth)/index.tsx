import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useProfile } from '@/src/hooks/useProfile';
import { useRouter, Link, useFocusEffect } from 'expo-router'
import { usePlaces } from '@/src/hooks/usePlaces';
import { useFavorites } from '@/src/hooks/useFavorites';
import { useMyReviews } from '@/src/hooks/useMyReviews';
import { colors, radius, spacing, type } from '@/src/theme';
import { Card } from '@/src/components/CardContainer';
import { translatePlaceToInfoCards } from '@/src/utils/translatePlaceToInfoCards';
import { supabase } from '@/src/utils/supabase';
import { useCallback, useRef } from 'react';


export default function ProfilePage() {
	const router = useRouter();
	const { profile, loading: profileLoading, error: profileError, refetch, } = useProfile();
	const { places, loading: placesLoading, error: placesError } = usePlaces();
	const { favorites, loading: favoritesLoading, error: favoritesError, toggleFavorite, isFavorite } = useFavorites();
	const favoritePlaces = places.filter((p) => favorites.includes(p.id))
	const { reviews, loading: reviewsLoading, error: reviewsError } = useMyReviews();

	const loading = profileLoading || placesLoading || favoritesLoading;
	const error = profileError ?? placesError ?? favoritesError;

	const isFirstFocus = useRef(true);
	  useFocusEffect(
		useCallback(() => {
		  if (isFirstFocus.current) {
			isFirstFocus.current = false;
			return;
		  }
		  refetch();
		}, [refetch])
	  );

	if (loading) return <Text style={styles.message}>Loading...</Text>;
	if (error) return <Text style={styles.message}>{error}</Text>;
	if (!profile) return <Text style={styles.message}>No profile found</Text>;

	return (
		<ScrollView style={styles.container}>
			<View style={styles.buttonContainer}>
				<Button title="Edit Profile" onPress={() => router.push('/profile/edit')} />
				<Button title="Log out" onPress={() => supabase.auth.signOut()} />
			</View>
			<View style={styles.profileinfo}>
				{profile.avatar_url ? ( 
					<Image source={{ uri: profile.avatar_url }} 
					style={styles.profilePicture} 
					resizeMode="cover" 
					/>
				) : null}
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
						<Card {...translatePlaceToInfoCards(item)} isFavorite={isFavorite(item.id)} onToggleFavorite={() => toggleFavorite(item.id)} />
					</Link>
				))}
			</View>

			{/* Tillfälligt: rå data för att testa useFavorites */}
			{/* <Text>useFavorites (place_id:n):</Text>
			<Text>{JSON.stringify(favorites, null, 2)}</Text> */}
			{/* <Text>useMyReviews:</Text>
			<Text>{reviewsLoading ? 'Laddar...' : reviewsError ?? JSON.stringify(reviews, null, 2)}</Text> */}
			<Text style={styles.caption}>My reviews ({reviews.length}):</Text>
			<View style={styles.reviewContainer}>
				{reviewsLoading ? (
					<Text style={styles.message}>Loading reviews...</Text>
				) : reviewsError ? (
					<Text style={styles.message}>Could not load reviews: {reviewsError}</Text>
				) : reviews.length === 0 ? (
					<Text style={styles.message}>You haven't written any reviews yet.</Text>
				) : (
					reviews.map((review) => (
						<Link
						// Länkar till platsen som recensionen gäller, får upp en modal
							key={review.id}
							href={{ pathname: '/place/[id]', params: { id: review.place_id } }}
							asChild
						>
							<TouchableOpacity style={styles.reviewItem} activeOpacity={0.8}>
								<View style={styles.reviewHeaderRow}>
									<Text style={styles.reviewPlace} numberOfLines={1}>
										{review.places?.name ?? 'Unknown place'}
									</Text>
									
									{/* Lade till datum, är det något vi vill ha med? */}
									<Text style={styles.reviewDate}>
										{new Date(review.created_at).toLocaleDateString('sv-SE')}
									</Text>
								</View>
								<Text style={styles.reviewRating}>Rating: {review.rating}</Text>
								{review.comment ? (
									<Text style={styles.reviewComment}>{review.comment}</Text>
								) : null}
							</TouchableOpacity>
						</Link>
					))
				)}
			</View>


		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: spacing.md,
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
		color: colors.textMuted,
	},
	buttonContainer: {
		alignSelf: 'flex-end',
		marginVertical: 12,
	},
	list: {
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
	reviewContainer: {

	},
	reviewList: {
		marginBottom: spacing.lg,
	},
	reviewItem: {
		backgroundColor: colors.cardBackground,
		borderRadius: radius.md,
		padding: spacing.md,
		marginBottom: spacing.sm,
		overflow: 'hidden',
	},
	reviewHeaderRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: spacing.sm,
	},
	reviewPlace: {
		...type.heading,
		color: colors.text,
		flex: 1,
	},
	reviewDate: {
		...type.caption,
		color: colors.textMuted,
	},
	reviewRating: {
		...type.caption,
		color: colors.textMuted,
		marginTop: 2,
	},
	reviewComment: {
		...type.body,
		color: colors.text,
		marginTop: spacing.xs,
	},
});