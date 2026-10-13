// HTML-sidan som körs i WebView:n i planvyn för ett hus. Den laddar MazeMaps JS API och ritar ut studieplatserna.
// Ligger som en sträng i stället för en .html-fil så att den följer med appen utan extra Metro-inställningar.
// OBS: inga backticks eller ${ i JavaScript-koden nedan, de krockar med template-strängen.

import { colors } from '@/src/theme';
import { MazeMapConfig } from '@/src/types/mazemap';

// Senaste versionen finns på https://api.mazemap.com/js/
const MAZEMAP_VERSION = 'v2.2.6';

// Samma prickfärger som PlaceMarker på den vanliga kartan. Okänt visar ingen prick.
const DOT_COLORS = {
  low: colors.busynessDotLow,
  medium: colors.busynessDotMedium,
  high: colors.busynessDotHigh,
};

// Ljusare, mer neutrala färger så att MazeMap-kartan liknar den vanliga kartan i appen.
// [lager, egenskap, värde]. Lager som inte finns hoppas över.
const STYLE_OVERRIDES: [string, string, unknown][] = [
  ['land-custom', 'background-color', '#F3F1EC'],
  // Campus är märkt som "school" och blir beige, så bara parker och gräsplaner får färg
  ['landuse-custom', 'fill-color', ['match', ['get', 'class'], ['park', 'pitch'], '#D3E8C4', 'rgba(0, 0, 0, 0)']],
  ['land-grass-areas', 'fill-color', '#D3E8C4'],
  ['water', 'fill-color', '#AAD3F2'],
  ['waterway', 'line-color', '#AAD3F2'],
  ['building', 'fill-color', '#E6E3DE'],
  ['building', 'fill-outline-color', '#D6D2CB'],
  ['building-outline', 'line-color', '#D6D2CB'],
  ['land-parking-areas', 'fill-color', '#ECEBE8'],
  ['road-path-bg', 'line-color', '#E3E0DA'],
  ['mm-campus-area', 'fill-color', 'rgba(0, 0, 0, 0)'],
  ['mm-building-fill', 'fill-color', '#E4E1DB'],
  ['mm-building-label', 'text-color', colors.text],
  ['mm-poi-label', 'text-color', colors.textMuted],
];

// Bok-ikonen, motsvarar "book.fill" som PlaceMarker använder
const BOOK_SVG =
  '<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">' +
  `<path fill="${colors.text}" d="M11 6.3C9.4 5.1 7.2 4.5 4.6 4.5 3.7 4.5 3 5.2 3 6.1v10.8c0 .9.7 1.6 1.6 1.6 2.4 0 4.5.5 6.4 1.7z"/>` +
  `<path fill="${colors.text}" d="M13 6.3c1.6-1.2 3.8-1.8 6.4-1.8.9 0 1.6.7 1.6 1.6v10.8c0 .9-.7 1.6-1.6 1.6-2.4 0-4.5.5-6.4 1.7z"/>` +
  '</svg>';

// Grön nål för en plats som håller på att läggas till, som den gröna markören på vanliga kartan.
// Spetsen sitter 36 px ner i bilden (y 28.6 av 32 i viewBox, skalat till 40 px).
const DRAFT_PIN_SVG =
  '<svg viewBox="0 0 24 32" width="30" height="40" aria-hidden="true">' +
  `<path fill="${colors.busynessDotLow}" stroke="#fff" stroke-width="1.5" d="M12 1.5C6.2 1.5 1.5 6.1 1.5 11.9c0 7.4 8.8 15.4 9.8 16.3.4.4 1 .4 1.4 0 1-.9 9.8-8.9 9.8-16.3C22.5 6.1 17.8 1.5 12 1.5z"/>` +
  '<circle cx="12" cy="11.8" r="3.6" fill="#fff"/>' +
  '</svg>';

