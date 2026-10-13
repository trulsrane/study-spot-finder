// Byggnaderna på campus, hämtade från MazeMap. Används för att samla platserna per hus på kartan
// och för att översätta mellan våningsnamn ("2") och MazeMaps våningsnummer (zLevel).

import { MAZEMAP_CAMPUS_ID } from '@/src/constants';

export type BuildingFloor = {
  z: number; // MazeMaps våningsnummer
  name: string; // Det som står i våningsväljaren, t.ex. "2" eller "E"
};

export type Building = {
  id: string;
  name: string;
  center: { latitude: number; longitude: number };
  rings: [number, number][][]; // Byggnadens kontur som [lng, lat]-par
  floors: BuildingFloor[]; // Sorterade nerifrån och upp
};

type ApiPolygon = { type: 'Polygon'; coordinates: [number, number][][] } | null;

type ApiBuilding = {
  id: number;
  name: string;
  fullOutline: ApiPolygon;
  simpleGeom: ApiPolygon;
  floors: { z: number; name: string }[];
};

// Tyngdpunkten för konturen, så att bubblan hamnar mitt på huset
function ringCentroid(ring: [number, number][]) {
  let area = 0;
  let x = 0;
  let y = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x0, y0] = ring[j];
    const [x1, y1] = ring[i];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    x += (x0 + x1) * cross;
    y += (y0 + y1) * cross;
  }
  if (area === 0) return { latitude: ring[0][1], longitude: ring[0][0] };
  return { latitude: y / (3 * area), longitude: x / (3 * area) };
}

// Punkt-i-polygon (jämn/udda-regeln), så att innergårdar inte räknas som en del av huset
function isInside(rings: [number, number][][], latitude: number, longitude: number) {
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > latitude !== yj > latitude && longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
  }
  return inside;
}

// Tyngdpunkten hamnar utanför L- och U-formade hus. Då väljs den punkt på huset som ligger närmast den,
// så att bubblan alltid hamnar på själva huset.
function pointOnBuilding(rings: [number, number][][]) {
  const center = ringCentroid(rings[0]);
  if (isInside(rings, center.latitude, center.longitude)) return center;

  const lngs = rings[0].map((p) => p[0]);
  const lats = rings[0].map((p) => p[1]);
  const [minLng, maxLng, minLat, maxLat] = [Math.min(...lngs), Math.max(...lngs), Math.min(...lats), Math.max(...lats)];
  const steps = 30;
  let best = center;
  let bestDistance = Infinity;
  for (let i = 1; i < steps; i++) {
    for (let j = 1; j < steps; j++) {
      const longitude = minLng + ((maxLng - minLng) * i) / steps;
      const latitude = minLat + ((maxLat - minLat) * j) / steps;
      if (!isInside(rings, latitude, longitude)) continue;
      const distance = (longitude - center.longitude) ** 2 + (latitude - center.latitude) ** 2;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = { latitude, longitude };
      }
    }
  }
  return best;
}

function toBuilding(api: ApiBuilding): Building | null {
  const polygon = api.fullOutline ?? api.simpleGeom;
  if (!polygon || polygon.type !== 'Polygon' || polygon.coordinates.length === 0) return null;

  return {
    id: String(api.id),
    name: api.name,
    center: pointOnBuilding(polygon.coordinates),
    rings: polygon.coordinates,
    floors: api.floors
      .map((f) => ({ z: Math.round(f.z), name: f.name }))
      .sort((a, b) => a.z - b.z),
  };
}

// Hämtas bara en gång per app-start, byggnaderna ändras i princip aldrig
let cache: Promise<Building[]> | null = null;

export function fetchCampusBuildings(): Promise<Building[]> {
  if (!cache) {
    cache = fetch(`https://api.mazemap.com/api/buildings/?campusid=${MAZEMAP_CAMPUS_ID}&srid=4326`)
      .then((res) => {
        if (!res.ok) throw new Error(`MazeMap answered ${res.status}`);
        return res.json();
      })
      .then((data: { buildings: ApiBuilding[] }) =>
        data.buildings.map(toBuilding).filter((b): b is Building => b !== null)
      )
      .catch((error) => {
        cache = null; // Försök igen nästa gång, t.ex. när nätet är tillbaka
        throw error;
      });
  }
  return cache;
}

export function findBuilding(buildings: Building[], latitude: number, longitude: number) {
  return buildings.find((b) => isInside(b.rings, latitude, longitude)) ?? null;
}

// "Plan 2" / "2" -> MazeMaps zLevel för just det huset. null om våningen inte finns.
export function floorToZ(building: Building, floor: string | null) {
  if (!floor) return null;
  const clean = floor.trim().toLowerCase();
  const exact = building.floors.find((f) => f.name.toLowerCase() === clean);
  if (exact) return exact.z;
  // Tillåter "Plan 2", "våning 2" osv. genom att jämföra själva siffran
  const number = clean.match(/-?\d+/)?.[0];
  return building.floors.find((f) => f.name === number)?.z ?? null;
}

// Husets entréplan: MazeMaps standardvåning (zLevel 1), eller lägsta våningen om huset saknar den
export function defaultZ(building: Building) {
  return building.floors.some((f) => f.z === 1) ? 1 : (building.floors[0]?.z ?? 1);
}

export function zToFloorName(building: Building, z: number) {
  return building.floors.find((f) => f.z === z)?.name ?? null;
}
