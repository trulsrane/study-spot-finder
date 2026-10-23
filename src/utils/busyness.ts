import { Busyness, Place } from '@/src/types/db';

// Hur länge en rapport gäller. Har ingen rapporterat (eller checkat in) på så länge räknas det som okänt.
export const BUSYNESS_MAX_AGE_MS = 60 * 60 * 1000;

type BusynessFields = Pick<Place, 'current_busyness' | 'busyness_updated_at'>;

// Minuter sedan senaste rapporten, eller null om rapporten saknas eller är för gammal
function minutesSinceUpdate(place: BusynessFields, now: number): number | null {
	if (place.current_busyness === 'unknown' || !place.busyness_updated_at) return null;
	const age = now - new Date(place.busyness_updated_at).getTime();
	if (age > BUSYNESS_MAX_AGE_MS) return null;
	return Math.max(0, Math.floor(age / 60000));
}

// Trängseln som ska visas: blir 'unknown' när senaste rapporten är äldre än en timme
export function currentBusyness(place: BusynessFields, now = Date.now()): Busyness {
	return minutesSinceUpdate(place, now) === null ? 'unknown' : place.current_busyness;
}

// T.ex. "Just now", "1 min ago", "20 mins ago" eller "Unknown"
export function formatLastUpdated(place: BusynessFields, now = Date.now()): string {
	const minutes = minutesSinceUpdate(place, now);
	if (minutes === null) return 'Unknown';
	if (minutes === 0) return 'Just now';
	return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
}
