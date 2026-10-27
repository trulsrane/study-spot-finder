import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { usePlaces } from '@/src/hooks/usePlaces';
import { useNearbyPlace } from '@/src/hooks/useNearbyPlaces';
import { useReviews } from '@/src/hooks/useReviews';
import { useSession } from '@/src/hooks/useSession';
import { useCheckIns } from '@/src/hooks/useCheckIns';
import { useFavorites } from '@/src/hooks/useFavorites';
import { useReportBusyness } from '@/src/hooks/useReportBusyness';
import { useNow } from '@/src/hooks/useNow';
import { ReviewForm } from '@/src/components/ReviewForm';
import { ReviewModal } from '@/src/components/ReviewModal';
import { BusynessReportForm } from '@/src/components/BusynessReportForm';
import { Busyness } from '@/src/types/db';
import { colors, radius, spacing, type } from '@/src/theme';
import { translatePlaceToInfoPage } from '@/src/utils/translatePlaceToInfoPage';
import { openDirections } from '@/src/utils/openDirections';

const tagColorMap: Record<string, string> = {
	low: colors.busynessLow,
	medium: colors.busynessMedium,
	high: colors.busynessHigh,
	unknown: colors.busynessUnknown,
};

// Detaljsidan som pushas från listan. Samma innehåll och stil som panelen på kartan (place/[id].tsx),
// men här ligger bilden överst med hjärtat i hörnet, och namnet och trängseln står under bilden.
export default function PlaceScreen() {
	const userId = useSession()?.user.id;
	const { reportBusyness } = useReportBusyness();
	const { id } = useLocalSearchParams<{ id: string }>();
	const { places, loading: placesLoading, error: placesError, refetch } = usePlaces();
	const DbPlace = places.find((p) => p.id === id);
	const images = DbPlace?.image_urls ?? [];

	const { place: googlePlace, loading: googlePlacesLoading, error: googlePlacesError } = useNearbyPlace(id);
	const { reviews, averageRating, count, loading: reviewsLoading, error: reviewsError, submitReview, submitting } = useReviews(id);
	const { checkIn, checkOut, myCheckIn, saving, loading: checkInsLoading, error: checkInsError } = useCheckIns(DbPlace?.id);
	const { isFavorite, toggleFavorite } = useFavorites();
	const [reviewOpen, setReviewOpen] = useState(false);
	// Räknar upp "x mins ago" varje minut och växlar till Unknown när rapporten blir en timme gammal
	const now = useNow();
	const place = DbPlace ?? googlePlace;
	const loading = placesLoading || reviewsLoading || checkInsLoading || googlePlacesLoading;
	const error = placesError ?? reviewsError ?? checkInsError ?? googlePlacesError;
	if (loading && !place) return <Text style={styles.missing}>Loading place...</Text>;
	if (error && !place) return <Text style={styles.missing}>Error loading place: {error}</Text>;
	if (!place) return <Text style={styles.missing}>Hittade ingen plats med id {id}</Text>;

	const info = translatePlaceToInfoPage(place, now);
	const amenities = info.amenities ?? [];
	const busyness = info.busyness ?? '—';
	const level = info.level ?? 'unknown';

	// Användaren måste rapportera hur fullt det är för att kunna checka in
	function handleCheckIn() {
		if (!userId || !DbPlace) {
			Alert.alert('Log in', 'You need to be logged in to check in.');
			return;
		}

		async function reportAndCheckIn(level: Busyness) {
			const result = await reportBusyness({ place_id: DbPlace!.id, user_id: userId!, level });
			if (result) refetch();
			await checkIn();
		}

		Alert.alert(
			'How busy is it?',
			'Report the busyness to check in.',
			[
				{ text: 'Low', onPress: () => reportAndCheckIn('low') },
				{ text: 'Medium', onPress: () => reportAndCheckIn('medium') },
				{ text: 'High', onPress: () => reportAndCheckIn('high') },
				// Visas bara på iOS, Android har max tre knappar och stänger istället vid tryck utanför/bakåt
				{ text: 'Cancel', style: 'destructive' },
			],
			{ cancelable: true },
		);
	}

	// Checkar ut och visar recensionsrutan, men bara om man inte redan har recenserat platsen
	async function handleCheckOut() {
		const checkedOut = await checkOut();
		const alreadyReviewed = reviews.some((r) => r.user_id === userId);
		if (checkedOut && !alreadyReviewed) setReviewOpen(true);
	}

	return (
		<ScrollView key={id} style={styles.screen} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">

			{/* Bilden överst, med favorit uppe till höger och check in-knappen längst ner */}
			<View style={styles.imageWrapper}>
				{images.length > 0 ? (
					<Image source={{ uri: images[0] }} style={styles.image} resizeMode="cover" />
				) : (
					<View style={[styles.image, styles.imagePlaceholder]}>
						<Ionicons name="image-outline" size={22} color="grey" />
					</View>
				)}

				{/* Vit cirkel bakom hjärtat så att det syns mot alla bilder, både ljusa och mörka */}
				{DbPlace && (
					<TouchableOpacity
						style={styles.favoriteButton}
						onPress={() => toggleFavorite(DbPlace.id)}
						hitSlop={8}
						accessibilityLabel={isFavorite(DbPlace.id) ? 'Remove from favorites' : 'Add to favorites'}
					>
						<Ionicons
							name={isFavorite(DbPlace.id) ? 'heart' : 'heart-outline'}
							size={20}
							color={colors.text}
						/>
					</TouchableOpacity>
				)}

				{/* Samma knapp för båda: checkar ut om man redan är incheckad här, annars checkar den in.
				    Visas bara för platser i databasen, Google-platser går inte att checka in på. */}
				{DbPlace && (
					<TouchableOpacity
						style={styles.checkInButton}
						onPress={myCheckIn ? handleCheckOut : handleCheckIn}
						disabled={saving}
						activeOpacity={0.8}
					>
						<Ionicons name={myCheckIn ? 'log-out-outline' : 'log-in-outline'} size={16} color={colors.icon} />
						<Text style={styles.checkInText}>{myCheckIn ? 'Check out' : 'Check in'}</Text>
					</TouchableOpacity>
				)}
			</View>

			{/* Under bilden: namnet till vänster och trängseln till höger. Namnet får radbrytas, det finns plats. */}
			<View style={styles.titleRow}>
				<Text style={styles.title}>{place.name}</Text>
				<View style={[styles.tag, { backgroundColor: tagColorMap[level] }]}>
					<Text style={styles.tagText}>
						<Ionicons name="person" color={colors.text} /> {busyness}
					</Text>
				</View>
			</View>
			<Text style={styles.row}>Last updated: {info.lastUpdated}</Text>

			<View style={styles.addressRow}>
				<View style={styles.addressText}>
					<Text style={styles.rowSmall}>
						{[place.address, place.building].filter(Boolean).join(' ')}
						{place.floor != null && place.floor !== '' ? ` Floor: ${place.floor}` : ''}
					</Text>
				</View>

				{/* Vägbeskrivning visas bara för platser från databasen */}
				{DbPlace && (
					<TouchableOpacity
						style={styles.directionsButton}
						onPress={() => openDirections(DbPlace.latitude, DbPlace.longitude)}
					>
						<Ionicons name="navigate-outline" size={16} color={colors.icon} />
						<Text style={styles.directionsText}>Directions</Text>
					</TouchableOpacity>
				)}
			</View>

			{/* Ikonerna för bekvämligheterna som finns på studieplatsen */}
			<View style={styles.amenitiesRow}>
				{amenities.map((a) => (
					<View key={a.key} style={styles.amenityPill}>
						<View style={styles.amenityCircle}>
							<Ionicons name={a.icon} size={13} color={colors.icon} />
						</View>
						<Text style={styles.amenityLabel}>{a.label}</Text>
					</View>
				))}
			</View>

			{/* Rapportera in trängseln */}
			{DbPlace && (
				<View style={styles.busynessContainer}>
					<BusynessReportForm placeId={DbPlace.id} onReported={refetch} />
				</View>
			)}

			<View style={styles.container}>
				{/* Texten som angavs när platsen lades till */}
				<Text style={styles.rowTitle}>Info about the place:</Text>
				<Text style={styles.row}>{place.description ?? 'No info about this place yet.'}</Text>
			</View>

			<Text style={styles.row}>Opening hours: {place.opening_hours ?? '—'}</Text>

			{/* Fyll denna med info om populära tider */}
			<Text style={styles.rowTitle}>Popular times:</Text>

			<View>
				<Text style={styles.rowTitle}>Reviews ({count}):</Text>
				<Text style={styles.rowSmall}>Average rating: {averageRating?.toFixed(1) ?? '—'}</Text>

				<ReviewForm onSubmit={submitReview} submitting={submitting} />

				{reviewsLoading ? (
					<Text style={styles.row}>Loading reviews...</Text>
				) : reviewsError ? (
					<Text style={styles.row}>Error loading reviews: {reviewsError}</Text>
				) : reviews.length === 0 ? (
					<Text style={styles.row}>No reviews yet.</Text>
				) : (
					reviews.map((review) => (
						<View key={review.id} style={styles.reviewItem}>
							<View style={styles.reviewProfilePicture}>
								<View style={[styles.profile, styles.profilePlaceholder]}>
									<Ionicons name="person-outline" size={22} color="grey" />
								</View>

								<View style={styles.reviewContent}>
									<Text style={styles.reviewAuthor}>
										{review.profiles?.display_name ?? review.profiles?.username ?? 'Unknown user'}
									</Text>
									<Text style={styles.reviewRating}>Rating: {review.rating}</Text>
									{review.comment ? <Text style={styles.reviewComment}>{review.comment}</Text> : null}
								</View>
							</View>
						</View>
					))
				)}
			</View>

			<ReviewModal
				visible={reviewOpen}
				onSubmit={submitReview}
				submitting={submitting}
				onClose={() => setReviewOpen(false)}
			/>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	content: {
		padding: spacing.md,
	},
	missing: {
		...type.body,
		color: colors.textMuted,
		padding: spacing.lg,
	},
	row: {
		...type.body,
		color: colors.text,
		marginTop: spacing.sm,
	},
	rowTitle: {
		...type.heading,
		color: colors.text,
		marginTop: spacing.sm,
		marginBottom: spacing.xs,
	},
	rowSmall: {
		...type.caption,
		color: colors.textMuted,
	},
	screen: {
		backgroundColor: colors.background,
		flex: 1,
	},

	// Bilden och knapparna på den
	imageWrapper: {
		width: '100%',
		aspectRatio: 4.2 / 3,
		borderRadius: radius.md,
		overflow: 'hidden',
		position: 'relative',
		marginBottom: spacing.sm,
	},
	image: {
		width: '100%',
		height: '100%',
		backgroundColor: colors.imageBackground,
	},
	imagePlaceholder: {
		backgroundColor: 'lightgrey',
		alignItems: 'center',
		justifyContent: 'center',
	},
	favoriteButton: {
		position: 'absolute',
		top: spacing.sm,
		right: spacing.sm,
		width: 36,
		height: 36,
		borderRadius: radius.pill,
		backgroundColor: colors.buttonBackground,
		alignItems: 'center',
		justifyContent: 'center',
		// Skugga så att den vita cirkeln syns även mot ljusa bilder
		shadowColor: '#000',
		shadowOpacity: 0.2,
		shadowRadius: 3,
		shadowOffset: { width: 0, height: 1 },
		elevation: 3,
	},
	checkInButton: {
		flexDirection: 'row',
		position: 'absolute',
		bottom: 1,
		alignSelf: 'center',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
		backgroundColor: colors.buttonBackground,
		borderRadius: radius.lg,
		paddingVertical: 10,
		width: '35%',
		marginBottom: spacing.sm,
	},
	checkInText: {
		color: colors.text,
		fontSize: type.buttonText.fontSize,
		fontWeight: type.buttonText.fontWeight,
	},

	// Namnet och trängseln under bilden
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		marginBottom: spacing.xs,
	},
	title: {
		...type.title,
		color: colors.text,
		flex: 1,
	},
	tag: {
		borderRadius: radius.pill,
		paddingHorizontal: 12,
		paddingVertical: 5,
	},
	tagText: {
		fontSize: type.tag.fontSize,
		fontWeight: type.tag.fontWeight,
		color: colors.text,
	},

	addressRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: spacing.sm,
	},
	addressText: {
		flex: 1,
	},
	directionsButton: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'flex-start',
		gap: 6,
		backgroundColor: colors.greenButtonBackground,
		borderRadius: radius.pill,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
		marginTop: spacing.sm,
	},
	directionsText: {
		color: colors.text,
		fontSize: type.buttonText.fontSize,
		fontWeight: type.buttonText.fontWeight,
	},

	amenitiesRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 5,
		marginTop: 8,
	},
	amenityPill: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: radius.pill,
	},
	amenityLabel: {
		fontSize: type.amenityLabel.fontSize,
		fontWeight: type.amenityLabel.fontWeight,
		color: colors.textMuted,
		paddingLeft: 2,
	},
	amenityCircle: {
		width: 28,
		height: 28,
		borderRadius: radius.pill,
		backgroundColor: colors.amenityCircle,
		alignItems: 'center',
		justifyContent: 'center',
	},

	// Vita rutor, samma som på kartans panel
	busynessContainer: {
		paddingTop: spacing.sm,
		paddingBottom: spacing.md,
		marginTop: spacing.sm,
		backgroundColor: colors.buttonBackground,
		borderRadius: radius.md,
		padding: spacing.md,
		marginBottom: spacing.sm,
		shadowColor: colors.amenityCircle,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 2,
		borderWidth: 1,
		borderColor: colors.borderColor,
	},
	container: {
		paddingTop: spacing.xs,
		paddingBottom: spacing.md,
		backgroundColor: colors.buttonBackground,
		borderRadius: radius.md,
		padding: spacing.md,
		marginBottom: spacing.sm,
		shadowColor: colors.amenityCircle,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 2,
		borderWidth: 1,
		borderColor: colors.borderColor,
	},

	// Recensioner
	reviewItem: {
		marginTop: spacing.sm,
		padding: spacing.sm,
		backgroundColor: colors.cardBackground,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.borderColor,
	},
	reviewAuthor: {
		fontSize: type.body.fontSize,
		fontWeight: 600,
	},
	reviewRating: {
		fontSize: type.body.fontSize,
		fontWeight: 600,
	},
	reviewComment: {
		fontSize: type.caption.fontSize,
		color: colors.textMuted,
	},
	profile: {
		width: 50,
		height: 50,
		borderRadius: radius.pill,
	},
	profilePlaceholder: {
		backgroundColor: 'lightgrey',
		alignItems: 'center',
		justifyContent: 'center',
	},
	reviewProfilePicture: {
		flexDirection: 'row',
		gap: spacing.sm,
	},
	reviewContent: {
		flex: 1,
		flexShrink: 1,
		paddingRight: spacing.sm,
	},
});
