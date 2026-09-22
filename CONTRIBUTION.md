# Contributing

Riktlinjer för git. Följ om inget anna sägs, ändra om något behöver ändras.

## TL;DR

- `git pull` på main innan du börjar, `git push` innan du slutar
- En branch = en uppgift. Max två dagar.
- Aldrig push direkt till `main` — allt går via PR
- Merge in main i din branch innan du gör PR
- Säg till i chatten innan du installerar ett paket
- Efter pull: kör `npm install` om `package.json` ändrats
- Konflikt du inte förstår? `git merge --abort` och skriv i chatten

## Branches

Branch off `main` för varje del du jobbar på. "map" är för stort "render-pins-on-map" är bättre.

**Ingen branch får leva längre än två dagar** *(klaga om ni tycker detta är för hårt)* Om ni inte är färdig så merge det som fungerar ändå och flagga eventuella fel eller gör en nödlösning. På så sätt slipper vi för stora merge konflikter och alla håller sig någorlunda uppdaterade om hur appen ser ut.

Pusha eller force-pusha aldrig direkt till `main`.

### Att arbeta på en branch

Gör **alltid** detta inför varje session:
```
git checkout main   # byt till main
git pull            # hämta senaste versionen av main
```

Sen skapa eller hoppa in på din branch:
```
git checkout -b [branch-name]   # skapa och byt till den aktuella branchen
git checkout [branch-name]      # byt till befintlig branch
```

Om din branch inte är updaterad med main:
```
git checkout main   # byt till main om du misstänker att din main inte är uppdaterad heller
git pull            # hämta nya updateringar
git checkout [din-branch]   # tillbaka till din branch
git merge main      # hämta updateringarna på main till din branch
```

#### Att spara ditt arbete:

Gör detta ofta, inte bara vid slutet av sessionen. För att hålla koll på ändringar och enkelt roll-backa:
```
git status      # För att se vad du ändrat om du är osäker
git add .       # stage alla ändringar för commit
git commit -m "meddelande"
git push        # skicka till GitHub
```

Första gången man pushar en ny branch till GitHub så kommer man få felmeddelande. Så första gången behöver man skriva:
```
git push --set-upstream origin [din-branch]
```

Efter det så fungerar `git push` som vanligt. 

## Merging

Keni nämnde "merge review". Det är basically att all merge måste accepteras av minst en annan person på GitHub innan den faktiskt går igenom. Har aldrig gjort det förut men kanske värt å testa? det kallas för att `main` är "protected".

Så vid merge:

Dubbelkolla din kod, starta "pull-request", merge, delete branch.

Att dubbelkolla innan merge och innan man accepterar en merge:

- Går den att köra?
- Använder du `theme/` istället för hårdkodade värden?
- Duplicerar du något som redan finns?

**Merge med main efter varje lång session**, gäller alla.

### Merge din branch med main

Se till att din branch är up to date med `main`, se till att den är körbar. Sen på din branch:
```
npx tsc --noEmit    # Kontrollerar typfel, inte livsviktigt, alltid bra.

git status          # för att kontrollera att dina ändringar är pushade till git

# Om inte:

git add .           # stage alla ändringar för commit
git commit -m "meddelande"
git push            # skicka till GitHub
```

Nu kommer skillnaden med "vanlig" merge. Eftersom att jag nu bestämt att vi kör "protected main" så sker merge till main på GitHub:

- Gå till repot på GitHub
- Klicka *Compare & pull request*, skriv en kort kommentar
- Skriv i chatten och be om review
- Någon accepterar
- Klicka *Merge pull request*
- Sen *Delete branch*

Sen tillbak till din terminal:
```
git checkout main               # byt branch till main
git pull                        # Updatera din lokala main med den nya
git branch -d [din-branch]      # Tar bort din lokala branch
```
Färdigt!

### Vid konflikter

Merge konflikter händer sällan när du gör en PR (pull request) på github. Det händer om någon updaterat `main` medans du arbetar och din lokala main blir utdaterad. Detta löser du genom att alltid se till att din lokala `main` och branch är uppdaterad innan du startar en PR.

Om du mot förmodan får en konflikt under en PR så är det enklast att fixa lokalt, så gå tillbaka till din terminal utan att avbryta din PR och gör följande *(Samma procedur gäller när du får konfliker vid merge för att uppdatera din lokala branch):
```
git checkout main
git pull
git checkout [din-branch]
git merge main
```
Då får du upp filerna med konflikter lokalt. Du kan köra `git status` för att se vilka filer som har konflikter igen.

