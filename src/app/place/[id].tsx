import { useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNearbyPlace, useNearbyPlaces, } from '@/src/hooks/useNearbyPlaces';
import { usePlace } from '@/src/hooks/usePlaces';
import { colors, spacing, type } from '@/src/theme';
import { translatePlaceToInfoPage } from '@/src/utils/translatePlaceToInfoPage';
import { Ionicons } from '@expo/vector-icons';


// Panelen som dras upp från kartan. Egen fil från listans detaljsida, så de kan visa olika saker framöver.
export default function PlaceScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { place: mockplace } = usePlace(id);
	const { place: googlePlace, loading } = useNearbyPlace(id);

	const place = mockplace ?? googlePlace;
	if (loading && !place) return <Text style={styles.missing}>Laddar plats...</Text>;
	if (!place) return <Text style={styles.missing}>Hittade ingen plats med id {id}</Text>;

	const amenities = translatePlaceToInfoPage(place).amenities ?? [];
	const tag = translatePlaceToInfoPage(place).busyness ?? '—';


	return (
		<ScrollView key={id} style={styles.screen} contentContainerStyle={styles.content}>

			{/* Vill vi ha bilden mindre?*/}
			<View style={styles.imageWrapper}>
				{place.imageUrl ? (
					<Image
						source={{ uri: place.imageUrl }}
						style={styles.image}
						resizeMode="cover"
					/>
				) : (
					<View style={[styles.image, styles.imagePlaceholder]}>
						<Ionicons name="image-outline" size={22} color="grey" />
					</View>
				)}

				{/* Knappen är inte klickbar än, onPress senare? */}
				<TouchableOpacity style={styles.checkInButton}>
					<Text style={styles.checkInText}>Checka in</Text>
				</TouchableOpacity>
			</View>

			{/* Busyness, placerad längst upp i det vänstra hörnet, på bilden */}
			<View style={styles.tag}>
				<Text style={styles.tagText}>{tag}</Text>
			</View>


			<Text style={styles.title}>{place.name}</Text>

			{/* Tog bort rubrikerna, jag tänker att adressen säger sig själv */}
			<Text style={styles.rowSmall}>{place.address ?? ''} {place.building ?? ''} {place.floor ?? ''}</Text>
			<Text style={styles.rowSmall}>{place.latitude}°, {place.longitude}°</Text>

			{/* Ikonerna för bekvämligheterna som finns på studieplatsen */}
			{/* Ändrade från de små info-korten så de även skrivs ut bredvid ikonerna */}
			<View style={styles.amenitiesRow}>
				{amenities.map((a) => (
					<View key={a.key} style={styles.amenityPill}>
						<View style={styles.amenityCircle}>
							<Ionicons name={a.icon} size={13} color="#000" />
						</View>
						<Text style={styles.amenityLabel}>{a.label}</Text>

					</View>
				))}
			</View>


			<Text style={styles.row}>Öppettider: {place.openingHours ?? '—'}</Text>

			<Text style={styles.row}>Uppdaterad: {place.busynessUpdatedAt ?? '—'}</Text>


			{/* Skriver här så länge */}
			{/* Behöver ändra i Place-typen för at lägga till info om platsen */}
			{/* Osäker på hur man löser det med populära tiden och recensioner... */}
			<Text style={styles.rowTitle}>Info om platsen:</Text>
			<Text style={styles.row}>Fin plats med gott kaffe och fika✨</Text>

			{/* Fyll denna med info om populära tider */}
			<Text style={styles.rowTitle}>Populära tider:</Text>


			<Text style={styles.rowTitle}>Recensioner:</Text>
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
		borderRadius: 12,
	},
	amenityLabel: {
		fontSize: 10,
		fontWeight: '600',
		color: colors.textMuted,
		paddingLeft: 2,
	},
	amenityCircle: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: 'lightgrey',
		alignItems: 'center',
		justifyContent: 'center',
	},
	tag: {
		alignSelf: 'flex-start',
		position: 'absolute',
		top: 28,
		left: 35,
		backgroundColor: '#fff',
		borderRadius: 14,
		paddingHorizontal: 12,
		paddingVertical: 5,
		marginTop: 8,

	},
	tagText: {
		fontSize: 12,
		fontWeight: '700',
		color: '#000',
	},
	imageWrapper: {
		width: '100%',
		height: '70%',
		borderRadius: 12,
		overflow: 'hidden',
		position: 'relative',
	},
	image: {
		width: '100%',
		height: '100%',
	},
	imagePlaceholder: {
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
		backgroundColor: '#fff',
		borderRadius: 18,
		paddingVertical: 10,
		width: '35%',
		marginBottom: spacing.sm,
	},
	checkInText: {
		color: '#000',
		fontSize: 14,
		fontWeight: '700',
	},

});
