//Översätter en plats till ett format som kan användas, och visas i, infokorten (CardContainer.tsx)

import { Ionicons } from '@expo/vector-icons';
import { Place } from '../types/db';

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
	outlets: 'Outlets',
	wifi: 'WiFi',
	coffee: 'Coffee',
	group: 'Group rooms',
	quiet: 'Quiet place',
	daylight: 'Daylight',
	discount: 'Student discount',
	food: 'Food',
};

const levelOfBusynessMap: Record<string, string> = {
	low: 'LOW',
	medium: 'MEDIUM',
	high: 'HIGH',
	unknown: 'UNKNOWN',
};

export function translatePlaceToInfoPage(place: Place) {
	return {
		title: place.name,
		status: place.opening_hours ?? 'Open',
		level: place.current_busyness ?? 'unknown',

		amenities: place.amenities.map((key) => ({
			key,
			icon: amenityIconMap[key] || 'help-circle-outline',
			label: amenityLabelMap[key] ?? key,
		})),
		busyness: levelOfBusynessMap[place.current_busyness ?? 'unknown'] ?? levelOfBusynessMap.unknown,
	};
}