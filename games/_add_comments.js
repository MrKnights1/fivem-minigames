const fs = require('fs');
const path = require('path');

const GAMES_DIR = '/root/projektid/hakid/games';

// Common utility function comments that apply to all games
// These utility functions appear at the top of every game with different variable names
function addUtilityComments(code) {
  // Add comment for isDebug/isNUI detection function
  code = code.replace(
    /^(\/\* Howler\.js import shim.*?\*\/\n.*?\n\n)/m,
    `$1/* ========================================================================
 * NUI Utility Functions
 * These helpers handle FiveM NUI (New User Interface) communication.
 * In debug mode (outside FiveM), they provide mock implementations.
 * ======================================================================== */\n\n`
  );

  // Comment the isDebug function patterns
  code = code.replace(
    /(const \w+ = \(\) => typeof window\.invokeNative > "u")/,
    '/* isDebug - returns true when running outside FiveM (no invokeNative available) */\n  $1'
  );
  code = code.replace(
    /(const \w+ = \(\) => !window\.invokeNative)/,
    '/* isDebug - returns true when running outside FiveM (no invokeNative available) */\n  $1'
  );

  // Comment the resource name
  code = code.replace(
    /(\w+ = \w+\(\) \? "[^"]*" : GetParentResourceName\(\))/,
    '/* resourceName - gets the FiveM resource name, falls back to debug name */\n  $1'
  );

  return code;
}

