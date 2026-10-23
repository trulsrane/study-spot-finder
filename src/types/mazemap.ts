// Typerna för bryggan mellan appen och MazeMap-kartan i WebView:n (se utils/mazemapHtml.ts)

import { Busyness } from '@/src/types/db';

// En studieplats som den ritas på MazeMap-kartan
export type MapSpot = {
  id: string;
  lat: number;
  lng: number;
  zLevel: number | null; // MazeMaps våningsnummer, null = syns på alla våningar
  busyness: Busyness;
  // En vän som är incheckad på platsen. Bilden visas om den finns, annars första bokstaven.
  friend: { avatarUrl: string | null; initial: string } | null;
};

// Den gröna markören för en plats som håller på att läggas till
export type MapDraft = {
  lat: number;
  lng: number;
  zLevel: number; // Våningen som visades när markören sattes ut
};

// Startinställningar för kartan
export type MazeMapConfig = {
  campusId: number;
  center: { lat: number; lng: number };
  zoom: number;
  zLevel: number;
};

// Appen -> WebView (via injectJavaScript)
export type ToWebMessage =
  | { type: 'setSpots'; spots: MapSpot[] }
  | { type: 'setSelected'; id: string | null }
  | { type: 'startDraftAtCenter' }
  | { type: 'clearDraft' };

// WebView -> appen (via postMessage)
export type FromWebMessage =
  | { type: 'ready' }
  | { type: 'spotPressed'; id: string }
  | { type: 'mapPressed' }
  | { type: 'draftChanged'; draft: MapDraft }
  | { type: 'error'; message: string };
