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
	const { profile, loading: profileLoading, error: profileError, refetch } = useProfile();
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

			<View style={styles.header}>
				<View style={styles.buttonContainer}>
				<Button title="Edit Profile" color={colors.text} onPress={() => router.push('/profile/edit')} />
			</View>
				{profile.avatar_url ? (
					<Image source={{ uri: profile.avatar_url }} style={styles.profilePicture} />
				) : (
					<View style={[styles.profilePicture, styles.profilePictureFallback]}>
						<Text style={styles.profilePictureInitial}>
							{profile.username?.charAt(0).toUpperCase() ?? 'U'}
						</Text>
					</View>
				)}

				<Text style={styles.name}>{profile.username}</Text>
				{profile.description ? (
					<Text style={styles.bio}>{profile.description}</Text>
				) : null}

				<View style={styles.stats}>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{favoritePlaces.length}</Text>
						<Text style={styles.statLabel}>Favorites</Text>
					</View>
					<View style={styles.statDivider} />
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{reviews.length}</Text>
						<Text style={styles.statLabel}>Reviews</Text>
					</View>
				</View>
			</View>

			<Text style={styles.caption}>Favorite study places</Text>
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

			<Text style={styles.caption}>My reviews</Text>
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

			<View style={styles.logoutButton}>
				<Button title="Log out" color={colors.favorite} onPress={() => supabase.auth.signOut()} />
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: spacing.md,
		backgroundColor: colors.background
	},
	caption: {
		...type.heading,
		paddingBottom: 10,
	},
	buttonContainer: {
		alignSelf: 'flex-end',
		
	},
	list: {
		flex: 1,
	},
	message: {
		...type.body,
		color: colors.textMuted,
		padding: spacing.lg,
	},
	reviewContainer: {

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
	logoutButton: {
		marginTop: spacing.lg,
		paddingBottom: spacing.xl,
		alignSelf: 'center',
	},
	header: {
		alignItems: 'center',
		backgroundColor: colors.cardBackground,
		borderRadius: radius.lg,
		paddingVertical: spacing.md,
		paddingHorizontal: spacing.md,
		marginBottom: spacing.lg,
	},
	profilePicture: {
		width: 120,
		height: 120,
		borderRadius: radius.pill,
		marginBottom: spacing.md,
	},
	profilePictureFallback: {
		backgroundColor: colors.amenityCircle,
		alignItems: 'center',
		justifyContent: 'center',
	},
	profilePictureInitial: {
		fontSize: 44,
		fontWeight: '600',
		color: colors.text,
	},
	name: {
		...type.title,
		color: colors.text,
	},
	bio: {
		...type.body,
		color: colors.textMuted,
		textAlign: 'center',
		maxWidth: 280,
		marginTop: spacing.xs,
	},
	stats: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'stretch',
		marginTop: spacing.lg,
		paddingTop: spacing.md,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: colors.border,
	},
	statItem: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: spacing.xs,
	},
	statValue: {
		...type.heading,
		color: colors.text,
	},
	statLabel: {
		...type.caption,
		color: colors.textMuted,
		marginTop: 2,
	},
	statDivider: {
		width: StyleSheet.hairlineWidth,
		height: 28,
		backgroundColor: colors.border,
	},
});
