import { Database } from './database.types';

type Tables = Database['public']['Tables'];

export type Place = Omit<Tables['places']['Row'], 'geom'>;
export type PlaceInsert = Tables['places']['Insert'];
export type Profile = Tables['profiles']['Row'];
export type ProfileUpdate = Tables['profiles']['Update'];
export type Review = Tables['reviews']['Row'];
export type ReviewInsert = Tables['reviews']['Insert'];
export type Friendship = Tables['friendships']['Row'];
export type SavedPlace = Tables['saved_places']['Row'];
export type Busyness = Database['public']['Enums']['busyness_level'];
export type BusynessReport = Tables['busyness_reports']['Row'];
export type BusynessReportInsert = Tables['busyness_reports']['Insert'];
export type CheckIn = Tables['check_ins']['Row'];
export type CheckInInsert = Tables['check_ins']['Insert'];
export type CheckOut = Tables['check_ins']['Row'];