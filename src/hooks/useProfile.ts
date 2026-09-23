import { mockProfile } from '../data/mockProfile';
import { Profile } from '../types/profile';

export const useProfile = (): Profile => {
  return mockProfile;
};

export function changeProfilePicture(newUrl: string): void {
  mockProfile.profilePictureUrl = newUrl;
}