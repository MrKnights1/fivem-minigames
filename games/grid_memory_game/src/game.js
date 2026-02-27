/**
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
 *
 * Depends on shared/nui-utils.js (isDebug, fetchNUI, onNUIMessage, showElement, hideElement)
 * Depends on shared/howler.js (Howl, Howler)
 */

const gameTexts = {};

class GridMemoryGame {
  constructor() {
    this.gridSize = 3;
    this.currentLevel = 0;
    this.targetLevel = 10;
    this.sequence = [];
    this.playerSequence = [];
    this.currentSequenceIndex = 0;
    this.gameState = "idle";
    this.tileDisplayTime = 500;
    this.timeBetweenTiles = 250;
    this.levelTimeoutDuration = 8000;
    this.levelTimerId = null;
    this.levelProgressStartTime = null;
    this.levelProgressBarAnimationId = null;
    this.isActive = false;
    this.inputLocked = true;
    this.sequenceTimerIds = [];
    this.statsUpdateTimeout = null;
    this.signalUpdateTimeout = null;

    this.appElement = document.getElementById("app");
    this.gridContainer = document.getElementById("gridContainer");
    this.scoreProgressBarFill = document.getElementById("scoreProgressBarFill");
    this.levelTimeoutProgressBar = document.getElementById("levelTimeoutProgressBar");
    this.statusTextElement = document.getElementById("statusText");
    this.cpuEl = document.getElementById("cpuNumber");
    this.memEl = document.getElementById("memoryNumber");
    this.debugContainer = document.getElementById("debug");
    this.debugStartButton = document.getElementById("startGame");
    this.debugGridSizeInput = document.getElementById("gridSize");
    this.debugDisplayTimeInput = document.getElementById("tileDisplayTime");
    this.debugLevelTimeoutInput = document.getElementById("levelTimeout");
    this.debugTargetLevelInput = document.getElementById("targetLevel");

    this.sounds = {
      win: new Howl({ src: ["sounds/win.wav"], volume: 0.1 }),
      lose: new Howl({ src: ["sounds/lose.wav"], volume: 0.05 }),
      start: new Howl({ src: ["sounds/start.wav"], volume: 0.1 }),
      demoSound: new Howl({ src: ["sounds/demoSound.wav"], volume: 0.08 }),
      clickSound: new Howl({ src: ["sounds/clickSound.wav"], volume: 0.06 }),
    };

    this.updateScoreProgressBar = this.updateScoreProgressBar.bind(this);
    this.updateLevelProgressBar = this.updateLevelProgressBar.bind(this);
    this.updateStats = this.updateStats.bind(this);
    this.updateSignal = this.updateSignal.bind(this);
    this.start = this.start.bind(this);
    this.handleTileClick = this.handleTileClick.bind(this);
    this.cleanup = this.cleanup.bind(this);
    this.generateGrid = this.generateGrid.bind(this);
    this.nextLevel = this.nextLevel.bind(this);
    this.showSequence = this.showSequence.bind(this);
    this.startLevelTimer = this.startLevelTimer.bind(this);
    this.clearLevelTimer = this.clearLevelTimer.bind(this);
    this.finish = this.finish.bind(this);
    this.lockInput = this.lockInput.bind(this);
    this.unlockInput = this.unlockInput.bind(this);

    if (isDebug()) {
      if (this.debugContainer) {
        this.debugContainer.classList.remove("hidden");
      }

      if (this.debugStartButton) {
        this.debugStartButton.addEventListener("click", () => {
          const gridSizeValue = this.debugGridSizeInput
            ? parseInt(this.debugGridSizeInput.value, 10)
            : NaN;
          const displayTimeValue = this.debugDisplayTimeInput
            ? parseInt(this.debugDisplayTimeInput.value, 10)
            : NaN;
          const levelTimeoutValue = this.debugLevelTimeoutInput
            ? parseInt(this.debugLevelTimeoutInput.value, 10)
            : NaN;
          const targetLevelValue = this.debugTargetLevelInput
            ? parseInt(this.debugTargetLevelInput.value, 10)
            : NaN;

          this.start({
            gridSize: gridSizeValue || 3,
            tileDisplayTime: displayTimeValue || 500,
            levelTimeoutDuration: levelTimeoutValue || 8000,
            targetLevel: targetLevelValue || 10,
          });
        });
      }
    }
  }

