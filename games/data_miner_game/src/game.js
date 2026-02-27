/**
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
 *
 * Depends on shared/nui-utils.js (isDebug, fetchNUI, onNUIMessage, showElement, hideElement)
 * Depends on shared/howler.js (Howl, Howler)
 */

const TileState = { HIDDEN: "hidden", REVEALED: "revealed", FLAGGED: "flagged" };

class DataMinerGame {
  constructor() {
    this.gridWidth = 9;
    this.gridHeight = 9;
    this.hazardCount = 10;
    this.gameTimeoutDuration = 0;
    this.grid = [];
    this.flagsPlaced = 0;
    this.revealedTilesCount = 0;
    this.gameOverState = false;
    this.startTime = null;
    this.elapsedTime = 0;
    this.timerIntervalId = null;
    this.gameTimeoutId = null;
    this.gameTimeoutAnimationId = null;
    this.isActive = false;
    this.statsUpdateTimeout = null;
    this.signalUpdateTimeout = null;

    this.appElement = document.getElementById("app");
    this.gridContainer = document.getElementById("gridContainer");
    this.hazardCounterElement = document.getElementById("hazardCounter");
    this.hazardCounterTwoElement = document.getElementById("hazardCounterTwo");
    this.gameTimeoutContainer = document.getElementById("gameTimeoutContainer");
    this.gameTimeoutProgressBar = document.getElementById("gameTimeoutProgressBar");
    this.cpuEl = document.getElementById("cpuNumber");
    this.memEl = document.getElementById("memoryNumber");
    this.debugContainer = document.getElementById("debug");
    this.debugStartButton = document.getElementById("startGame");
    this.debugGridWidthInput = document.getElementById("gridWidth");
    this.debugGridHeightInput = document.getElementById("gridHeight");
    this.debugHazardCountInput = document.getElementById("hazardCount");
    this.debugGameTimeoutInput = document.getElementById("gameTimeout");

    this.sounds = {
      win: new Howl({ src: ["sounds/win.wav"], volume: 0.1 }),
      lose: new Howl({ src: ["sounds/lose.wav"], volume: 0.05 }),
      start: new Howl({ src: ["sounds/start.wav"], volume: 0.1 }),
    };

    this.updateStats = this.updateStats.bind(this);
    this.updateSignal = this.updateSignal.bind(this);
    this.handleTileClick = this.handleTileClick.bind(this);
    this.handleTileRightClick = this.handleTileRightClick.bind(this);
    this.updateGameProgressBar = this.updateGameProgressBar.bind(this);

    if (isDebug()) {
      if (this.debugContainer) {
        this.debugContainer.classList.remove("hidden");
      }
      if (this.debugStartButton) {
        this.debugStartButton.addEventListener("click", () => {
          const widthValue = this.debugGridWidthInput ? this.debugGridWidthInput.value : null;
          const heightValue = this.debugGridHeightInput ? this.debugGridHeightInput.value : null;
          const hazardValue = this.debugHazardCountInput ? this.debugHazardCountInput.value : null;
          const timeoutValue = this.debugGameTimeoutInput ? this.debugGameTimeoutInput.value : null;

          const parsedWidth = parseInt(widthValue, 10) || 9;
          const parsedHeight = parseInt(heightValue, 10) || 9;
          const parsedHazards = parseInt(hazardValue, 10) || 10;
          const parsedTimeout = parseInt(timeoutValue, 10) || 0;

          this.start({
            gridWidth: parsedWidth,
            gridHeight: parsedHeight,
            hazardCount: parsedHazards,
            gameTimeout: parsedTimeout,
          });
        });
      }
    }
  }

