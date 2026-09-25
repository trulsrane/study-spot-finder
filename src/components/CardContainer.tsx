//import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Kort som visar snabb info om en studieplats. 
// Är nu fylld med data från mockPlaces.ts, ska senare fyllas i med riktig och korrekt data :)

export type Amenity = {
  icon: keyof typeof Ionicons.glyphMap;
  key: string;
};

type CardProps = {
  title?: string;
  status?: string;
  tag?: string;
  rating?: number;
  image?: ImageSourcePropType | string;
  amenities?: Amenity[];
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onPress?: () => void;
};

// storleken på bilden i kortet
const IMAGE_SIZE = 120;

//--------behövs inte nu------------
// // Om inga amenties skickas in, visa dessa
// const placeholderAmenities: Amenity[] = [
//   { key: 'charger', icon: 'flash' },
//   { key: 'wifi', icon: 'wifi' },
//   { key: 'cafe', icon: 'cafe' },
//   { key: 'daylight', icon: 'sunny'},
//   { key: 'discount', icon: 'pricetags'},
//   { key: 'food', icon: 'restaurant'},
//   { key: 'pets', icon: 'paw'}
// ];

export function Card({
  title = 'Platsens namn',
  status = 'Öppet',
  tag = 'LUGNT',
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
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.status}>{status}</Text>
          </View>

		//Favoritmarkering	
          <TouchableOpacity onPress={onToggleFavorite} hitSlop={8}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color="#000"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>

		//Ikonerna för bekvämligheterna som finns på studieplatsen
        <View style={styles.amenitiesRow}>
          {amenities.map((a) => (
            <View key={a.key} style={styles.amenityCircle}>
              <Ionicons name={a.icon} size={13} color="#000" />
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
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
  ratingBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  status: {
    fontSize: 13,
    color: 'grey',
    marginTop: 1,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'lightgrey',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    // letterSpacing: 0.5,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 8,
  },
  amenityCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'lightgrey',
    alignItems: 'center',
    justifyContent: 'center',
  },
});