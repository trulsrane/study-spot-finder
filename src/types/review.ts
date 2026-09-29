// Finns inte i databasen än
export type reviewRatings = {
	noise: number;
	crowdness: number;
	coffee: number;
}
export type Review = {
	id: number;
	placeId: string;
	username: string; // Heter user_id i databasen (FK för att koppla reviewn med en användare)
	rating: reviewRatings;
	comment: string;
	date: string; // Heter created_at i databasen
}