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
  busyness: Busyness; // heter current_busyness i databasen
  busynessUpdatedAt?: string;   // ISO date — your "hur relevant är infon" HMW
  amenities: string[];          // 'outlets', 'wifi', 'quiet', 'group'
  imageUrl?: string;
  googlePlaceId?: string;         // Google Places ID, if applicable (finns inte i databasen)
  createdBy?: string; // user id of the creator
  createdAt: string; // ISO date
};