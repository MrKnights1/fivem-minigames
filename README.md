# FiveM Minigames

A collection of hacking minigames for FiveM, playable standalone in the browser.

**[Play Now](https://mrknights1.github.io/fivem-minigames/)**

## Games

| Game | Description |
|------|-------------|
| **Data Miner** | Minesweeper-style grid — reveal safe tiles, flag hazards |
| **Grid Memory** | Simon Says — memorize and repeat a flashing sequence |
| **Letter Sequence** | Press the displayed letters (QWER ASDF) in order before time runs out |
| **Pair Matching** | Classic card matching — find all pairs within the time limit |
| **TypeRacer** | Type the shown words correctly before each one expires |
| **Word Memory** | Words appear one at a time — remember which ones you've already seen |
| **Thermite** | Match the pattern before it disappears |
| **Hacking Device** | Find the target codes in a shuffling grid — WASD to move, Enter to select |
| **Untangle** | Drag the dots until no lines cross, before time runs out |
| **Hopscotch** | The Casino generators hack (a.k.a. USB) — jump by the numbers to the goal, then finish from memory |

## Running Locally

Serve the project root with any static file server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

## Running Tests

Playwright tests check that every game fits the screen at phone, landscape, tablet and desktop
sizes, and that desktop layouts keep their original sizes. They start their own static server
(`python3 -m http.server`), so Python 3 is required.

```bash
npm install
npx playwright install chromium
npm test
```

Tests live in `tests/`. Each viewport is a Playwright project in `playwright.config.js`; run one with
`npx playwright test --project=phone`.

## FiveM Integration

Each game communicates via NUI messages (`fetchNUI`, `onNUIMessage`). In debug mode (outside FiveM), mock responses are used so the games are fully playable standalone.

### NUI Messages

- `nuiLoaded` — sent when the game UI is ready, returns theme and text configuration
- `start` — triggers game start with configurable parameters (timeout, difficulty)
- `gameFinished` — sent when the game ends with `{ result: true/false }`

## Project Structure

```
index.html                    # Main menu
games/
  shared/
    howler.js                 # Audio library (Howler.js v2.2.4)
    nui-utils.js              # NUI communication utilities
    settings.js               # Per-game option persistence (localStorage)
    wordPool.js               # Shared word list
    nui-responsive.css        # Small-screen layout for the NUI games
    standalone-responsive.css # Compact header for the standalone games
  data_miner_game/
  grid_memory_game/
  letter_sequence_game/
  pair_matching_game/
  typeracer_game/
  word_memory_game/
  thermite_game/
  hacking_device_game/
  untangle_game/
  hopscotch_game/
```

The NUI games (`data_miner`, `grid_memory`, `letter_sequence`, `pair_matching`, `typeracer`,
`word_memory`) contain:
- `index.html` — game page
- `src/game.js` — game logic
- `sounds/` — audio files
- `assets/` — compiled CSS styles

The standalone games (`thermite`, `hacking_device`, `untangle`, `hopscotch`) contain:
- `index.html` — game page
- `minigame.js` — game logic
- `minigame.css` — styles

Every game persists its options via `initSettings(name, selectors)` from `games/shared/settings.js`.