  /** Periodically updates the fake CPU usage display with random values */
  updateStats() {
    if (!this.isActive) return;

    if (this.cpuEl) {
      this.cpuEl.textContent = Math.floor(Math.random() * 31) + 65;
    }
    if (this.memEl) {
      this.memEl.textContent = Math.floor(Math.random() * 31) + 60;
    }

    const delay = 1000 + Math.random() * 1500;
    if (this.isActive) {
      this.statsUpdateTimeout = setTimeout(this.updateStats, delay);
    }
  }

  /** Periodically updates the fake signal strength indicator bars */
  updateSignal() {
    if (!this.isActive) return;

    const signalBars = document.querySelectorAll("#signalBars div");
    if (!signalBars || signalBars.length === 0) return;

    let activeBars;
    const randomValue = Math.random();

    if (randomValue < 0.05) {
      activeBars = 1;
    } else if (randomValue < 0.15) {
      activeBars = 2;
    } else if (randomValue < 0.45) {
      activeBars = 3;
    } else {
      activeBars = 4;
    }

    signalBars.forEach((bar, index) => {
      bar.className = "h-3 w-1";
      if (index < activeBars) {
        if (activeBars === 1) {
          bar.classList.add("bg-red-600");
        } else if (activeBars === 2) {
          bar.classList.add("bg-yellow-400");
        } else {
          bar.classList.add("bg-main-400");
        }
      } else {
        bar.classList.add("bg-main-900");
      }
    });

    const delay = 150 + Math.random() * 350;
    if (this.isActive) {
      this.signalUpdateTimeout = setTimeout(this.updateSignal, delay);
    }
  }

  /** Resets all game state, clears timers, and hides overlays */
  cleanup() {
    this.isActive = false;
    this.gameOverState = true;
    this.stopGameTimer();

    if (this.statsUpdateTimeout) {
      clearTimeout(this.statsUpdateTimeout);
    }
    if (this.signalUpdateTimeout) {
      clearTimeout(this.signalUpdateTimeout);
    }
    this.statsUpdateTimeout = null;
    this.signalUpdateTimeout = null;

    this.grid = [];
    this.flagsPlaced = 0;
    this.revealedTilesCount = 0;
    this.elapsedTime = 0;
    this.startTime = null;

    if (this.gridContainer) {
      this.gridContainer.textContent = "";
    }
    if (this.hazardCounterElement) {
      this.hazardCounterElement.textContent = "--";
    }
    if (this.hazardCounterTwoElement) {
      this.hazardCounterTwoElement.textContent = "--";
    }
    if (this.gameTimeoutProgressBar) {
      this.gameTimeoutProgressBar.style.transition = "none";
      this.gameTimeoutProgressBar.style.width = "100%";
    }
    if (this.gameTimeoutContainer) {
      this.gameTimeoutContainer.classList.remove("hidden");
    }
    if (this.cpuEl) {
      this.cpuEl.textContent = "--";
    }
    if (this.memEl) {
      this.memEl.textContent = "--";
    }

    const signalBars = document.querySelectorAll("#signalBars div");
    if (signalBars) {
      signalBars.forEach((bar) => {
        bar.className = "h-3 w-1 bg-main-900";
      });
    }

    ["winOverlay", "lossOverlay"].forEach((overlayId) => {
      const overlay = document.getElementById(overlayId);
      if (overlay) {
        overlay.classList.add("hidden", "opacity-0");
        overlay.classList.remove("opacity-100");
      }
    });

    Object.values(this.sounds).forEach((sound) => sound.stop());
  }

