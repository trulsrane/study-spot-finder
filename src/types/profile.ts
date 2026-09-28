export type Profile = {
  id: number;
  name: string; // Heter username i databasen
  displayName?: string;
  profilePictureUrl?: string; // heter avatar_url i databasen
  shareLocation: boolean;
  createdAt: string; // ISO date
  bio?: string; // heter description i databasen
}