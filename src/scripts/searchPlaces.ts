import Fuse from "fuse.js";
import {Place} from "@/src/types/db";

export function createPlaceSearcher(places: Place[]){
	return new Fuse(places, {
		keys: ['name','address'],
		threshold: 0.3,
		ignoreLocation: true,
		minMatchCharLength: 2,
	});
}

export function searchPlaces(fuse: Fuse<Place>, query: string, limit = 8): Place[] {
	if (query.trim().length < 2) return [];
	return fuse.search(query, { limit }).map((r) => r.item);
}