export function buildMazeMapHtml(config: MazeMapConfig) {
  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://api.mazemap.com/js/${MAZEMAP_VERSION}/mazemap.min.css" />
  <script src="https://api.mazemap.com/js/${MAZEMAP_VERSION}/mazemap.min.js"></script>
  <style>
    html, body, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #F3F1EC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      /* Annars öppnar ett långt tryck textmarkering/menyer i stället för att lägga till en plats */
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
    }

    /* Studieplats, samma utseende som PlaceMarker: rund glasknapp med bok och en prick för hur mycket folk det är */
    /* OBS: ingen position här. Mapbox placerar markören med position: absolute (.mapboxgl-marker),
       skrivs den över hamnar markörerna under varandra i stället för på sina koordinater. */
    .spot {
      width: 32px;
      height: 32px;
      cursor: pointer;
      transition: width 0.15s, height 0.15s;
    }
    .spot.selected {
      width: 42px;
      height: 42px;
      z-index: 1;
    }
    .spot-glass {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      padding: 27%;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.72);
      -webkit-backdrop-filter: blur(12px) saturate(180%);
      backdrop-filter: blur(12px) saturate(180%);
      border: 0.5px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18), 0 0 0 0.5px rgba(0, 0, 0, 0.06);
    }
    .spot-dot {
      position: absolute;
      top: 0;
      right: 0;
      width: 10px;
      height: 10px;
      box-sizing: border-box;
      border-radius: 50%;
      border: 1.5px solid #fff;
    }
    /* Nålen för en ny plats står still mitt på kartan, man flyttar och zoomar kartan under den.
       pointer-events: none så att man kan dra i kartan rakt genom nålen. */
    #draft-pin,
    #draft-dot {
      display: none;
      position: absolute;
      left: 50%;
      top: 50%;
      pointer-events: none;
      z-index: 5;
    }
    #draft-pin {
      width: 30px;
      height: 40px;
      /* Spetsen ska peka på kartans mittpunkt */
      margin: -36px 0 0 -15px;
      filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.25));
    }
    /* Liten prick som visar exakt var spetsen pekar */
    #draft-dot {
      width: 6px;
      height: 6px;
      margin: -3px 0 0 -3px;
      border-radius: 50%;
      background: ${colors.text};
      opacity: 0.5;
    }
    #draft-pin.visible,
    #draft-dot.visible {
      display: block;
    }

    /* Våningsväljaren i samma glasstil som knapparna på kartan */
    .app-floors.mapboxgl-ctrl-group {
      border-radius: 20px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.72);
      -webkit-backdrop-filter: blur(12px) saturate(180%);
      backdrop-filter: blur(12px) saturate(180%);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
    }
    .app-floors .btns-container > button {
      width: 40px;
      height: 40px;
      border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
      color: ${colors.text};
      font-size: 15px;
      font-weight: 600;
    }
    .app-floors .btns-container > button:first-child,
    .app-floors .btns-container > button:last-child {
      border-radius: 0;
    }
    .app-floors button.z-label.active {
      color: ${colors.text};
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="draft-pin">${DRAFT_PIN_SVG}</div>
  <div id="draft-dot"></div>
  <script>
    (function () {
      var CONFIG = ${JSON.stringify(config)};
      var DOT_COLORS = ${JSON.stringify(DOT_COLORS)};
      var STYLE_OVERRIDES = ${JSON.stringify(STYLE_OVERRIDES)};
      var BOOK_SVG = ${JSON.stringify(BOOK_SVG)};
      var ACTIVE_FLOOR_COLOR = ${JSON.stringify(colors.greenButtonBackground)};
      var LONG_PRESS_MS = 500;

      var map;
      var spots = {}; // id -> { marker, element }
      var selectedId = null;
      var drafting = false; // Om man håller på att lägga till en plats (nålen syns mitt på kartan)

      // ---------- WebView -> appen ----------
      function send(message) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        }
      }

      // JS-fel syns inte i Metro av sig själva, så de skickas till appen
      window.onerror = function (message) {
        send({ type: 'error', message: String(message) });
      };

      if (typeof Mazemap === 'undefined') {
        send({ type: 'error', message: 'Could not load MazeMap (no internet?)' });
        return;
      }

      // ---------- Studieplatser ----------
      function createSpot(spot) {
        var element = document.createElement('div');
        element.className = 'spot' + (spot.id === selectedId ? ' selected' : '');
        var dotColor = DOT_COLORS[spot.busyness];
        element.innerHTML =
          '<div class="spot-glass">' + BOOK_SVG + '</div>' +
          (dotColor ? '<div class="spot-dot" style="background:' + dotColor + '"></div>' : '');

        var indoor = spot.zLevel !== null;
        var marker = new Mazemap.ZLevelMarker(element, {
          zLevel: indoor ? spot.zLevel : 0,
          // Döljer markören helt (och gör den oklickbar) på andra våningar. Platser utan våning syns alltid.
          offZOpacity: indoor ? 0 : 1,
        })
          .setLngLat({ lng: spot.lng, lat: spot.lat })
          .addTo(map);

        marker.on('click', function () {
          send({ type: 'spotPressed', id: spot.id });
        });

        spots[spot.id] = { marker: marker, element: element };
      }

      function setSpots(list) {
        Object.keys(spots).forEach(function (id) {
          spots[id].marker.remove();
        });
        spots = {};
        list.forEach(createSpot);
      }

      // Vald plats visas större, som på den vanliga kartan
      function setSelected(id) {
        selectedId = id;
        Object.keys(spots).forEach(function (spotId) {
          spots[spotId].element.classList.toggle('selected', spotId === id);
        });
      }

      // ---------- Lägga till en plats ----------
      // Nålen står still mitt på kartan, så platsen är alltid kartans mittpunkt
      function reportDraft(lngLat) {
        var position = lngLat || map.getCenter();
        send({
          type: 'draftChanged',
          draft: { lat: position.lat, lng: position.lng, zLevel: map.getZLevel() },
        });
      }

      function setPinVisible(visible) {
        document.getElementById('draft-pin').classList.toggle('visible', visible);
        document.getElementById('draft-dot').classList.toggle('visible', visible);
      }

      // Utan lngLat (plus-knappen) hamnar nålen där kartan redan är. Med lngLat (långt tryck)
      // glider kartan så att punkten hamnar under nålen.
      function startDraft(lngLat) {
        drafting = true;
        setPinVisible(true);
        reportDraft(lngLat);
        if (lngLat) map.easeTo({ center: lngLat, duration: 300 });
      }

      function clearDraft() {
        drafting = false;
        setPinVisible(false);
      }

      function isOnMarker(target) {
        return !!(target && target.closest && target.closest('.spot, .mapboxgl-ctrl'));
      }

      // ---------- Appen -> WebView ----------
      // Anropas av appen via injectJavaScript
      window.receiveFromApp = function (message) {
        switch (message.type) {
          case 'setSpots':
            setSpots(message.spots);
            break;
          case 'setSelected':
            setSelected(message.id);
            break;
          case 'startDraftAtCenter':
            startDraft(null);
            break;
          case 'clearDraft':
            clearDraft();
            break;
        }
      };

      // ---------- Kartan ----------
      map = new Mazemap.Map({
        container: 'map',
        campuses: CONFIG.campusId,
        center: CONFIG.center,
        zoom: CONFIG.zoom,
        zLevel: CONFIG.zLevel,
        zLevelControl: false, // Vi lägger till en egen våningsväljare nedan, i appens stil
        attributionControl: false,
      });

      map.addControl(new Mazemap.mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

      // Planvyn ska inte vridas eller lutas, då behövs ingen kompass
      map.dragRotate.disable();
      map.touchZoomRotate.disableRotation();
      if (map.touchPitch) map.touchPitch.disable();

      map.on('load', function () {
        // MazeMaps våningsväljare, med appens gröna färg för vald våning. Läggs till först här,
        // eftersom den hämtar husens våningar från map.zLevelUpdater som MazeMap skapar vid 'load'.
        map.addControl(
          new Mazemap.ZLevelBarControl({
            className: 'app-floors',
            autoUpdate: true,
            maxHeight: 320,
            buttonHeight: 40,
            activeColor: ACTIVE_FLOOR_COLOR,
          }),
          'top-right'
        );

        STYLE_OVERRIDES.forEach(function (override) {
          if (!map.getLayer(override[0])) return;
          try {
            map.setPaintProperty(override[0], override[1], override[2]);
          } catch (error) {
            // Om MazeMap ändrar sin kartstil ska kartan fortfarande fungera, bara med originalfärger
          }
        });
        send({ type: 'ready' });
      });

      map.on('click', function () {
        send({ type: 'mapPressed' });
      });

      // När kartan stannat efter att man flyttat eller zoomat ligger platsen under nålen
      map.on('moveend', function () {
        if (drafting) reportDraft();
      });

      // Nålen följer med till den våning man byter till
      map.on('zlevel', function () {
        if (drafting) reportDraft();
      });

      // Långt tryck på kartan börjar lägga till en plats där, precis som på den vanliga kartan
      var press = null;
      function cancelPress() {
        if (press) clearTimeout(press.timer);
        press = null;
      }
      map.on('touchstart', function (event) {
        cancelPress();
        var touches = event.originalEvent.touches;
        if (!touches || touches.length !== 1 || isOnMarker(event.originalEvent.target)) return;
        var lngLat = event.lngLat;
        press = {
          point: event.point,
          timer: setTimeout(function () {
            press = null;
            startDraft(lngLat);
          }, LONG_PRESS_MS),
        };
      });
      map.on('touchmove', function (event) {
        if (press && event.point.dist(press.point) > 10) cancelPress();
      });
      map.on('touchend', cancelPress);
      map.on('touchcancel', cancelPress);
      // Högerklick i en webbläsare, och långt tryck på vissa Android-enheter
      map.on('contextmenu', function (event) {
        if (!isOnMarker(event.originalEvent.target)) startDraft(event.lngLat);
      });
    })();
  </script>
</body>
</html>`;
}
