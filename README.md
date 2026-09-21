# Life Tracker

Persönlicher Allrounder-Tracker für Fitness, Ernährung und Studium – als
installierbare Web-App (PWA), läuft am Handy und am Rechner im Browser.

## Bereiche

- **Übersicht** – Dashboard mit den wichtigsten Zahlen und nächsten Terminen
- **Fitness** – Workouts eintragen (Übung, Sätze, Wiederholungen, Gewicht)
- **Ernährung** – Mahlzeiten mit Kalorien/Protein tracken
- **Studium** – Erinnerungen für Prüfungen, Abgaben und Lernsessions

## Lokal starten

```bash
npm install
npm run dev
```

Öffnet einen lokalen Server (Link erscheint im Terminal). Änderungen im Code
werden sofort im Browser sichtbar (Hot Reload).

## Build

```bash
npm run build
```

Erzeugt den fertigen, optimierten Build im Ordner `dist/`.

## Deployment

Ein Push auf den Hauptbranch löst automatisch ein Deployment auf
**GitHub Pages** aus (`.github/workflows/deploy.yml`). Damit das beim ersten
Mal funktioniert, einmalig in den Repo-Einstellungen unter **Settings → Pages**
als Quelle **"GitHub Actions"** auswählen. Danach ist die App unter der dort
angezeigten URL erreichbar – die kannst du dir am Handy als Icon auf den
Homescreen legen ("Zum Home-Bildschirm hinzufügen" im Browser-Menü).

## Wie die Daten gespeichert werden

Aktuell speichert die App alles direkt im Browser (`localStorage`), über eine
kleine Datenschicht in `src/lib/storage.js`. Das heißt:

- Kein Server nötig, funktioniert sofort
- Daten bleiben auf dem Gerät/Browser, auf dem du sie eingegeben hast
- Wird später ein Backend gebraucht (z.B. für Sync zwischen mehreren Geräten),
  muss nur `src/lib/storage.js` ausgetauscht werden – die Views
  (`FitnessView`, `NutritionView`, `StudyView`, ...) bleiben unverändert,
  da sie nur über den `useCollection`-Hook (`src/lib/useCollection.js`) auf
  die Daten zugreifen.

## Projektstruktur

```
src/
  App.jsx                 Navigation zwischen den Bereichen
  components/TabBar.jsx   Tab-Leiste unten
  lib/storage.js          Datenschicht (aktuell localStorage)
  lib/useCollection.js    React-Hook für Lesen/Schreiben einer Collection
  features/
    dashboard/            Übersicht
    fitness/               Workouts
    nutrition/             Ernährung
    study/                 Studium-Erinnerungen
```

## Neuen Bereich hinzufügen

1. Neuen Ordner unter `src/features/<name>/` anlegen
2. Eine `<Name>View.jsx` bauen (siehe `FitnessView.jsx` als Vorlage) und
   `useCollection('<collection-name>')` für die Daten verwenden
3. View in `src/App.jsx` in `VIEWS` eintragen
4. Tab in `src/components/TabBar.jsx` ergänzen
