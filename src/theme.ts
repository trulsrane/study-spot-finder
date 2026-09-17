export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius  = { sm: 8, md: 12, lg: 20, pill: 999 };
export const type = {
  title:   { fontSize: 22, fontWeight: '600' },
  heading: { fontSize: 17, fontWeight: '600' },
  body:    { fontSize: 15 },
  caption: { fontSize: 13 },
} as const;

// Exempel på hur man definierar färger som kan användas. Skriv användningsområdet istället för "red" direkt i koden, så blir det lättare att byta färgtema senare.
export const colors = {
  text: '#111827',
  textMuted: '#6b7280',
  background: 'white',
  border: '#e5e7eb',
  tint: '#2563eb',
};
