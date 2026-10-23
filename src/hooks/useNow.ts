import { useEffect, useState } from 'react';

// Nuvarande tid som uppdateras med jämna mellanrum, så att t.ex. "20 mins ago" räknar upp av sig själv
export function useNow(intervalMs = 60 * 1000) {
	const [now, setNow] = useState(Date.now());

	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), intervalMs);
		return () => clearInterval(timer);
	}, [intervalMs]);

	return now;
}
