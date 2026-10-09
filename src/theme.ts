export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius  = { sm: 8, md: 12, lg: 20, pill: 999 };
export const type = {
  title:   { fontSize: 22, fontWeight: '600' },
  heading: { fontSize: 17, fontWeight: '600' },
  body:    { fontSize: 15 },
  caption: { fontSize: 13 },
  tag: { fontSize: 12, fontWeight: '700' },
  amenityLabel: { fontSize: 10, fontWeight: '600' },
  buttonText : { fontSize: 15, fontWeight: '600' },
} as const;

// Exempel på hur man definierar färger som kan användas. Skriv användningsområdet istället för "red" direkt i koden, så blir det lättare att byta färgtema senare.
export const colors = {
  text: '#2F2319',
  lightText: '#fff',
  textMuted: '#827B75',
  background: '#EDEDE9',
  border: '#e5e7eb',
  tint: '#2563eb',
  icon: '#2F2319',
  lightIcon: '#fff',
  favorite: '#C74068',
  amenityCircle: '#B8CB9E',
  busynessLow: '#E3EAD8',
  busynessMedium: '#EDDAC2',
  busynessHigh: '#E8CDD5',
  busynessUnknown: '#D9D9D9',
  // Starkare varianter för små prickar på kartan, där pastellfärgerna ovan blir för bleka
  busynessDotLow: '#6FA04A',
  busynessDotMedium: '#E0A040',
  busynessDotHigh: '#C74068',
  buttonBackground: '#fff',
  greenButtonBackground: '#B8CB9E',
  cardBackground: '#fff',
  
};

export const icons = {
	size: 24
}