Öppna de filer med konflikter, det borde se ut typ såhhär:
```
<<<<<<< HEAD
your version
=======
the version from main
>>>>>>> main
```
Det kommer troligtvis finnas snabbknappar som säger typ "Accept Current Change", "Accept Incoming Change" etc. Du kan testa använda dom men är du osäker så är det inte svårare än att du manuellt raderar det du vill ta bort och har kvar det du vill ha kvar. Du kan ta bort konflikt-markörerna själv.

När du har löst alla konflikter kör:
```
npx tsc --noEmit    # Kollar typfel

# kör appen, se till att allt fungerar

git add .
git commit -m "merge main"
git push
```
Om något går fel eller du inte vet hur du löser en konflikt kan du alltid dra dig ur å återgå till läget innan konflikten:
```
git merge --abort
```
Det är aldrig fel, skriv i chatten så löser vi det nästa session.

Efter detta ska det vara löst. Vid PR, gå tillbaka till GitHub, uppdatera sidan, så borde din PR uppdatera sig själv och visa inga konflikter. Be någon om review, klicka `merge pull request`, `confirm merge`, `delete branch` - färdigt! *(Å ta bort din lokala branch osv. som jag gick igenom tidigare)*

## Gemensamma sessions

Alla pushar och hämtar senaste main om man inte redan gjort det. Har man merge konflikter som man inte kan lösa så löser man det direkt. Sen kör vi appen på någon mobil, om något kraschar så försöker vi lösa det direkt innan vi börjar arbeta med annat.

## Filer vi undviker att ändra när vi sitter själva

Dessa kan skapa merge konflikter som är jobbiga att lösa så vi försöker ändra dessa när vi sitter tillsammans:

- `types/place.ts` eller andra datatyper, om du inte är 100 att du är själv om att använda den datatypen just nu.
- `theme.ts`
- `app/_layout.tsx`, `app/(tabs)/_layout.tsx`
- `package.json`, `package-lock.json` - **Denna är viktig** se nedan.

Undantag får såklart göras men kan vara bra å dubbelkolla så man inte förstör för någon annan.

### Konflikter i package.json och package-lock.json

Anledningen varför denna är viktig är för att när du installerar ett nytt paket så kan package-lock.json få flera hundra nya rader. Om fler personer lägger till paket samtidigt innan man `merge` med `main` så blir det garanterat konflikter. Man löser det enklast genom att skriva till alla andra innan man lägger till ett paket. Lägger till paketet committa paketet för sig, pusha din branch och gör en snabb PR direkt, så kan resten hämta det. Sen hämtar alla hem ändringen med `git pull`. Det uppdaterar `package.json` och `package-lock.json`. Kör sedan `npm install`, det läser lockfilen och installerar paketet.

Blir det trots allt konflikter i `package.json` och `package-lock.json` så löser man det enklast genom att acceptera den nya `package-lock.json` och manuellt fixa `package.json` så att dina paket finns med för att sen generera `package-lock.json` på nytt:
```
# ── Konflikt i package-lock.json ─────────────────────────────
# Lockfilen är maskingenererad och 15 000 rader lång.
# Den löser man aldrig för hand — den genereras om.

# 1. Öppna package.json och lös konflikten manuellt.
#    Behåll BÅDA paketen — ditt och det från main.

# 2. Kasta din trasiga lockfil och ta main's rena version.
#    OBS: detta byter INTE branch — du står kvar på din egen.
#    Det hämtar bara EN fil från main till din arbetskopia.
#    "--" talar om för git att det som följer är en filväg, inte en branch.
git checkout main -- package-lock.json

# 3. Nu matchar inte filerna: package.json har ditt nya paket,
#    lockfilen har det inte. npm install läser package.json
#    och skriver om lockfilen så att den stämmer igen.
npm install

# 4. Kontrollera att appen startar innan du committar.
npx expo start

# 5. Committa båda filerna tillsammans.
git add package.json package-lock.json
git commit
git push
```

## Definition of done

Utöver dom mer specifika så är en uppgift färdig när den är `merge` med `main` och fungerar på allas telefoner, inte bara din.