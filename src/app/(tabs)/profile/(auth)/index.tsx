import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '@/src/hooks/useProfile';
import { useRouter, Link, useFocusEffect } from 'expo-router'
import { usePlaces } from '@/src/hooks/usePlaces';
import { useFavorites } from '@/src/hooks/useFavorites';
import { useMyReviews } from '@/src/hooks/useMyReviews';
import { colors, radius, spacing, type } from '@/src/theme';
import { Card } from '@/src/components/CardContainer';
import { translatePlaceToInfoCards } from '@/src/utils/translatePlaceToInfoCards';
import { useCallback, useRef, useState, useEffect } from 'react';


export default function ProfilePage() {
	const router = useRouter();
	const { profile, loading: profileLoading, error: profileError, refetch, updateProfile } = useProfile();
	const { places, loading: placesLoading, error: placesError, refetch: refetchPlaces } = usePlaces();
	const { favorites, loading: favoritesLoading, error: favoritesError, toggleFavorite, isFavorite, refetch: refetchFavorites } = useFavorites();
	const favoritePlaces = places.filter((p) => favorites.includes(p.id))
	const { reviews, loading: reviewsLoading, error: reviewsError, refetch: refetchReviews } = useMyReviews(profile?.id ?? '');

	// Hämtar om allt på sidan när man drar nedåt
	const refetchAll = useCallback(() => {
		refetch();
		refetchPlaces();
		refetchFavorites();
		refetchReviews();
	}, [refetch, refetchPlaces, refetchFavorites, refetchReviews]);

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

	// Om vänner får se var jag är incheckad. Visas direkt och sparas sedan i databasen.
	const [sharing, setSharing] = useState(false);
	useEffect(() => {
		if (profile) setSharing(profile.share_location);
	}, [profile]);

	async function toggleSharing(value: boolean) {
		setSharing(value);
		const saveError = await updateProfile({ share_location: value });
		if (saveError) {
			setSharing(!value); // gick inte att spara, visa det gamla läget igen
			Alert.alert('Could not save', saveError);
		}
	}

	// Recensionerna innehåller bara platsens namn, så bilden hämtas från de redan laddade platserna
	const placeImage = (placeId: string) => places.find((p) => p.id === placeId)?.image_urls[0];

	if (loading) return <Text style={styles.message}>Loading...</Text>;
	if (error) return <Text style={styles.message}>{error}</Text>;
	if (!profile) return <Text style={styles.message}>No profile found</Text>;

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.content}
			contentInsetAdjustmentBehavior="automatic"
			keyboardShouldPersistTaps="handled" // Gör så du kan trycka på knappar även om tangentbordet är uppe (t.ex. "send").
			refreshControl={<RefreshControl refreshing={false} onRefresh={refetchAll} />} // Dra nedåt för att hämta om sidan
		>

			<View style={styles.header}>
				{/* Enfärgat omslag som profilbilden överlappar */}
				<View style={styles.cover} />

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
						<View style={styles.statValueRow}>
							<Ionicons name="location" size={20} color={colors.text} />
							<Text style={styles.statValue}>{favoritePlaces.length}</Text>
						</View>
						<Text style={styles.statLabel}>Saved places</Text>
					</View>
					<View style={styles.statDivider} />
					<View style={styles.statItem}>
						<View style={styles.statValueRow}>
							<Ionicons name="star" size={20} color={colors.text} />
							<Text style={styles.statValue}>{reviews.length}</Text>
						</View>
						<Text style={styles.statLabel}>Reviews</Text>
					</View>
				</View>
				<View style={styles.shareRow}>
					<Ionicons name="people" size={20} color={colors.text} />
					<View style={styles.shareText}>
						<Text style={styles.shareTitle}>Share check-ins</Text>
						<Text style={styles.shareHint}>When enabled, your friends can see where you are checked in</Text>
					</View>
					<Switch value={sharing} onValueChange={toggleSharing} trackColor={{ true: colors.primary }} />
				</View>

				<TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={() => router.push('/profile/edit')}>
					<Ionicons name="pencil" size={16} color={colors.lightText} />
					<Text style={styles.primaryButtonText}>Edit profile</Text>
					<Ionicons name="chevron-forward" size={16} color={colors.lightText} />
				</TouchableOpacity>
			</View>

			{favoritePlaces.length === 0 ? (
				<View style={styles.section}>
					<View style={styles.sectionTitleRow}>
						<Ionicons name="location" size={24} color={colors.text} />
						<Text style={styles.sectionTitle}>Favorite study places</Text>
					</View>
					<View style={styles.emptyRow}>
						<View style={styles.emptyContent}>
							<Text style={styles.emptyText}>You haven't saved any study places yet.</Text>
							<TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={() => router.navigate('/')}>
								<Ionicons name="compass-outline" size={18} color={colors.lightText} />
								<Text style={styles.primaryButtonText}>Explore study places</Text>
							</TouchableOpacity>
						</View>
						<Ionicons name="map-outline" size={52} color={colors.text} />
					</View>
				</View>
			) : (
				<>
					<View style={styles.captionRow}>
						<Ionicons name="location" size={20} color={colors.text} />
						<Text style={styles.caption}>Favorite study places</Text>
					</View>
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
				</>
			)}

			<View style={styles.captionRow}>
				<Text style={styles.caption}>My reviews</Text>
			</View>
			<View>
				{reviewsLoading ? (
					<Text style={styles.message}>Loading reviews...</Text>
				) : reviewsError ? (
					<Text style={styles.message}>Could not load reviews: {reviewsError}</Text>
				) : reviews.length === 0 ? (
					<Text style={styles.message}>You haven't written any reviews yet.</Text>
				) : (
					reviews.map((review) => {
						const image = placeImage(review.place_id);
						return (
							<Link
							// Länkar till platsen som recensionen gäller, får upp en modal
								key={review.id}
								href={{ pathname: '/place/[id]', params: { id: review.place_id } }}
								asChild
							>
								<TouchableOpacity style={styles.reviewItem} activeOpacity={0.8}>
									{image ? (
										<Image source={{ uri: image }} style={styles.reviewImage} />
									) : (
										<View style={[styles.reviewImage, styles.reviewImageFallback]}>
											<Ionicons name="library-outline" size={24} color={colors.primary} />
										</View>
									)}
									<View style={styles.reviewBody}>
										<Text style={styles.reviewPlace} numberOfLines={1}>
											{review.places?.name ?? 'Unknown place'}
										</Text>
										<View style={styles.reviewMetaRow}>
											<Text style={styles.reviewRating}>
												{'★'.repeat(review.rating)}{'☆'.repeat(Math.max(0, 5 - review.rating))}
											</Text>
											<Text style={styles.reviewDate}>
												{new Date(review.created_at).toLocaleDateString('sv-SE')}
											</Text>
										</View>
										{review.comment ? (
											<Text style={styles.reviewComment} numberOfLines={2}>{review.comment}</Text>
										) : null}
									</View>
									<Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
								</TouchableOpacity>
							</Link>
						);
					})
				)}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background
	},
	content: {
		padding: spacing.md,
		paddingBottom: spacing.xl,
	},
	message: {
		...type.body,
		color: colors.textMuted,
		padding: spacing.lg,
	},

	// Profilkortet
	header: {
		alignItems: 'center',
		backgroundColor: colors.cardBackground,
		borderRadius: radius.lg,
		overflow: 'hidden',
		paddingHorizontal: spacing.md,
		paddingBottom: spacing.md,
		marginBottom: spacing.md,
	},
	cover: {
		alignSelf: 'stretch',
		height: 110,
		marginHorizontal: -spacing.md,
		backgroundColor: colors.coverBackground,
	},
	profilePicture: {
		width: 112,
		height: 112,
		borderRadius: radius.pill,
		borderWidth: 4,
		borderColor: colors.cardBackground,
		marginTop: -64,
		marginBottom: spacing.sm,
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
		backgroundColor: colors.background,
		borderRadius: radius.md,
		paddingVertical: spacing.md,
		marginTop: spacing.md,
	},
	statItem: {
		flex: 1,
		alignItems: 'center',
	},
	statValueRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
	},
	statValue: {
		...type.heading,
		color: colors.text,
	},
	statLabel: {
		...type.caption,
		color: colors.textMuted,
		marginTop: spacing.xs,
	},
	statDivider: {
		width: StyleSheet.hairlineWidth,
		height: 40,
		backgroundColor: colors.textMuted,
		opacity: 0.4,
	},
	primaryButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'stretch',
		gap: spacing.sm,
		marginTop: spacing.sm,
		backgroundColor: colors.primary,
		borderRadius: radius.pill,
		paddingVertical: spacing.sm + 4,
	},
	primaryButtonText: {
		...type.buttonText,
		color: colors.lightText,
	},

	// Favoriter
	section: {
		backgroundColor: colors.cardBackground,
		borderRadius: radius.lg,
		padding: spacing.md,
		marginBottom: spacing.lg,
	},
	sectionTitleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
	},
	sectionTitle: {
		...type.heading,
		color: colors.text,
	},
	emptyRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.md,
		marginTop: spacing.xs,
	},
	emptyContent: {
		flex: 1,
	},
	emptyText: {
		...type.body,
		color: colors.textMuted,
		marginBottom: spacing.xs,
	},
	captionRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.xs,
		paddingBottom: 10,
	},
	caption: {
		...type.heading,
		color: colors.text,
	},
	list: {
		flex: 1,
		marginBottom: spacing.md,
	},

	// Recensioner
	reviewItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.md,
		backgroundColor: colors.cardBackground,
		borderRadius: radius.md,
		padding: spacing.sm,
		marginBottom: spacing.sm,
		borderWidth: 1,
		borderColor: colors.borderColor,
	},
	reviewImage: {
		width: 64,
		height: 64,
		borderRadius: radius.sm,
	},
	reviewImageFallback: {
		backgroundColor: colors.background,
		alignItems: 'center',
		justifyContent: 'center',
	},
	reviewBody: {
		flex: 1,
	},
	reviewPlace: {
		...type.heading,
		color: colors.text,
	},
	reviewMetaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		marginTop: 2,
	},
	reviewRating: {
		...type.body,
		color: colors.busynessDotMedium,
	},
	reviewDate: {
		...type.caption,
		color: colors.textMuted,
	},
	reviewComment: {
		...type.body,
		color: colors.text,
		marginTop: spacing.xs,
	},
		shareRow: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'stretch',
		gap: spacing.sm,
		backgroundColor: colors.cardBackground,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.background,
		padding: spacing.sm + 4,
		marginTop: spacing.sm,
	},
	shareText: {
		flex: 1,
	},
	shareTitle: {
		...type.body,
		fontWeight: '600',
		color: colors.text,
	},
	shareHint: {
		...type.caption,
		color: colors.textMuted,
	},
});
