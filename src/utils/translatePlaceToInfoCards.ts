//Översätter en plats till ett format som kan användas, och visas i, infokorten (CardContainer.tsx)

import { Ionicons } from '@expo/vector-icons';
import { Place } from '@/src/types/db';

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
	low: 'LUGNT',
	medium: 'MÅTTLIGT',
	high: 'HÖGT TEMPO',
	unknown: 'OKÄNT LÄGE',
};

// 350 m under en kilometer, annars 1,2 km
function formatDistance(meters: number) {
	if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
	return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

// distance_meters finns bara när usePlaces fått en position, annars visas inget avstånd
export function translatePlaceToInfoCards(place: Place & { distance_meters?: number | null }) {
	return {
		title: place.name,
		status: place.opening_hours ?? 'Öppet',
		distance: place.distance_meters != null ? formatDistance(place.distance_meters) : undefined,

		amenities: place.amenities.map((key) => ({
			key,
			icon: amenityIconMap[key] || 'help-circle-outline',
		})),
		busyness: levelOfBusynessMap[place.current_busyness ?? 'unknown'] ?? levelOfBusynessMap.unknown,
	};
}