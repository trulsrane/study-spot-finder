import { Review } from '@/src/types/review';

export const mockReviews: Review[] = [
	{
		id: 1,
		placeId: 'mit-tradgarden',
		username: 'Morgan Lundgren',
		rating: {noise: 4.5, crowdness: 4.0, coffee: 5.0},
		comment: 'Bekväma stolar!',
		date: '12-09-2026'
	},
	{
		id: 2,
		placeId: 'mit-tradgarden',
		username: 'Karolina Utsi',
		rating: {noise: 4.5, crowdness: 4.0, coffee: 5.0},
		comment: 'Jag älskar trädgården i MIT!! Så mysig miljö <3 Blir lätt trångt men inga problem att hitta platser innan kl 9. Rekommenderar starkt. Finns nära tillgång till mikros och eluttag, samt caféet Mitum.',
		date: '12-09-2026'
	},
	{
		id: 3,
		placeId: 'mit-tradgarden',
		username: 'Josefine Lundin',
		rating: {noise: 4.5, crowdness: 4.0, coffee: 5.0},
		comment: 'Lite sisådär plats. Blir lätt kvavt och instängt. Men fin plats och sköna stolar!',
		date: '12-09-2026'
	},
		{
		id: 4,
		placeId: 'mit-tradgarden',
		username: 'Truls Rane',
		rating: {noise: 4.5, crowdness: 4.0, coffee: 5.0},
		comment: 'Superduper bra plats! En av mina favoriter :)',
		date: '12-09-2026'
	}
]