  lockInput() {
    this.inputLocked = true;
    if (this.gridContainer) {
      this.gridContainer.classList.add("input-locked");
    }
  }

  unlockInput() {
    if (this.isActive && this.gameState === "waiting") {
      this.inputLocked = false;
      if (this.gridContainer) {
        this.gridContainer.classList.remove("input-locked");
      }
    }
  }

  updateStats() {
    if (!this.isActive) return;

    if (this.cpuEl) {
      this.cpuEl.textContent = Math.floor(Math.random() * 31) + 65;
    }
    if (this.memEl) {
      this.memEl.textContent = Math.floor(Math.random() * 31) + 60;
    }

    const statsInterval = 1000 + Math.random() * 1500;
    if (this.isActive) {
      this.statsUpdateTimeout = setTimeout(this.updateStats, statsInterval);
    }
  }

  updateSignal() {
    if (!this.isActive) return;

    const signalBarElements = document.querySelectorAll("#signalBars div");
    if (!signalBarElements || signalBarElements.length === 0) return;

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

    signalBarElements.forEach((bar, index) => {
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

    const signalInterval = 150 + Math.random() * 350;
    if (this.isActive) {
      this.signalUpdateTimeout = setTimeout(this.updateSignal, signalInterval);
    }
  }

  cleanup() {
    this.isActive = false;
    this.gameState = "idle";
    this.lockInput();
    this.clearLevelTimer();

    this.sequenceTimerIds.forEach((id) => clearTimeout(id));
    this.sequenceTimerIds = [];
    if (this.statsUpdateTimeout) {
      clearTimeout(this.statsUpdateTimeout);
    }
    if (this.signalUpdateTimeout) {
      clearTimeout(this.signalUpdateTimeout);
    }

    this.statsUpdateTimeout = null;
    this.signalUpdateTimeout = null;
    this.currentLevel = 0;
    this.sequence = [];
    this.playerSequence = [];
    this.currentSequenceIndex = 0;

    if (this.gridContainer) {
      this.gridContainer.innerHTML = "";
    }
    if (this.scoreProgressBarFill) {
      this.scoreProgressBarFill.style.width = "0%";
    }

    const statusText = document.getElementById("statusText");
    if (statusText) {
      statusText.textContent = gameTexts.GAME_STATE_IDLE;
    }
    if (this.cpuEl) {
      this.cpuEl.textContent = "--";
    }
    if (this.memEl) {
      this.memEl.textContent = "--";
    }

    const signalBarElements = document.querySelectorAll("#signalBars div");
    if (signalBarElements) {
      signalBarElements.forEach((bar) => {
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

  start(config = {}) {
    this.cleanup();

    this.gridSize = Math.max(2, Math.min(5, config.gridSize || 3));
    this.targetLevel = Math.max(1, config.targetLevel || 10);
    this.tileDisplayTime = Math.max(100, config.tileDisplayTime || 500);
    this.timeBetweenTiles = Math.max(50, this.tileDisplayTime / 2);
    this.baseLevelTimeout = Math.max(1000, config.levelTimeoutDuration || 5000);
    this.timePerSequenceItem = 1000;
    this.currentLevel = 0;
    this.sequence = [];
    this.playerSequence = [];
    this.currentSequenceIndex = 0;
    this.isActive = true;
    this.gameState = "idle";

    this.generateGrid();
    this.updateScoreProgressBar();
    this.clearLevelTimer();

    const statusText = document.getElementById("statusText");
    if (statusText) {
      statusText.textContent = gameTexts.GAME_STATE_COMPILING;
    }

    this.updateStats();
    this.updateSignal();
    showElement("app");
    this.sounds.start.play();

    setTimeout(() => {
      if (this.isActive) {
        this.nextLevel();
      }
    }, 1000);
  }

  generateGrid() {
    if (!this.gridContainer) return;

    this.gridContainer.innerHTML = "";
    this.gridContainer.style.display = "grid";
    this.gridContainer.style.gridTemplateColumns = `repeat(${this.gridSize}, minmax(0, 1fr))`;
    this.gridContainer.style.gap = "0.5rem";
    this.gridContainer.classList.add("input-locked");

    const gridSizeRem = this.gridSize * 4 + (this.gridSize - 1) * 0.5;
    this.gridContainer.style.width = `${gridSizeRem}rem`;
    this.gridContainer.style.height = `${gridSizeRem}rem`;

    const totalTiles = this.gridSize * this.gridSize;
    for (let tileIndex = 0; tileIndex < totalTiles; tileIndex++) {
      const tile = document.createElement("div");
      tile.className =
        "grid-tile bg-gray-800 rounded cursor-pointer transition-colors duration-100 ease-in-out flex items-center justify-center w-16 h-16";
      tile.dataset.index = tileIndex;
      tile.addEventListener("click", this.handleTileClick);
      this.gridContainer.appendChild(tile);
    }
  }

  nextLevel() {
    if (!this.isActive || this.gameState === "gameover") return;

    if (this.currentLevel >= this.targetLevel) {
      this.finish(true);
      return;
    }

    this.currentLevel++;
    this.updateScoreProgressBar();

    const statusText = document.getElementById("statusText");
    if (statusText) {
      statusText.textContent = gameTexts.GAME_STATE_OBSERVE;
    }

    this.playerSequence = [];
    this.currentSequenceIndex = 0;
    this.lockInput();
    this.gameState = "showing";

    const sequenceLength = this.currentLevel;
    const totalTiles = this.gridSize * this.gridSize;
    this.sequence = [];
    for (let i = 0; i < sequenceLength; i++) {
      this.sequence.push(Math.floor(Math.random() * totalTiles));
    }

    this.levelTimeoutDuration =
      this.baseLevelTimeout + sequenceLength * this.timePerSequenceItem;
    this.showSequence();
  }

  showSequence() {
    let delay = 500;
    this.lockInput();

    this.sequenceTimerIds.forEach((id) => clearTimeout(id));
    this.sequenceTimerIds = [];

    this.sequence.forEach((tileIndex, sequencePosition) => {
      const timerId = setTimeout(() => {
        if (!this.isActive || this.gameState !== "showing") return;

        const tileElement = this.gridContainer
          ? this.gridContainer.querySelector(`[data-index="${tileIndex}"]`)
          : null;

        if (tileElement) {
          this.sounds.demoSound.play();
          tileElement.classList.add("tile-highlight");
          const highlightTimerId = setTimeout(() => {
            if (this.gridContainer && this.gridContainer.contains(tileElement)) {
              tileElement.classList.remove("tile-highlight");
            }
          }, this.tileDisplayTime);
          this.sequenceTimerIds.push(highlightTimerId);
        }

        if (sequencePosition === this.sequence.length - 1) {
          const transitionDelay = this.tileDisplayTime + 100;
          const transitionTimerId = setTimeout(() => {
            if (this.isActive && this.gameState === "showing") {
              this.gameState = "waiting";
              this.unlockInput();
              this.startLevelTimer();

              const statusText = document.getElementById("statusText");
              if (statusText) {
                statusText.textContent = gameTexts.GAME_STATE_WAITING;
              }
            }
          }, transitionDelay);
          this.sequenceTimerIds.push(transitionTimerId);
        }
      }, delay);

      this.sequenceTimerIds.push(timerId);
      delay += this.tileDisplayTime + this.timeBetweenTiles;
    });
  }

  startLevelTimer() {
    this.clearLevelTimer();

    if (this.levelTimeoutProgressBar) {
      this.levelTimeoutProgressBar.style.transition = "none";
      this.levelTimeoutProgressBar.style.width = "100%";
    }

    this.levelProgressStartTime = Date.now();
    this.levelProgressBarAnimationId = requestAnimationFrame(
      this.updateLevelProgressBar
    );

    this.levelTimerId = setTimeout(() => {
      if (this.isActive && this.gameState === "waiting") {
        this.lockInput();
        this.gameState = "gameover";
        this.finish(false);
      }
    }, this.levelTimeoutDuration);
  }

  clearLevelTimer() {
    if (this.levelTimerId) {
      clearTimeout(this.levelTimerId);
      this.levelTimerId = null;
    }
    if (this.levelProgressBarAnimationId) {
      cancelAnimationFrame(this.levelProgressBarAnimationId);
      this.levelProgressBarAnimationId = null;
    }
    this.levelProgressStartTime = null;

    if (this.levelTimeoutProgressBar) {
      this.levelTimeoutProgressBar.style.transition = "none";
      this.levelTimeoutProgressBar.style.width = "100%";
    }
  }

  updateLevelProgressBar() {
    if (
      !this.isActive ||
      this.levelProgressStartTime === null ||
      this.gameState !== "waiting"
    ) {
      if (this.levelProgressBarAnimationId) {
        cancelAnimationFrame(this.levelProgressBarAnimationId);
      }
      this.levelProgressBarAnimationId = null;
      return;
    }

    const elapsed = Date.now() - this.levelProgressStartTime;
    const remainingPercent = Math.max(
      0,
      100 - (elapsed / this.levelTimeoutDuration) * 100
    );

    if (this.levelTimeoutProgressBar) {
      this.levelTimeoutProgressBar.style.width = `${remainingPercent}%`;
    }

    if (remainingPercent > 0) {
      this.levelProgressBarAnimationId = requestAnimationFrame(
        this.updateLevelProgressBar
      );
    } else {
      this.levelProgressBarAnimationId = null;
      if (this.levelTimeoutProgressBar) {
        this.levelTimeoutProgressBar.style.width = "0%";
      }
    }
  }

  handleTileClick(event) {
    if (this.inputLocked || this.gameState !== "waiting") return;

    const clickedTile = event.target.closest(".grid-tile");
    if (!clickedTile) return;

    const clickedIndex = parseInt(clickedTile.dataset.index, 10);
    if (isNaN(clickedIndex)) return;

    if (clickedIndex === this.sequence[this.currentSequenceIndex]) {
      this.sounds.clickSound.play();
      this.playerSequence.push(clickedIndex);
      this.currentSequenceIndex++;
      clickedTile.classList.add("tile-clicked-correct");
      setTimeout(() => clickedTile.classList.remove("tile-clicked-correct"), 150);

      if (this.currentSequenceIndex === this.sequence.length) {
        this.lockInput();
        this.gameState = "checking";
        this.clearLevelTimer();

        const statusText = document.getElementById("statusText");
        if (statusText) {
          statusText.textContent = gameTexts.GAME_STATE_WAITING_NEW_TURN;
        }

        setTimeout(() => {
          if (this.isActive) {
            this.nextLevel();
          }
        }, 1000);
      }
    } else {
      clickedTile.classList.add("tile-clicked-incorrect");
      setTimeout(
        () => clickedTile.classList.remove("tile-clicked-incorrect"),
        300
      );
      this.lockInput();
      this.gameState = "gameover";
      this.clearLevelTimer();
      this.finish(false);
    }
  }

  updateScoreProgressBar() {
    if (!this.scoreProgressBarFill || this.targetLevel <= 0) return;

    const progressPercent = Math.min(
      100,
      (this.currentLevel / this.targetLevel) * 100
    );
    this.scoreProgressBarFill.style.width = `${progressPercent}%`;
  }

  finish(isWin) {
    if (!this.isActive && this.gameState !== "gameover") return;

    this.isActive = false;
    this.lockInput();
    this.gameState = "gameover";
    this.clearLevelTimer();

    this.sequenceTimerIds.forEach((id) => clearTimeout(id));
    this.sequenceTimerIds = [];
    if (this.statsUpdateTimeout) {
      clearTimeout(this.statsUpdateTimeout);
    }
    if (this.signalUpdateTimeout) {
      clearTimeout(this.signalUpdateTimeout);
    }

    this.statsUpdateTimeout = null;
    this.signalUpdateTimeout = null;

    if (isWin) {
      this.sounds.win.play();
      showElement("winOverlay");
    } else {
      this.sounds.lose.play();
      showElement("lossOverlay");
    }

    setTimeout(() => {
      hideElement("app", () => {
        fetchNUI("gameFinished", { result: isWin, level: this.currentLevel });
      });
    }, 3000);
  }
}

/* ========================================================================
 * Initialization
 * Sets up the game instance and registers NUI event listeners.
 * In debug mode, wires up the debug panel controls instead.
 * ======================================================================== */
document.addEventListener("DOMContentLoaded", function () {
  const game = new GridMemoryGame();

  if (isDebug()) return;

  const handleEscapeKey = (event) => {
    if (event.key !== "Escape") return;
    if (!game.isActive) return;

    const appElement = document.getElementById("app");
    if (appElement && appElement.classList.contains("opacity-100")) {
      game.finish(false);
    }
  };

  let escapeListenerActive = false;

  const unsubscribeStart = onNUIMessage("start", (data) => {
    const config = {
      gridSize: data.gridSize ? parseInt(data.gridSize, 10) : 3,
      tileDisplayTime: data.tileDisplayTime
        ? parseInt(data.tileDisplayTime, 10)
        : 500,
      levelTimeoutDuration: data.levelTimeout
        ? parseInt(data.levelTimeout, 10)
        : 8000,
      targetLevel: data.targetScore
        ? parseInt(data.targetScore, 10)
        : data.targetLevel
          ? parseInt(data.targetLevel, 10)
          : 10,
    };
    game.start(config);
  });

  window.addEventListener("unload", () => {
    unsubscribeStart();
    if (escapeListenerActive) {
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
      escapeListenerActive = true;
    }

    if (response.texts) {
      const texts = response.texts;

      Array.from(document.getElementsByClassName("gameTitleText")).forEach(
        (element) => {
          element.textContent = texts.GAME_TITLE;
        }
      );
      Array.from(document.getElementsByClassName("terminalTitleText")).forEach(
        (element) => {
          element.textContent = texts.TERMINAL_TITLE;
        }
      );
      Array.from(document.getElementsByClassName("accessGrantedText")).forEach(
        (element) => {
          element.textContent = texts.END_SCREEN_ACCESS_GRANTED;
        }
      );
      Array.from(document.getElementsByClassName("accessDeniedText")).forEach(
        (element) => {
          element.textContent = texts.END_SCREEN_ACCESS_DENIED;
        }
      );

      document.getElementById("sessionText").textContent =
        texts.END_SCREEN_SESSION;
      document.getElementById("errorText").textContent =
        texts.END_SCREEN_ERROR;
      document.getElementById("authFailedText").textContent =
        texts.END_SCREEN_AUTHENTICATION_FAILED;

      gameTexts.GAME_STATE_IDLE = texts.GAME_STATE_IDLE;
      gameTexts.GAME_STATE_COMPILING = texts.GAME_STATE_COMPILING;
      gameTexts.GAME_STATE_OBSERVE = texts.GAME_STATE_OBSERVE;
      gameTexts.GAME_STATE_WAITING = texts.GAME_STATE_WAITING;
      gameTexts.GAME_STATE_WAITING_NEW_TURN = texts.GAME_STATE_WAITING_NEW_TURN;
    }
  });
});
