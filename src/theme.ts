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
  background: '#EEF3E8',
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
  borderColor: '#b8cb9e87',
  // Starkare varianter för små prickar på kartan, där pastellfärgerna ovan blir för bleka
  busynessDotLow: '#6FA04A',
  busynessDotMedium: '#E0A040',
  busynessDotHigh: '#C74068',
  buttonBackground: '#fff',
  greenButtonBackground: '#B8CB9E',
  // Mörkare salviagrön för primärknappar och ikoner, samt färgen på profilens omslag
  primary: '#76885F',
  logout: '#C74068',
  coverBackground: '#CBD8BC',
  cardBackground: '#fff',
  imageBackground: 'lightgray',
  overlay: 'rgba(0, 0, 0, 0.25)',
  // Ljus ton på glaset så att mörk text syns mot kartan, utan det gråa i "regular"-glaset.
  // Samma färg som background (#EEF3E8) med 70 % täckning.
  glassTint: 'rgba(238, 243, 232, 0.7)',
  //För knapptryck med TouchableOpacityHighlight
  buttonpress: '#EEF3E8'
};

export const icons = {
	size: 24
}
