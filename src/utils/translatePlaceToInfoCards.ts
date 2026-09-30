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

export function translatePlaceToInfoCards(place: Place) {
	return {
		title: place.name,
		status: place.opening_hours ?? 'Öppet',

		amenities: place.amenities.map((key) => ({
			key,
			icon: amenityIconMap[key] || 'help-circle-outline',
		})),
		busyness: levelOfBusynessMap[place.current_busyness ?? 'unknown'] ?? levelOfBusynessMap.unknown,
	};
}