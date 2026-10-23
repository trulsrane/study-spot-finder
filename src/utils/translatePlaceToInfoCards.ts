//Översätter en plats till ett format som kan användas, och visas i, infokorten (CardContainer.tsx)

import { Ionicons } from '@expo/vector-icons';
import { Place } from '@/src/types/db';
import { currentBusyness } from '@/src/utils/busyness';

//Översätter bekvämlighter till ikoner som visas i korten
const amenityIconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
	outlets: 'flash',
	wifi: 'wifi',
	coffee: 'cafe',
	group: 'people',
	quiet: 'volume-mute',
	daylight: 'sunny',
	discount: 'pricetags',
	food: 'restaurant',
};

const levelOfBusynessMap: Record<string, string> = {
	low: 'LOW',
	medium: 'MEDIUM',
	high: 'HIGH',
	unknown: 'UNKNOWN',
};

// 350 m under en kilometer, annars 1,2 km
function formatDistance(meters: number) {
	if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
	return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

// distance_meters finns bara när usePlaces fått en position, annars visas inget avstånd
export function translatePlaceToInfoCards(place: Place & { distance_meters?: number | null }) {
	const level = currentBusyness(place);
	return {
		title: place.name,
		status: place.opening_hours ?? 'Open',
		level,
		distance: place.distance_meters != null ? formatDistance(place.distance_meters) : undefined,
		// Första bilden visas i kortet, saknas den visas den grå platshållaren
		image: place.image_urls[0],

		amenities: place.amenities.map((key) => ({
			key,
			icon: amenityIconMap[key] || 'help-circle-outline',
		})),
		busyness: levelOfBusynessMap[level] ?? levelOfBusynessMap.unknown,
	};
}