// Game-specific comments
const gameComments = {
  vise_data_miner_game: {
    description: `/**
 * VISE Data Miner Game - Minesweeper-style hacking minigame
 *
 * The player must reveal all safe tiles on a grid without clicking on hazards (mines).
 * Right-clicking flags a tile as a suspected hazard. The game is won when all
 * non-hazard tiles are revealed. Features include an optional timeout, flood-fill
 * for empty tiles, and adjacency number display.
 *
 * Config options (via NUI message):
 *   - gridWidth: number of columns (5-30, default 9)
 *   - gridHeight: number of rows (5-30, default 9)
 *   - hazardCount: number of mines (default 10)
 *   - gameTimeout: time limit in seconds (0 = no limit)
 */`,
    classComment: '/* DataMinerGame - Main game controller class (minesweeper logic) */',
    methodComments: {
      'updateStats()': '/* updateStats - Periodically updates the fake CPU usage display with random values */',
      'updateSignal()': '/* updateSignal - Periodically updates the fake signal strength indicator bars */',
      'cleanup()': '/* cleanup - Resets all game state, clears timers, and hides overlays */',
      'start(': '/* start - Initializes and starts a new game with the given configuration */',
      'generateGrid()': '/* generateGrid - Creates the grid DOM elements and initializes tile data */',
      'placeHazards()': '/* placeHazards - Randomly places hazard (mine) tiles on the grid */',
      'calculateAdjacency()': '/* calculateAdjacency - Calculates the number of adjacent hazards for each non-hazard tile */',
      'getNeighbors(': '/* getNeighbors - Returns array of valid neighbor indices for a given tile index */',
      'startGameTimer()': '/* startGameTimer - Starts the countdown timer and progress bar animation */',
      'stopGameTimer()': '/* stopGameTimer - Stops the countdown timer and saves elapsed time */',
      'updateGameProgressBar()': '/* updateGameProgressBar - Animation frame callback to smoothly update the timeout progress bar */',
      'handleTileClick(': '/* handleTileClick - Left-click handler: reveals tile or triggers game over if hazard */',
      'handleTileRightClick(': '/* handleTileRightClick - Right-click handler: toggles flag on a hidden tile */',
      'revealTile(': '/* revealTile - Reveals a single tile, showing its adjacency number or triggering flood fill */',
      'floodFill(': '/* floodFill - Recursively reveals neighboring tiles when an empty tile (0 adjacent hazards) is clicked */',
      'toggleFlag(': '/* toggleFlag - Toggles the flag state on a tile (marks/unmarks as suspected hazard) */',
      'updateHazardCounter()': '/* updateHazardCounter - Updates the remaining hazard count display (hazards - flags placed) */',
      'checkWinCondition()': '/* checkWinCondition - Checks if all non-hazard tiles have been revealed (win condition) */',
      'gameOver(': '/* gameOver - Handles end of game: reveals all hazards, plays sound, and calls finish */',
      'finish(': '/* finish - Shows win/loss overlay and sends result back to FiveM after a delay */',
    }
  },
  vise_grid_memory_game: {
    description: `/**
 * VISE Grid Memory Game - Simon-says style grid sequence memory game
 *
 * The game shows a sequence of highlighted tiles on a grid, then the player
 * must repeat the sequence by clicking tiles in the correct order. Each level
 * adds one more tile to the sequence. The game is won by completing all
 * target levels. Features a per-level timeout and score progress bar.
 *
 * Config options (via NUI message):
 *   - gridSize: grid dimensions N x N (2-5, default 3)
 *   - tileDisplayTime: how long each tile highlights in ms (default 500)
 *   - levelTimeout: time limit per level in ms (default 8000)
 *   - targetLevel: number of levels to complete to win (default 10)
 */`,
    classComment: '/* GridMemoryGame - Main game controller class (Simon-says sequence memory) */',
    methodComments: {
      'lockInput()': '/* lockInput - Disables tile clicking during sequence display */',
      'unlockInput()': '/* unlockInput - Re-enables tile clicking after sequence is shown */',
      'updateStats()': '/* updateStats - Periodically updates the fake CPU usage display */',
      'updateSignal()': '/* updateSignal - Periodically updates the fake signal strength bars */',
      'cleanup()': '/* cleanup - Resets all game state, clears timers, and hides overlays */',
      'start(': '/* start - Initializes and starts a new game with the given configuration */',
      'generateGrid()': '/* generateGrid - Creates the NxN grid of clickable tiles */',
      'nextLevel()': '/* nextLevel - Advances to the next level, generates a longer sequence */',
      'showSequence()': '/* showSequence - Highlights tiles one by one to show the player the sequence to memorize */',
      'startLevelTimer()': '/* startLevelTimer - Starts the per-level countdown timer */',
      'clearLevelTimer()': '/* clearLevelTimer - Stops and resets the level countdown timer */',
      'updateLevelProgressBar()': '/* updateLevelProgressBar - Animation frame callback for smooth level timeout progress bar */',
      'handleTileClick(': '/* handleTileClick - Click handler: checks if clicked tile matches the expected sequence tile */',
      'updateScoreProgressBar()': '/* updateScoreProgressBar - Updates the overall score/level progress bar */',
      'finish(': '/* finish - Shows win/loss overlay, plays sound, and sends result to FiveM */',
    }
  },
  vise_letter_sequence_game: {
    description: `/**
 * VISE Letter Sequence Game - Keyboard-based letter typing challenge
 *
 * The player must press a sequence of displayed letters (Q, W, E, R, A, S, D, F)
 * in the correct order before time runs out. Each correct keypress advances to
 * the next letter. A wrong key or timeout results in failure.
 *
 * Config options (via NUI message):
 *   - numberOfLetters: how many letters in the sequence (5-30, default 15)
 *   - timeout: time limit in seconds (3-60, default 10)
 */`,
    classComment: '/* LetterSequenceGame - Main game controller class (keyboard letter sequence) */',
    methodComments: {
      'getRandomLetter()': '/* getRandomLetter - Returns a random letter from the allowed set (QWER ASDF) */',
      'generateLetters(': '/* generateLetters - Creates the random letter sequence of the specified length */',
      'displayLetters()': '/* displayLetters - Renders the letter elements in the DOM container */',
      'updateLetterStates()': '/* updateLetterStates - Updates CSS classes to show active/done/fail states for each letter */',
      'startGameLoop()': '/* startGameLoop - Starts the countdown timer that updates the progress bar */',
      'stopGameLoop()': '/* stopGameLoop - Stops the countdown interval timer */',
      'handleKeyDown(': '/* handleKeyDown - Keyboard event handler: checks if pressed key matches the current expected letter */',
      'updateStats()': '/* updateStats - Periodically updates the fake CPU usage display */',
      'updateSignal()': '/* updateSignal - Periodically updates the fake signal strength bars */',
      'cleanupTimeouts()': '/* cleanupTimeouts - Clears the stats and signal update timers */',
      'handleSuccess(': '/* handleSuccess - Called when all letters are pressed correctly: shows win overlay */',
      'handleFailure(': '/* handleFailure - Called on wrong key or timeout: shows loss overlay */',
      'cleanupOverlays()': '/* cleanupOverlays - Hides the win/loss overlay elements */',
      'start(': '/* start - Initializes and starts a new game with letter count and time limit */',
    }
  },
  vise_pair_matching_game: {
    description: `/**
 * VISE Pair Matching Game - Memory card matching minigame
 *
 * The player must find all matching pairs of cards by flipping them two at a time.
 * Cards display SVG icons (security/hacking themed). If two flipped cards match,
 * they stay revealed. If not, they flip back. The game must be completed before
 * the timeout runs out.
 *
 * Config options (via NUI message):
 *   - numberOfPairs: number of card pairs (3-10, default 3)
 *   - timeout: time limit in seconds (3-1000, default 3)
 */`,
    classComment: '/* PairMatchingGame - Main game controller class (memory card matching) */',
    methodComments: {
      'updateProgressBar()': '/* updateProgressBar - Animation frame callback for the game timeout progress bar */',
      'createCard(': '/* createCard - Creates a single card DOM element with front (dot) and back (icon) faces */',
      'createCards(': '/* createCards - Generates all card elements and adds them to the grid container */',
      'resetTurn()': '/* resetTurn - Resets the current turn state (clears first/second card references) */',
      'onCardClick(': '/* onCardClick - Card click handler: flips card and checks for pair match */',
      'generateCardPairs(': '/* generateCardPairs - Shuffles icons and creates matched pairs array */',
      'initialize(': '/* initialize - Sets up the game board, timer, and creates card elements */',
      'updateStats()': '/* updateStats - Periodically updates the fake CPU usage display */',
      'updateSignal()': '/* updateSignal - Periodically updates the fake signal strength bars */',
      'cleanup()': '/* cleanup - Resets all game state, clears timers, and hides overlays */',
      'start(': '/* start - Initializes and starts a new game with pair count and timeout */',
      'finish(': '/* finish - Shows win/loss overlay and sends result to FiveM */',
    }
  },
  vise_typeracer_game: {
    description: `/**
 * VISE TypeRacer Game - Word typing speed challenge
 *
 * The player must type displayed hacking/cyber-themed words correctly before
 * each word's individual timer runs out. Words are shown one at a time and
 * the player types them in an input field and presses Enter. A wrong answer
 * or timeout ends the game.
 *
 * Config options (via NUI message):
 *   - targetScore/targetWordCount: number of words to type to win (default 15)
 *   - wordTimeout: time limit per word in seconds (default 8)
 */`,
    classComment: '/* TypeRacerGame - Main game controller class (word typing challenge) */',
    methodComments: {
      'updateStats()': '/* updateStats - Periodically updates the fake CPU usage display */',
      'updateSignal()': '/* updateSignal - Periodically updates the fake signal strength bars */',
      'cleanup()': '/* cleanup - Resets all game state, clears timers, and hides overlays */',
      'start(': '/* start - Initializes and starts a new game with word count and timeout settings */',
      'nextWord()': '/* nextWord - Picks a random word from the pool and displays it for the player to type */',
      'startWordTimer()': '/* startWordTimer - Starts the per-word countdown timer and progress bar */',
      'updateProgressBar()': '/* updateProgressBar - Animation frame callback for smooth word timeout progress bar */',
      'handleInput()': '/* handleInput - Input event handler: provides visual feedback if typed text matches so far */',
      'handleKeyDown(': '/* handleKeyDown - Keydown handler: submits answer when Enter is pressed */',
      'checkAnswer()': '/* checkAnswer - Validates the typed word against the current target word */',
      'flashInputState(': '/* flashInputState - Briefly flashes the input field green (correct) or red (incorrect) */',
      'updateScoreProgress()': '/* updateScoreProgress - Updates the overall word completion progress bar */',
      'finish(': '/* finish - Shows win/loss overlay, plays sound, and sends result to FiveM */',
    }
  },
  vise_word_memory_game: {
    description: `/**
 * VISE Word Memory Game - Word recall/recognition minigame
 *
 * Words from a hacking/cyber-themed pool are shown one at a time. The player
 * must decide if each word has been "SEEN" before or is "NEW" (first appearance).
 * Correct answers increment the score; a wrong answer or timeout ends the game.
 * The game tracks which words have been shown using a Set.
 *
 * Config options (via NUI message):
 *   - targetScore: number of correct answers needed to win (default 25)
 *   - wordTimeout: time limit per word in seconds (default 5)
 */`,
    classComment: '/* WordMemoryGame - Main game controller class (word recall/recognition) */',
    methodComments: {
      'updateStats()': '/* updateStats - Periodically updates the fake CPU usage display */',
      'updateSignal()': '/* updateSignal - Periodically updates the fake signal strength bars */',
      'cleanup()': '/* cleanup - Resets all game state, clears timers, and hides overlays */',
      'start(': '/* start - Initializes game: builds word pool subset, resets score, shows UI */',
      'nextWord()': '/* nextWord - Picks a random word from the game pool and displays it */',
      'startWordTimer()': '/* startWordTimer - Starts the per-word countdown timer and progress bar */',
      'updateProgressBar()': '/* updateProgressBar - Animation frame callback for smooth word timeout progress bar */',
      'handleSeenClick()': '/* handleSeenClick - "SEEN" button handler: player claims this word was shown before */',
      'handleNewClick()': '/* handleNewClick - "NEW" button handler: player claims this word is new */',
      'handleAnswer(': '/* handleAnswer - Evaluates the player answer: checks if word was actually seen before or is new */',
      'updateScoreProgress()': '/* updateScoreProgress - Updates the overall score progress bar */',
      'finish(': '/* finish - Shows win/loss overlay, plays sound, and sends result to FiveM */',
    }
  },
};