  /** Initializes and starts a new game with the given configuration */
  start(config = {}) {
    this.cleanup();

    this.gridWidth = Math.max(5, Math.min(30, config.gridWidth || 9));
    this.gridHeight = Math.max(5, Math.min(30, config.gridHeight || 9));

    const totalTiles = this.gridWidth * this.gridHeight;
    const maxHazards = Math.floor(totalTiles * 0.9);
    const minHazards = 1;

    this.hazardCount = Math.max(minHazards, Math.min(maxHazards, config.hazardCount || 10));
    if (this.hazardCount >= totalTiles) {
      this.hazardCount = totalTiles - 1;
    }

    this.gameTimeoutDuration = Math.max(0, config.gameTimeout || 0) * 1000;
    this.flagsPlaced = 0;
    this.revealedTilesCount = 0;
    this.gameOverState = false;
    this.elapsedTime = 0;
    this.startTime = null;
    this.isActive = true;

    this.generateGrid();
    this.placeHazards();
    this.updateHazardCounter();

    if (this.gameTimeoutContainer) {
      if (this.gameTimeoutDuration > 0) {
        this.gameTimeoutContainer.classList.remove("hidden");
        if (this.gameTimeoutProgressBar) {
          this.gameTimeoutProgressBar.style.transition = "none";
          this.gameTimeoutProgressBar.style.width = "100%";
        }
      } else {
        this.gameTimeoutContainer.classList.add("hidden");
      }
    }

    this.updateStats();
    this.updateSignal();
    showElement("app");
    this.sounds.start.play();

    if (this.gameTimeoutDuration > 0) {
      this.startGameTimer();
    } else {
      this.startTime = Date.now();
      this.elapsedTime = 0;
    }
  }

  /** Creates the grid DOM elements and initializes tile data */
  generateGrid() {
    if (!this.gridContainer) return;

    this.gridContainer.textContent = "";
    this.gridContainer.style.display = "grid";
    this.gridContainer.style.gridTemplateColumns = `repeat(${this.gridWidth}, minmax(0, 1fr))`;
    this.gridContainer.style.gap = "1px";

    const totalTiles = this.gridWidth * this.gridHeight;
    this.grid = [];

    for (let tileIndex = 0; tileIndex < totalTiles; tileIndex++) {
      this.grid.push({
        index: tileIndex,
        state: TileState.HIDDEN,
        isHazard: false,
        adjacentHazards: 0,
        element: null,
      });

      const tileElement = document.createElement("div");
      tileElement.className = "tile tile-hidden";
      tileElement.dataset.index = tileIndex;
      tileElement.addEventListener("click", this.handleTileClick);
      tileElement.addEventListener("contextmenu", this.handleTileRightClick);
      this.gridContainer.appendChild(tileElement);
      this.grid[tileIndex].element = tileElement;
    }
  }

  /** Randomly places hazard (mine) tiles on the grid */
  placeHazards() {
    let placedCount = 0;
    const totalTiles = this.gridWidth * this.gridHeight;
    let attempts = 0;
    const maxAttempts = totalTiles * 3;

    while (placedCount < this.hazardCount && attempts < maxAttempts) {
      const randomIndex = Math.floor(Math.random() * totalTiles);
      if (!this.grid[randomIndex].isHazard) {
        this.grid[randomIndex].isHazard = true;
        placedCount++;
      }
      attempts++;
    }

    if (placedCount < this.hazardCount) {
      this.hazardCount = placedCount;
      this.updateHazardCounter();
    }

    this.calculateAdjacency();
  }

  /** Calculates the number of adjacent hazards for each non-hazard tile */
  calculateAdjacency() {
    for (let tileIndex = 0; tileIndex < this.grid.length; tileIndex++) {
      if (this.grid[tileIndex].isHazard) continue;

      let adjacentCount = 0;
      this.getNeighbors(tileIndex).forEach((neighborIndex) => {
        if (this.grid[neighborIndex] && this.grid[neighborIndex].isHazard) {
          adjacentCount++;
        }
      });
      this.grid[tileIndex].adjacentHazards = adjacentCount;
    }
  }

