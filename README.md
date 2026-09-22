# Study Spot Finder

En app för att hitta studieplatser. Byggd med Expo och React Native.

## Kom igång

1. Installera **Node 20 eller senare** från [nodejs.org](https://nodejs.org).
2. Installera **Expo Go** på din iPhone från App Store.
3. Kör i projektmappen:

```bash
npm install
npx expo start
```

4. "Servern" ska dyka upp i appen, klickar man på den startar appen och man ser live-uppdateringar samtidigt som man kodar. Ibland måste man logga in på sitt expo konto i vs.


## Så fungerar navigeringen typ

Här är bra docs:
https://docs.expo.dev/router/basics/core-concepts/

Vi använder **Expo Router**, som är filbaserad routing. Varje fil i `src/app` blir en skärm, och mappstrukturen bestämmer adressen: `list/index.tsx` blir `/list`.

```
src/app/
  _layout.tsx          Yttersta lagret. Håller ihop tabbarna och platssidan.
  (tabs)/
    _layout.tsx        Tab-baren, använder iOS egna tabbar.
    index.tsx          Kartan. Ingen header, fyller hela skärmen.
    list/
      _layout.tsx      Egen stack, så listan kan pusha nya sidor.
      index.tsx        Listan med platser.
      [id].tsx         Detaljsida som pushas när man klickar på en plats.
  place/
    [id].tsx           Samma detaljer, men som dragbar panel från kartan.
```

Två regler att känna till:

- Parenteser, som i `(tabs)`, betyder att mappen inte syns i adressen.
- Hakparenteser, som i `[id].tsx`, betyder dynamisk adress. `/list/3` ger `id = "3"`.

Listan och kartan öppnar en plats på olika sätt, med flit:

- **Från listan** pushas en vanlig sida med tillbaka-knapp, och tab-baren är kvar.
- **Från kartan** öppnas en panel som går att dra upp och ner, med kartan kvar bakom.

Båda visar samma komponent, `src/components/PlaceDetails.tsx`, så innehållet finns bara på ett ställe.

## Styling

`src/theme.ts` innehåller `spacing`, `radius`, `type` och `colors`. Använd dem istället för att skriva siffror och hexkoder direkt i komponenterna, så går utseendet att ändra på ett ställe.

Bra att veta: skärmar med stor titel i headern måste ha en `FlatList` eller `ScrollView` överst med `contentInsetAdjustmentBehavior="automatic"`. Annars hamnar innehållet bakom headern och går inte att klicka på.


## Läs mer

- [Expo Router](https://docs.expo.dev/router/introduction/) – filbaserad routing
- [Native Tabs](https://docs.expo.dev/router/advanced/native-tabs/) – tab-baren vi använder
- [Modaler](https://docs.expo.dev/router/advanced/modals/) - typ "pop-ups", den dragbara pop-up platsinfo-sidan i kartvyn.