for (const [gameName, config] of Object.entries(gameComments)) {
  const filePath = path.join(GAMES_DIR, gameName, 'src', 'game.js');
  let code = fs.readFileSync(filePath, 'utf-8');

  // Add utility function comments
  code = addUtilityComments(code);

  // Add game description at the top (after the howler shim)
  code = code.replace(
    /^(\/\* Howler\.js import shim.*?\*\/\nvar \w+ = \{[^}]+\};\n\n)/m,
    `$1${config.description}\n\n`
  );

  // Add NUI fetch helper comment
  code = code.replace(
    /(\w+ = async \(\w+, \w+ = \{\}\) => \{[\s\S]*?\.json\(\)\);\s*\})/,
    `/* fetchNUI - Sends a POST request to the FiveM NUI callback handler */\n  $1`
  );

  // Add NUI message listener comment
  code = code.replace(
    /(\w+ = \(\w+, \w+\) => \{\s*const \w+ = \(\w+\) => \{[\s\S]*?removeEventListener\("message")/,
    `/* onNUIMessage - Registers a listener for NUI messages with a specific action name, returns unsubscribe function */\n  $1`
  );

  // Add showElement comment
  code = code.replace(
    /(\w+ = \(\w+\) => \{\s*const \w+ = document\.getElementById\(\w+\);\s*\w+ &&\s*\(\w+\.classList\.remove\("hidden"\))/,
    `/* showElement - Shows an element by removing hidden class and fading in with opacity transition */\n  $1`
  );

  // Add hideElement comment
  code = code.replace(
    /(\w+ = \(\w+, \w+\) => \{\s*const \w+ = document\.getElementById\(\w+\);\s*if \(!)/,
    `/* hideElement - Hides an element with opacity fade-out transition, then calls optional callback */\n  $1`
  );

  // Add class comment
  code = code.replace(
    /(class \w+ \{)/,
    `${config.classComment}\n$1`
  );

  // Add method comments
  for (const [methodSig, comment] of Object.entries(config.methodComments)) {
    // Escape special regex characters in the method signature
    const escaped = methodSig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(  ${escaped})`);
    code = code.replace(regex, `  ${comment}\n$1`);
  }

  // Add DOMContentLoaded section comment
  code = code.replace(
    /(document\.addEventListener\("DOMContentLoaded")/,
    `/* ========================================================================\n * Initialization\n * Sets up the game instance and registers NUI event listeners.\n * In debug mode, wires up the debug panel controls instead.\n * ======================================================================== */\n$1`
  );

  // Add word pool comment for typeracer and word_memory
  if (gameName === 'vise_typeracer_game' || gameName === 'vise_word_memory_game') {
    code = code.replace(
      /(  V = \[\s*"ACCESS")/,
      `/* WORD_POOL - Array of hacking/cyber-themed words used in the game */\n  $1`
    );
  }

  // Add tile state enum comment for data_miner
  if (gameName === 'vise_data_miner_game') {
    code = code.replace(
      /(  w = \{ HIDDEN: "hidden", REVEALED: "revealed", FLAGGED: "flagged" \})/,
      `/* TileState - Enum-like object for tile states in the minesweeper grid */\n  $1`
    );
  }

  // Add card icons comment for pair_matching
  if (gameName === 'vise_pair_matching_game') {
    code = code.replace(
      /(this\.cardIcons = \[)/,
      `/* SVG icon definitions for card faces - each has a name and SVG path data */\n      $1`
    );
  }

  fs.writeFileSync(filePath, code);
  console.log(`Annotated ${gameName}/src/game.js`);
}

console.log('\nDone adding comments to all game files!');
