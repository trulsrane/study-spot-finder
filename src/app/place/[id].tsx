import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNearbyPlace, useNearbyPlaces, } from '@/src/hooks/useNearbyPlaces';
import { usePlaces } from '@/src/hooks/usePlaces';
import { colors, spacing, type, radius } from '@/src/theme';
import { translatePlaceToInfoPage } from '@/src/utils/translatePlaceToInfoPage';
import { Ionicons } from '@expo/vector-icons';
import { openDirections } from '@/src/utils/openDirections';
import { useReviews } from '@/src/hooks/useReviews';

const tagColorMap: Record<string, string> = {
	low: colors.busynessLow,
	medium: colors.busynessMedium,
	high: colors.busynessHigh,
	unknown: colors.busynessUnknown,
};
// Panelen som dras upp från kartan. Egen fil från listans detaljsida, så de kan visa olika saker framöver.
export default function PlaceScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { places } = usePlaces();
	const DbPlace = places.find((p) => p.id === id);

	const { place: googlePlace, loading } = useNearbyPlace(id);
	const { reviews, averageRating, count, loading: reviewsLoading, error: reviewsError, submitReview, submitting } = useReviews(id);

	const place = DbPlace ?? googlePlace;
	if (loading && !place) return <Text style={styles.missing}>Laddar plats...</Text>;
	if (!place) return <Text style={styles.missing}>Hittade ingen plats med id {id}</Text>;



	const amenities = translatePlaceToInfoPage(place).amenities ?? [];
	const busyness = translatePlaceToInfoPage(place).busyness ?? '—';
	const level = translatePlaceToInfoPage(place).level ?? 'unknown';


	return (
		<ScrollView key={id} style={styles.screen} contentContainerStyle={styles.content}>

			{/* Vill vi ha bilden mindre?*/}
			<View style={styles.imageWrapper}>
				{/* Databasen har ingen bild-kolumn än, så vi visar alltid platshållaren */}
				<View style={[styles.image, styles.imagePlaceholder]}>
					<Ionicons name="image-outline" size={22} color="grey" />
				</View>

				{/* Knappen är inte klickbar än, onPress senare? */}
				<TouchableOpacity style={styles.checkInButton}>
					<Text style={styles.checkInText}>Check in</Text>
				</TouchableOpacity>
			</View>

			{/* Busyness, placerad längst upp i det vänstra hörnet, på bilden */}
			<View style={[styles.tag, { backgroundColor: tagColorMap[level ?? 'unknown'] }]}>
				<Text style={styles.tagText}>{busyness}</Text>
			</View>


			<Text style={styles.title}>{place.name}</Text>

			{/* Tog bort rubrikerna, jag tänker att adressen säger sig själv */}
			<Text style={styles.rowSmall}>{place.address ?? ''} {place.building ?? ''} {place.floor ?? ''}</Text>
			<Text style={styles.rowSmall}>{place.latitude}°, {place.longitude}°</Text>
			{/* Vägbeskrivning visas bara för platser från databasen */}
			{DbPlace && (
				<TouchableOpacity
					style={styles.directionsButton}
					onPress={() => openDirections(DbPlace.latitude, DbPlace.longitude)}
				>
					<Ionicons name="navigate-outline" size={16} color={colors.icon} />
					<Text style={styles.directionsText}>Vägbeskrivning</Text>
				</TouchableOpacity>
			)}


			{/* Ikonerna för bekvämligheterna som finns på studieplatsen */}
			{/* Ändrade från de små info-korten så de även skrivs ut bredvid ikonerna */}
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


			<Text style={styles.row}>Opening hours: {place.opening_hours ?? '—'}</Text>

			<Text style={styles.row}>Updated: {place.busyness_updated_at ?? '—'}</Text>


			{/* Skriver här så länge */}
			{/* Behöver ändra i Place-typen för at lägga till info om platsen */}
			{/* Osäker på hur man löser det med populära tiden och recensioner... */}
			<Text style={styles.rowTitle}>Info about the place:</Text>
			<Text style={styles.row}>✨✨✨✨✨✨✨✨✨✨✨✨✨</Text>

			{/* Fyll denna med info om populära tider */}
			<Text style={styles.rowTitle}>Popular times:</Text>
			
			<View style={styles.reviewContainer}>
				<Text style={styles.rowTitle}>Reviews ({count}):</Text>
				<Text style={styles.rowSmall}>Average rating: {averageRating?.toFixed(1) ?? '—'}</Text>

				{/* <View style={styles.ratingBadge}>
					<Text style={styles.ratingText}>{averageRating?.toFixed(1) ?? '—'}</Text>
					<Ionicons name="star" size={11} color="#000" />
				</View> */}

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

								{/* Allt till höger om bilden — namn, rating OCH kommentar — i samma kolumn */}
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
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	content: {
		padding: spacing.lg,
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
	title: {
		...type.title,
		color: colors.text,
		marginBottom: spacing.sm,
		marginTop: spacing.sm,
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
	tag: {
		alignSelf: 'flex-start',
		position: 'absolute',
		top: 28,
		left: 35,
		borderRadius: radius.pill,
		paddingHorizontal: 12,
		paddingVertical: 5,
		marginTop: 8,

	},
	tagText: {
		fontSize: type.tag.fontSize,
		fontWeight: type.tag.fontWeight,
		color: colors.text,
	},
	imageWrapper: {
		width: '100%',
		aspectRatio: 4 / 3,
		borderRadius: radius.md,
		overflow: 'hidden',
		position: 'relative',
	},
	image: {
		width: '100%',
		height: '100%',
	},
	imagePlaceholder: {
		//kan ha denna så länge
		//ska vara en bild senare
		backgroundColor: 'lightgrey',
		alignItems: 'center',
		justifyContent: 'center',
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

	reviewItem: {
		marginTop: spacing.sm,
		padding: spacing.sm,
		backgroundColor: colors.cardBackground,
		borderRadius: radius.md,
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
	reviewContainer: {
		
	},
	// ratingBadge: {
	// 	position: 'absolute',
	// 	// bottom: 6,
	// 	// left: 6,
	// 	flexDirection: 'row',
	// 	alignItems: 'center',
	// 	backgroundColor: colors.buttonBackground,
	// 	borderRadius: 12,
	// 	paddingHorizontal: 7,
	// 	paddingVertical: 3,
	// 	gap: 3,
	// },
	// ratingText: {
	// 	fontSize: 11,
	// 	fontWeight: '600',
	// 	color: colors.text,
	// },
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
		gap: spacing.sm, // eller vad du redan har där
	},
	reviewContent: {
		flex: 1,
		flexShrink: 1,
		paddingRight: spacing.sm,
	},

});
