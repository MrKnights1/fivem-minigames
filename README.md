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

## Running Locally

Serve the project root with any static file server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

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
  data_miner_game/
  grid_memory_game/
  letter_sequence_game/
  pair_matching_game/
  thermite_game/
  typeracer_game/
  word_memory_game/
```

Each game folder contains:
- `index.html` — game page with inline Tailwind CSS
- `src/game.js` — game logic
- `sounds/` — audio files
- `assets/` — compiled CSS styles
