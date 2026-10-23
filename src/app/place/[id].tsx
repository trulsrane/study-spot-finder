import { useLocalSearchParams } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNearbyPlace, useNearbyPlaces, } from '@/src/hooks/useNearbyPlaces';
import { usePlaces } from '@/src/hooks/usePlaces';
import { colors, spacing, type, radius } from '@/src/theme';
import { translatePlaceToInfoPage } from '@/src/utils/translatePlaceToInfoPage';
import { Ionicons } from '@expo/vector-icons';
import { openDirections } from '@/src/utils/openDirections';
import { useReviews } from '@/src/hooks/useReviews';
import { useSession } from '@/src/hooks/useSession';
import { useCheckIns } from '@/src/hooks/useCheckIns';
import { useFavorites } from '@/src/hooks/useFavorites';
import { Image } from 'react-native';
import { ReviewForm } from '@/src/components/ReviewForm';
import { BusynessReportForm } from '@/src/components/BusynessReportForm';
import { Busyness } from '@/src/types/db';
import { useReportBusyness } from '@/src/hooks/useReportBusyness';
import { useState } from 'react';
import { useNow } from '@/src/hooks/useNow';

const tagColorMap: Record<string, string> = {
	low: colors.busynessLow,
	medium: colors.busynessMedium,
	high: colors.busynessHigh,
	unknown: colors.busynessUnknown,
};
// Panelen som dras upp från kartan. Egen fil från listans detaljsida, så de kan visa olika saker framöver.
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
	const [titleWrapped, setTitleWrapped] = useState(false);
	// Räknar upp "x mins ago" varje minut och växlar till Unknown när rapporten blir en timme gammal
	const now = useNow();
	const place = DbPlace ?? googlePlace;
	const loading = placesLoading || reviewsLoading || checkInsLoading || googlePlacesLoading;
	const error = placesError ?? reviewsError ?? checkInsError ?? googlePlacesError;
	if (loading && !place) return <Text style={styles.missing}>Loading place...</Text>;
	if (error && !place) return <Text style={styles.missing}>Error loading place: {error}</Text>;
	if (!place) return <Text style={styles.missing}>Hittade ingen plats med id {id}</Text>


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


	return (
		<ScrollView key={id} style={styles.screen} contentContainerStyle={styles.content}>

			<View style={styles.titleRow}>
				{/* Vänster: trängsel */}
				<View style={styles.titleSide}>
					<View style={[styles.tag, { backgroundColor: tagColorMap[level ?? 'unknown'] }]}>
						<Text style={styles.tagText}>
							<Ionicons name="person" color="#2F2319" /> {busyness}
						</Text>
					</View>
				</View>
			
				{/* Mitten: en rad, kapas med "…". Mätkopian upptäcker om namnet inte fick plats */}
				<View style={styles.titleCenter}>
					<Text style={styles.title} numberOfLines={1}>{place.name}</Text>
					<Text
						style={[styles.title, styles.titleMeasure]}
						onTextLayout={(e) => setTitleWrapped(e.nativeEvent.lines.length > 1)}
						pointerEvents="none"
						accessibilityElementsHidden
						importantForAccessibility="no-hide-descendants"
					>
						{place.name}
					</Text>
				</View>

				{/* Höger: favorit. Kolumnen finns kvar även utan hjärta, så titeln ligger kvar mitt på sidan */}
				<View style={[styles.titleSide, styles.titleSideRight]}>
					{DbPlace && (
						<TouchableOpacity
							onPress={() => toggleFavorite(DbPlace.id)}
							hitSlop={8}
							accessibilityLabel={isFavorite(DbPlace.id) ? 'Remove from favorites' : 'Add to favorites'}
						>
							<Ionicons
								name={isFavorite(DbPlace.id) ? 'heart' : 'heart-outline'}
								size={20}
								color="#2F2319"
							/>
						</TouchableOpacity>
					)}
				</View>
			</View>
			<Text style={styles.row}>Last updated: {info.lastUpdated}</Text>
			{/* ----------- */}
			{/* Rad 1: trängsel till vänster, favorit till höger */}
			{/* <View style={styles.topRow}>
				<View style={[styles.tag, { backgroundColor: tagColorMap[level ?? 'unknown'] }]}>
					<Text style={styles.tagText}>
						<Ionicons name="person" color="#2F2319" /> {busyness}
					</Text>
				</View>

				{DbPlace && (
					<TouchableOpacity
						onPress={() => toggleFavorite(DbPlace.id)}
						hitSlop={8}
						accessibilityLabel={isFavorite(DbPlace.id) ? 'Remove from favorites' : 'Add to favorites'}
					>
						<Ionicons
							name={isFavorite(DbPlace.id) ? 'heart' : 'heart-outline'}
							size={20}
							color="#2F2319"
						/>
					</TouchableOpacity>
				)}
			</View> */}

			{/* Rad 2: titeln på hela sidans bredd */}
			{/* <View style={styles.titleBox}> */}
			{/* Synlig rubrik: alltid en rad, med "…" i slutet om namnet inte får plats */}
			{/* <Text style={styles.title} numberOfLines={1}>{place.name}</Text> */}

			{/* Osynlig kopia utan radgräns, används bara för att mäta om namnet skulle behöva fler rader */}
			{/* <Text
					style={[styles.title, styles.titleMeasure]}
					onTextLayout={(e) => setTitleWrapped(e.nativeEvent.lines.length > 1)}
					pointerEvents="none"
					accessibilityElementsHidden
					importantForAccessibility="no-hide-descendants"
				>
					{place.name}
				</Text>
			</View> */}

			{/* Vill vi ha bilden mindre?*/}
			<View style={styles.imageWrapper}>
				{images.length > 0 ? (
					<Image source={{ uri: images[0] }} style={styles.image} resizeMode="cover" />
				) : (
					<View style={[styles.image, styles.imagePlaceholder]}>
						<Ionicons name="image-outline" size={22} color="grey" />
					</View>
				)}
				{/* Databasen har ingen bild-kolumn än, så vi visar alltid platshållaren */}

				{/* Samma knapp för båda: checkar ut om man redan är incheckad här, annars checkar den in.
				    Visas bara för platser i databasen, Google-platser går inte att checka in på. */}
				{DbPlace && (
					<TouchableOpacity
						style={styles.checkInButton}
						onPress={myCheckIn ? checkOut : handleCheckIn}
						disabled={saving}
						activeOpacity={0.8}
					>
						<Ionicons name={myCheckIn ? 'log-out-outline' : 'log-in-outline'} size={16} color={colors.icon} />
						<Text style={styles.checkInText}>{myCheckIn ? 'Check out' : 'Check in'}</Text>
					</TouchableOpacity>
				)}
			</View>
			{titleWrapped && <Text style={styles.fullTitle}>{place.name}</Text>}
			{/* Tog bort rubrikerna, jag tänker att adressen säger sig själv */}
			<View style={styles.addressRow}>
				<View style={styles.addressText}>
					<Text style={styles.rowSmall}>
						{[place.address, place.building].filter(Boolean).join(' ')}
						{place.floor != null && place.floor !== '' ? ` Floor: ${place.floor}` : ''}
					</Text>
					{/* <Text style={styles.rowSmall}>{place.latitude}°, {place.longitude}°</Text> */}
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

			{/* Rapportera in trängseln */}
			<View style={styles.busynessContainer}>
				{DbPlace && <BusynessReportForm placeId={DbPlace.id} onReported={refetch} />}
			</View>




			<View style={styles.container}>
				{/* Texten som angavs när platsen lades till */}
				<Text style={styles.rowTitle}>Info about the place:</Text>
				<Text style={styles.row}>{place.description ?? 'No info about this place yet.'}</Text>
			</View>

			<Text style={styles.row}>Opening hours: {place.opening_hours ?? '—'}</Text>

			
			{/* Fyll denna med info om populära tider */}
			<Text style={styles.rowTitle}>Popular times:</Text>

			<View style={styles.reviewContainer}>
				<Text style={styles.rowTitle}>Reviews ({count}):</Text>
				<Text style={styles.rowSmall}>Average rating: {averageRating?.toFixed(1) ?? '—'}</Text>

				<ReviewForm onSubmit={submitReview} submitting={submitting} />

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
		paddingTop: spacing.lg,
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
	// titleRow: {
	// 	flexDirection: 'row',
	// 	alignItems: 'flex-start',
	// 	gap: spacing.sm,
	// 	marginBottom: spacing.sm,
	// },
	// titleSide: {
	// 	flex: 1,
	// 	minWidth: 90,
	// },
	// titleSideRight: {
	// 	alignItems: 'flex-end',
	// },
	// title: {
	// 	...type.title,
	// 	color: colors.text,
	// 	textAlign: 'center',
	// 	flexShrink: 1,
	// },
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
		borderRadius: radius.pill,
		paddingHorizontal: 12,
		paddingVertical: 5,
	},
	tagText: {
		fontSize: type.tag.fontSize,
		fontWeight: type.tag.fontWeight,
		color: colors.text,
	},
	imageWrapper: {
		marginTop: spacing.sm,
		width: '100%',
		aspectRatio: 4.2 / 3,
		borderRadius: radius.md,
		overflow: 'hidden',
		position: 'relative',
		// Luft mellan bilden och adressen under
		marginBottom: spacing.sm,
	},
	image: {
		width: '100%',
		height: '100%',
		backgroundColor: colors.imageBackground,
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
		gap: spacing.sm,
	},
	reviewContent: {
		flex: 1,
		flexShrink: 1,
		paddingRight: spacing.sm,
	},
	addressRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: spacing.sm,
	},
	addressText: {
		flex: 1
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
	// titleMeasure: {
	// 	position: 'absolute',
	// 	top: 0,
	// 	left: 0,
	// 	right: 0,
	// 	opacity: 0,
	// },
	fullTitle: {
		...type.heading,       // lite mindre än type.title
		color: colors.text,
		marginBottom: spacing.xs,
	},
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		marginBottom: spacing.sm,
	},
	titleSide: {
		width: 100,          // lika bred på båda sidor, så att titeln hamnar mitt på sidan
	},
	titleSideRight: {
		alignItems: 'flex-end',
	},
	titleCenter: {
		flex: 1,             // fyller exakt det som blir kvar mellan sidorna, aldrig mer
		minWidth: 0,         // låter texten krympa och kapas istället för att trycka ut hjärtat
	},
	title: {
		...type.title,
		color: colors.text,
		textAlign: 'center',
	},
	titleMeasure: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		opacity: 0,
	},
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



});
