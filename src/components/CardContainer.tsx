//import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, type } from '../theme';

// Kort som visar snabb info om en studieplats. 
// Är nu fylld med data från mockPlaces.ts, ska senare fyllas i med riktig och korrekt data :)

export type Amenity = {
	icon: keyof typeof Ionicons.glyphMap;
	key: string;
	//   label: string;
};

const tagColorMap: Record<string, string> = {
	low: colors.busynessLow,
	medium: colors.busynessMedium,
	high: colors.busynessHigh,
	unknown: colors.busynessUnknown,
};

type CardProps = {
	title?: string;
	status?: string;
	level?: string;
	distance?: string;
	busyness?: string;
	rating?: number;
	image?: ImageSourcePropType | string;
	amenities?: Amenity[];
	isFavorite?: boolean;
	onToggleFavorite?: () => void;
	onPress?: () => void;
};

// storleken på bilden i kortet
const IMAGE_SIZE = 120;

export function Card({
	title = 'Place name',
	status = 'Open',
	distance,
	level,
	busyness = 'LUGNT',
	rating,
	image,
	amenities = [],
	isFavorite = false,
	onToggleFavorite,
	onPress,
}: CardProps) {
	return (
		// Klickbart kort -> kan ändra utseendet senare
		<TouchableOpacity
			activeOpacity={0.8}
			onPress={onPress}
			style={styles.card}
		>
			<View style={styles.imageWrapper}>
				{image ? (
					<Image
						source={typeof image === 'string' ? { uri: image } : image}
						style={styles.image}
						resizeMode="cover"
					/>
				) : (
					<View style={[styles.image, styles.imagePlaceholder]}>
						<Ionicons name="image-outline" size={22} color="grey" />
					</View>
				)}

				{rating !== undefined && (
					<View style={styles.ratingBadge}>
						<Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
						<Ionicons name="star" size={11} color="#000" />
					</View>
				)}
			</View>

			<View style={styles.content}>
				{/* Överdel: titel och status, alltid högst upp */}
				<View style={styles.headerRow}>
					<View style={{ flex: 1 }}>
						<Text style={styles.title} numberOfLines={1}>{title}</Text>
						<View style={styles.statusRow}>
							<Text style={[styles.status, styles.statusText]} numberOfLines={1}>{status}</Text>
							
						</View>
						{distance ? <Text style={styles.status}>{distance}</Text> : null}
					</View>

					{/* Favoritmarkering */}
					<TouchableOpacity onPress={onToggleFavorite} hitSlop={8}>
						<Ionicons
							name={isFavorite ? 'heart' : 'heart-outline'}
							size={20}
							color="#000"
						/>
					</TouchableOpacity>
				</View>

				{/* Underdel: trängsel och bekvämligheter, alltid längst ner */}
				<View>
					<View style={[styles.tag, { backgroundColor: tagColorMap[level ?? 'unknown'] }]}>
						<Text style={styles.tagText}>{busyness}</Text>
					</View>

					<View style={styles.amenitiesRow}>
						{amenities.map((a) => (
							<View key={a.key} style={styles.amenityCircle}>
								<Ionicons name={a.icon} size={13} color={colors.icon} />
							</View>
						))}
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		flexDirection: 'row',
		backgroundColor: colors.buttonBackground,
		borderRadius: radius.md,
		padding: spacing.sm,
		paddingBottom: spacing.sm,
		marginBottom: spacing.sm,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 2,
		borderWidth: 1,
		borderColor: colors.borderColor,
	},
	imageWrapper: {
		width: IMAGE_SIZE,
		height: IMAGE_SIZE,
		borderRadius: radius.sm,
		overflow: 'hidden',
	},
	image: {
		width: '100%',
		height: '100%',
	},
	imagePlaceholder: {
		//ska ändras senare till en bild...
		//så behöver inte ha en tema-färg
		backgroundColor: 'lightgrey',
		alignItems: 'center',
		justifyContent: 'center',
	},
	ratingBadge: {
		position: 'absolute',
		bottom: 6,
		left: 6,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.buttonBackground,
		borderRadius: 12,
		paddingHorizontal: 7,
		paddingVertical: 3,
		gap: 3,
	},
	ratingText: {
		fontSize: 11,
		fontWeight: '600',
		color: colors.text,
	},
	// content: {
	// 	flex: 1,
	// 	marginLeft: 12,
	// 	justifyContent: 'center',
	// },
	headerRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
	},
	title: {
		fontSize: type.heading.fontSize,
		fontWeight: type.heading.fontWeight,
		color: colors.text,
	},
	status: {
		fontSize: 13,
		color: colors.textMuted,
		marginTop: 1,
	},
	tag: {
		alignSelf: 'flex-start',
		backgroundColor: colors.background,
		borderRadius: radius.pill,
		paddingHorizontal: spacing.md,
		paddingVertical: 5,
		marginTop: 8,
	},
	tagText: {
		fontSize: 12,
		fontWeight: '700',
		color: colors.text,
	},
	// amenitiesRow: {
	// 	flexDirection: 'row',
	// 	flexWrap: 'wrap',
	// 	gap: 5,
	// 	marginTop: 8,
	// },
	amenityCircle: {
		width: 28,
		height: 28,
		borderRadius: radius.pill,
		backgroundColor: colors.amenityCircle,
		alignItems: 'center',
		justifyContent: 'center',
	},
	content: {
		flex: 1,
		marginLeft: 12,
		height: IMAGE_SIZE,                 // lika hög som bilden, så kortet alltid är lika högt
		justifyContent: 'space-between',    // överdelen uppe, underdelen nere
		
	},
	statusRow: {
		flexDirection: 'row',
	},
	statusText: {
		flexShrink: 1,                      // långa öppettider kapas med "…" i stället för att tränga undan avståndet
	},
	amenitiesRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 5,
		marginTop: spacing.sm,
		minHeight: 28,                      // håller kvar taggen på samma höjd även när platsen saknar bekvämligheter
	},
});