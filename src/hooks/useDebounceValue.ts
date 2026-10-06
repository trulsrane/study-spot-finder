import { useEffect, useState } from 'react';

// Hook som returnerar ett debounced värde. Användbart för att t.ex. vänta med att göra en sökning tills användaren slutat skriva.
export function useDebounceValue<T>(value: T, delay = 300){
	const [debouncedValue, setDebouncedValue] = useState(value);
	useEffect(() => {
		const t = setTimeout(() => setDebouncedValue(value), delay);
		return () => clearTimeout(t);
	}, [value, delay]);
	return debouncedValue;
} 
