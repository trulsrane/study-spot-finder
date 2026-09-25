import { mockProfile } from '../data/mockProfile';
import { Profile } from '../types/profile';

export const getProfile = (): Profile => {
  return mockProfile;
};

export function updateProfile(updates: Partial<Profile>): void {
  Object.assign(mockProfile, updates);
}