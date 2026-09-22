export type Busyness = 'low' | 'medium' | 'high' | 'unknown';

export type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  building?: string;
  floor?: string;
  openingHours?: string;
  busyness: Busyness;
  busynessUpdatedAt?: string;   // ISO date — your "hur relevant är infon" HMW
  amenities: string[];          // 'outlets', 'wifi', 'quiet', 'group'
  imageUrl?: string;
};