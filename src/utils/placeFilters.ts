// Snabbfiltren under sökfältet på kartan, och platsernas kategorier (café, bibliotek, studieplats).

import { Ionicons } from '@expo/vector-icons';
import { Place } from '@/src/types/db';

type IconName = keyof typeof Ionicons.glyphMap;

// Värdena i kolumnen places.category
export const placeCategories = [
  { key: 'cafe', label: 'Café', icon: 'cafe' },
  { key: 'library', label: 'Library', icon: 'library' },
  { key: 'study_space', label: 'Study space', icon: 'school' },
] as const satisfies readonly { key: string; label: string; icon: IconName }[];

export type PlaceCategory = (typeof placeCategories)[number]['key'];

type PlaceFilter = {
  key: string;
  label: string;
  icon: IconName;
  // Kategorier är "antingen eller", bekvämligheter måste alla finnas
  group: 'category' | 'amenity';
  matches: (place: Place) => boolean;
};

const amenityFilter = (key: string, label: string, icon: IconName): PlaceFilter => ({
  key,
  label,
  icon,
  group: 'amenity',
  matches: (place) => place.amenities.includes(key),
});

export const placeFilters: PlaceFilter[] = [
  ...placeCategories.map((c) => ({
    key: c.key,
    label: c.label,
    icon: c.icon,
    group: 'category' as const,
    matches: (place: Place) => place.category === c.key,
  })),
  // Samma nycklar som amenities i databasen (se translatePlaceToInfoPage.ts)
  amenityFilter('quiet', 'Quiet', 'volume-mute'),
  amenityFilter('wifi', 'WiFi', 'wifi'),
  amenityFilter('outlets', 'Outlets', 'flash'),
  amenityFilter('group', 'Group rooms', 'people'),
  amenityFilter('food', 'Food', 'restaurant'),
];

// Väljer man Café och Library visas båda, väljer man Café och WiFi visas bara caféer med WiFi
export function matchesFilters(place: Place, selected: string[]) {
  const active = placeFilters.filter((f) => selected.includes(f.key));
  const categories = active.filter((f) => f.group === 'category');
  const amenities = active.filter((f) => f.group === 'amenity');
  return (
    (categories.length === 0 || categories.some((f) => f.matches(place))) &&
    amenities.every((f) => f.matches(place))
  );
}