  /** Returns array of valid neighbor indices for a given tile index */
  getNeighbors(tileIndex) {
    const neighbors = [];
    const column = tileIndex % this.gridWidth;
    const row = Math.floor(tileIndex / this.gridWidth);

    for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
      for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
        if (deltaCol === 0 && deltaRow === 0) continue;

        const neighborCol = column + deltaCol;
        const neighborRow = row + deltaRow;

        if (
          neighborCol >= 0 &&
          neighborCol < this.gridWidth &&
          neighborRow >= 0 &&
          neighborRow < this.gridHeight
        ) {
          neighbors.push(neighborRow * this.gridWidth + neighborCol);
        }
      }
    }

    return neighbors;
  }

  /** Starts the countdown timer and progress bar animation */
  startGameTimer() {
    if (this.gameOverState || this.startTime) return;

    this.startTime = Date.now();
    this.elapsedTime = 0;

    if (this.gameTimeoutProgressBar) {
      this.gameTimeoutProgressBar.style.transition = "none";
      this.gameTimeoutProgressBar.style.width = "100%";
    }

    if (this.gameTimeoutAnimationId) {
      cancelAnimationFrame(this.gameTimeoutAnimationId);
    }
    this.gameTimeoutAnimationId = requestAnimationFrame(this.updateGameProgressBar);

    if (this.gameTimeoutId) {
      clearTimeout(this.gameTimeoutId);
    }
    this.gameTimeoutId = setTimeout(() => {
      if (!this.gameOverState && this.isActive) {
        this.gameOver(false, "Time limit exceeded.");
      }
    }, this.gameTimeoutDuration);
  }

  /** Stops the countdown timer and saves elapsed time */
  stopGameTimer() {
    if (this.gameTimeoutId) {
      clearTimeout(this.gameTimeoutId);
      this.gameTimeoutId = null;
    }

    if (this.gameTimeoutAnimationId) {
      cancelAnimationFrame(this.gameTimeoutAnimationId);
      this.gameTimeoutAnimationId = null;
    }

    if (this.startTime && !this.gameOverState) {
      this.elapsedTime = Date.now() - this.startTime;
    }
  }

  /** Animation frame callback to smoothly update the timeout progress bar */
  updateGameProgressBar() {
    if (
      !this.isActive ||
      this.gameOverState ||
      this.startTime === null ||
      this.gameTimeoutDuration <= 0
    ) {
      if (this.gameTimeoutAnimationId) {
        cancelAnimationFrame(this.gameTimeoutAnimationId);
      }
      this.gameTimeoutAnimationId = null;
      return;
    }

    const elapsed = Date.now() - this.startTime;
    const remainingPercent = Math.max(0, 100 - (elapsed / this.gameTimeoutDuration) * 100);

    if (this.gameTimeoutProgressBar) {
      this.gameTimeoutProgressBar.style.width = `${remainingPercent}%`;
    }

    if (remainingPercent > 0) {
      this.gameTimeoutAnimationId = requestAnimationFrame(this.updateGameProgressBar);
    } else {
      this.gameTimeoutAnimationId = null;
      if (this.gameTimeoutProgressBar) {
        this.gameTimeoutProgressBar.style.width = "0%";
      }
    }
  }

  /** Left-click handler: reveals tile or triggers game over if hazard */
  handleTileClick(event) {
    if (this.gameOverState || !this.isActive) return;

    const tileElement = event.target.closest(".tile");
    if (!tileElement) return;

    const tileIndex = parseInt(tileElement.dataset.index, 10);
    if (isNaN(tileIndex)) return;

    const tile = this.grid[tileIndex];
    if (!tile || tile.state === TileState.REVEALED || tile.state === TileState.FLAGGED) return;

    if (tile.isHazard) {
      this.gameOver(false, "Firewall hit!");
      return;
    }

    this.revealTile(tileIndex);
  }

  /** Right-click handler: toggles flag on a hidden tile */
  handleTileRightClick(event) {
    event.preventDefault();

    if (this.gameOverState || !this.isActive) return;

    const tileElement = event.target.closest(".tile");
    if (!tileElement) return;

    const tileIndex = parseInt(tileElement.dataset.index, 10);
    if (isNaN(tileIndex)) return;

    const tile = this.grid[tileIndex];
    if (!tile || tile.state === TileState.REVEALED) return;

    this.toggleFlag(tileIndex);
  }

  /** Reveals a single tile, showing its adjacency number or triggering flood fill */
  revealTile(tileIndex) {
    const tile = this.grid[tileIndex];
    if (
      !tile ||
      tile.state === TileState.REVEALED ||
      tile.state === TileState.FLAGGED ||
      this.gameOverState
    ) {
      return;
    }

    tile.state = TileState.REVEALED;
    tile.element.classList.remove("tile-hidden", "tile-flagged");
    tile.element.classList.add("tile-revealed");
    tile.element.textContent = "";
    this.revealedTilesCount++;

    if (tile.adjacentHazards > 0) {
      tile.element.textContent = tile.adjacentHazards;
      tile.element.classList.add(`tile-${tile.adjacentHazards}`);
    } else {
      this.floodFill(tileIndex);
    }

    this.checkWinCondition();
  }

  /** Iteratively reveals neighboring tiles when an empty tile (0 adjacent hazards) is clicked */
  floodFill(startIndex) {
    const queue = [startIndex];

    while (queue.length > 0) {
      const currentIndex = queue.shift();

      for (const neighborIndex of this.getNeighbors(currentIndex)) {
        const neighbor = this.grid[neighborIndex];
        if (!neighbor || neighbor.state !== TileState.HIDDEN) continue;

        neighbor.state = TileState.REVEALED;
        neighbor.element.classList.remove("tile-hidden", "tile-flagged");
        neighbor.element.classList.add("tile-revealed");
        neighbor.element.textContent = "";
        this.revealedTilesCount++;

        if (neighbor.adjacentHazards > 0) {
          neighbor.element.textContent = neighbor.adjacentHazards;
          neighbor.element.classList.add(`tile-${neighbor.adjacentHazards}`);
        } else {
          queue.push(neighborIndex);
        }
      }
    }
  }

  /** Toggles the flag state on a tile (marks/unmarks as suspected hazard) */
  toggleFlag(tileIndex) {
    const tile = this.grid[tileIndex];
    if (!tile || tile.state === TileState.REVEALED || this.gameOverState) return;

    if (tile.state === TileState.FLAGGED) {
      tile.state = TileState.HIDDEN;
      tile.element.classList.remove("tile-flagged");
      tile.element.classList.add("tile-hidden");
      tile.element.textContent = "";
      this.flagsPlaced--;
    } else {
      tile.state = TileState.FLAGGED;
      tile.element.classList.add("tile-flagged");
      tile.element.classList.remove("tile-hidden");
      tile.element.textContent = "\uD83D\uDD12";
      this.flagsPlaced++;
    }

    this.updateHazardCounter();
  }

  /** Updates the remaining hazard count display (hazards - flags placed) */
  updateHazardCounter() {
    if (!this.hazardCounterElement) return;

    const remainingHazards = this.hazardCount - this.flagsPlaced;
    const displayValue = String(remainingHazards).padStart(2, "0");

    this.hazardCounterElement.textContent = displayValue;
    if (this.hazardCounterTwoElement) {
      this.hazardCounterTwoElement.textContent = displayValue;
    }
  }

  /** Checks if all non-hazard tiles have been revealed (win condition) */
  checkWinCondition() {
    const safeTileCount = this.gridWidth * this.gridHeight - this.hazardCount;
    if (this.revealedTilesCount === safeTileCount) {
      this.gameOver(true);
      return true;
    }
    return false;
  }

  /** Handles end of game: reveals all hazards, plays sound, and calls finish */
  gameOver(isWin, reason = null) {
    if (this.gameOverState) return;

    this.gameOverState = true;
    this.stopGameTimer();

    if (this.startTime) {
      this.elapsedTime = Date.now() - this.startTime;
    }

    if (isWin) {
      this.grid.forEach((tile) => {
        if (tile.isHazard && tile.state !== TileState.FLAGGED) {
          tile.state = TileState.FLAGGED;
          tile.element.classList.remove("tile-hidden");
          tile.element.classList.add("tile-flagged");
          tile.element.textContent = "\uD83D\uDD12";
        }
      });
      this.updateHazardCounter();
      if (this.sounds.win) {
        this.sounds.win.play();
      }
    } else {
      this.grid.forEach((tile) => {
        if (tile.isHazard && tile.state !== TileState.FLAGGED) {
          tile.element.classList.remove("tile-hidden", "tile-flagged");
          tile.element.classList.add("tile-revealed", "tile-hazard");
          tile.element.textContent = "\uD83D\uDD25";
        } else if (!tile.isHazard && tile.state === TileState.FLAGGED) {
          tile.element.classList.add("tile-flagged-incorrect");
          tile.element.textContent = "\u274C";
        }
      });
      if (this.sounds.lose) {
        this.sounds.lose.play();
      }
    }

    this.finish(isWin);
  }

  /** Shows win/loss overlay and sends result back to FiveM after a delay */
  finish(isWin) {
    this.isActive = false;
    showElement(isWin ? "winOverlay" : "lossOverlay");

    setTimeout(() => {
      if (this.gameOverState) {
        hideElement("app", () => {
          fetchNUI("gameFinished", { result: isWin });
        });
      }
    }, 3000);
  }
}

