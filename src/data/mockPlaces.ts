import { Place } from '@/src/types/place';

export const mockPlaces: Place[] = [
  {
    id: 'kulturbageriet',
    name: 'Kulturbageriet',
    latitude: 63.8249,   // TODO: replace with real coordinates
    longitude: 20.2608,
    address: 'Umeå centrum',
    openingHours: 'Mon–Fri 08–18',
    busyness: 'medium',
    busynessUpdatedAt: '2026-09-22T09:30:00Z',
    amenities: ['wifi', 'coffee'],
    createdAt: '2026-09-22T08:00:00Z',
  },
  {
    id: 'mit-tradgarden',
    name: 'Trädgården i MIT',
    latitude: 63.8205,   // TODO: verify
    longitude: 20.3082,
    building: 'MIT-huset',
    floor: '1',
    openingHours: 'Mon–Fri 07–21',
    busyness: 'high',
    busynessUpdatedAt: '2026-09-22T10:15:00Z',
    amenities: ['outlets', 'wifi', 'group'],
    createdAt: '2026-09-22T08:30:00Z',
  },
  {
    id: 'naturhuset',
    name: 'Naturhuset',
    latitude: 63.8196,   // TODO: verify
    longitude: 20.3073,
    busyness: 'unknown',
    amenities: ['quiet'],
    createdAt: '2026-09-22T09:00:00Z',
  },
];