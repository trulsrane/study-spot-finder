//Översätter en plats till ett format som kan användas, och visas i, infokorten (CardContainer.tsx)

import { Ionicons } from '@expo/vector-icons';
import { Place } from '../types/place';

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

const amenityLabelMap: Record<string, string> = {
	outlets: 'Eluttag',
	wifi: 'WiFi',
	coffee: 'Kaffe',
	group: 'Grupprum',
	quiet: 'Tyst plats',
	daylight: 'Dagsljus',
	discount: 'Studentabatt',
	food: 'Mat',
};

const levelOfBusynessMap: Record<string, string> = {
	low: 'LUGNT',
	medium: 'MÅTTLIGT',
	high: 'HÖGT TEMPO',
	unknown: 'OKÄNT LÄGE',
};

export function translatePlaceToInfoPage(place: Place) {
	return {
		title: place.name,
		status: place.openingHours ?? 'Öppet',

		amenities: place.amenities.map((key) => ({
			key,
			icon: amenityIconMap[key] || 'help-circle-outline',
			label: amenityLabelMap[key] ?? key,
		})),
		busyness: levelOfBusynessMap[place.busyness ?? 'unknown'] ?? levelOfBusynessMap.unknown,
	};
}