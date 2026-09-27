export type reviewRatings = {
	noise: number;
	crowdness: number;
	coffee: number;
}
export type Review = {
	id: number;
	placeId: string;
	username: string;
	rating: reviewRatings;
	comment: string;
	date: string;
}