import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNearbyPlace, useNearbyPlaces, } from '@/src/hooks/useNearbyPlaces';
import { usePlaces } from '@/src/hooks/usePlaces';
import { colors, spacing, type,radius } from '@/src/theme';
import { translatePlaceToInfoPage } from '@/src/utils/translatePlaceToInfoPage';
import { Ionicons } from '@expo/vector-icons';
import {openDirections} from '@/src/utils/openDirections';


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


			<Text style={styles.rowTitle}>Reviews:</Text>
			{/* Ska koppla till recensioner */}
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
		height: '70%',
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



});