/* ========================================================================
 * Initialization
 * Sets up the game instance and registers NUI event listeners.
 * In debug mode, wires up the debug panel controls instead.
 * ======================================================================== */
document.addEventListener("DOMContentLoaded", function () {
  const game = new DataMinerGame();

  if (isDebug()) return;

  function handleEscapeKey(event) {
    if (event.key !== "Escape") return;
    if (!game.isActive) return;

    const appElement = document.getElementById("app");
    if (appElement && appElement.classList.contains("opacity-100")) {
      game.gameOver(false, "Escape pressed.");
    }
  }

  let escapeListenerAdded = false;

  const unsubscribeStart = onNUIMessage("start", (data) => {
    const gameConfig = {
      gridWidth: data.gridWidth ? parseInt(data.gridWidth, 10) : 9,
      gridHeight: data.gridHeight ? parseInt(data.gridHeight, 10) : 9,
      hazardCount: data.hazardCount ? parseInt(data.hazardCount, 10) : 10,
      gameTimeout: data.timeout ? parseInt(data.timeout, 10) : 0,
    };
    game.start(gameConfig);
  });

  window.addEventListener("unload", () => {
    unsubscribeStart();
    if (escapeListenerAdded) {
      window.removeEventListener("keydown", handleEscapeKey);
    }
    game.cleanup();
  });

  fetchNUI("nuiLoaded", {}).then((response) => {
    if (
      response.theme &&
      response.theme !== "default" &&
      response.theme !== "green"
    ) {
      document.documentElement.setAttribute("theme", response.theme);
    }

    if (response.escapeEndsGame === true) {
      window.addEventListener("keydown", handleEscapeKey);
      escapeListenerAdded = true;
    }

    if (response.texts) {
      const texts = response.texts;

      Array.from(document.getElementsByClassName("gameTitleText")).forEach((element) => {
        element.textContent = texts.GAME_TITLE;
      });
      Array.from(document.getElementsByClassName("terminalTitleText")).forEach((element) => {
        element.textContent = texts.TERMINAL_TITLE;
      });
      Array.from(document.getElementsByClassName("accessGrantedText")).forEach((element) => {
        element.textContent = texts.END_SCREEN_ACCESS_GRANTED;
      });
      Array.from(document.getElementsByClassName("accessDeniedText")).forEach((element) => {
        element.textContent = texts.END_SCREEN_ACCESS_DENIED;
      });
    }
  });
});
