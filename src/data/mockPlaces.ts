import { Place } from '@/src/types/place';

export const mockPlaces: Place[] = [
  {
    id: 'kulturbageriet',
    name: 'Kulturbageriet',
    latitude: 63.8258,   // TODO: replace with real coordinates
    longitude: 20.2630,
    address: 'Umeå centrum',
    openingHours: 'Mon–Fri 08–18',
    busyness: 'medium',
    busynessUpdatedAt: '2026-09-22T09:30:00Z',
    amenities: ['wifi', 'coffee'],
  },
  {
    id: 'mit-tradgarden',
    name: 'Trädgården i MIT',
    latitude: 63.8196,   // TODO: verify
    longitude: 20.3073,
    building: 'MIT-huset',
    floor: '1',
    openingHours: 'Mon–Fri 07–21',
    busyness: 'high',
    busynessUpdatedAt: '2026-09-22T10:15:00Z',
    amenities: ['outlets', 'wifi', 'group'],
  },
  {
    id: 'naturhuset',
    name: 'Naturhuset',
    latitude: 63.8210,   // TODO: verify
    longitude: 20.3035,
    busyness: 'unknown',
    amenities: ['quiet'],
  },
];