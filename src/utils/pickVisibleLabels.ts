import { Point } from 'react-native-maps';

import { Place } from '@/src/types/db';
import {
  LABEL_MAX_WIDTH,
  LABEL_SPACE,
  MARKER_SIZE,
  SELECTED_MARKER_SIZE,
} from '@/src/components/PlaceMarker';

// Ungefärlig bredd på en bokstav i namnet (11px, halvfet). Texten mäts inte på riktigt.
const CHAR_WIDTH = 6.5;
// Lite luft mellan namnen så att de inte nuddar varandra
const PADDING = 4;

type Rect = { left: number; right: number; top: number; bottom: number };

const overlaps = (a: Rect, b: Rect) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const circleRect = (point: Point, size: number): Rect => ({
  left: point.x - size / 2,
  right: point.x + size / 2,
  top: point.y - size / 2,
  bottom: point.y + size / 2,
});

// Väljer vilka platser som får visa sitt namn, så att inga namn krockar med varandra eller
// täcker en annan markör. Den valda platsen får välja först, sedan går vi i listans ordning.
export function pickVisibleLabels(
  markers: { place: Place; point: Point }[],
  selectedId: string | null
): Set<string> {
  const sizeOf = (place: Place) => (place.id === selectedId ? SELECTED_MARKER_SIZE : MARKER_SIZE);
  const circles = markers.map(({ place, point }) => ({ id: place.id, rect: circleRect(point, sizeOf(place)) }));
  const sorted = [...markers].sort((a, b) => Number(b.place.id === selectedId) - Number(a.place.id === selectedId));

  const taken: Rect[] = [];
  const visible = new Set<string>();

  for (const { place, point } of sorted) {
    const width = Math.min(place.name.length * CHAR_WIDTH, LABEL_MAX_WIDTH) + PADDING;
    const circleTop = point.y - sizeOf(place) / 2;
    const label: Rect = {
      left: point.x - width / 2,
      right: point.x + width / 2,
      top: circleTop - LABEL_SPACE,
      bottom: circleTop,
    };

    const hitsLabel = taken.some((rect) => overlaps(label, rect));
    const hitsMarker = circles.some((c) => c.id !== place.id && overlaps(label, c.rect));
    if (hitsLabel || hitsMarker) continue;

    taken.push(label);
    visible.add(place.id);
  }

  return visible;
}
