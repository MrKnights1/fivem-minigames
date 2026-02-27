/**
 * VISE Letter Sequence Game - Keyboard-based letter typing challenge
 *
 * The player must press a sequence of displayed letters (Q, W, E, R, A, S, D, F)
 * in the correct order before time runs out. Each correct keypress advances to
 * the next letter. A wrong key or timeout results in failure.
 *
 * Config options (via NUI message):
 *   - numberOfLetters: how many letters in the sequence (5-30, default 15)
 *   - timeout: time limit in seconds (3-60, default 10)
 *
 * Dependencies (loaded before this file):
 *   - howler.js (Howl, Howler)
 *   - nui-utils.js (isDebug, fetchNUI, onNUIMessage, showElement, hideElement)
 */

class LetterSequenceGame {
  constructor() {
    this.isActive = false;
    this.progressBarAnimationId = null;
    this.startTime = 0;
    this.timeLimit = 10000;
    this.letters = [];
    this.letterElements = [];
    this.currentIndex = 0;
    this.allowedLetters = ["Q", "W", "E", "R", "A", "S", "D", "F"];
    this.numberOfLetters = 15;

    this.cpuEl = document.getElementById("cpuNumber");
    this.memEl = document.getElementById("memoryNumber");
    this.statsUpdateTimeout = null;
    this.signalUpdateTimeout = null;
    this.progressBar = document.getElementById("progress-fill");
    this.letterContainer = document.getElementById("letter-container");

    this.sounds = {
      win: new Howl({ src: ["sounds/win.wav"], volume: 0.1 }),
      lose: new Howl({ src: ["sounds/lose.wav"], volume: 0.05 }),
      start: new Howl({ src: ["sounds/start.wav"], volume: 0.1 }),
      correct: new Howl({ src: ["sounds/correct.mp3"], volume: 0.05 }),
    };

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /** Returns a random letter from the allowed set (QWER ASDF). */
  getRandomLetter() {
    return this.allowedLetters[
      Math.floor(Math.random() * this.allowedLetters.length)
    ];
  }

  /** Creates the random letter sequence of the specified length. */
  generateLetters(count) {
    this.letters = [];
    for (let i = 0; i < count; i++) {
      this.letters.push(this.getRandomLetter());
    }
  }

  /** Renders the letter elements in the DOM container. */
  displayLetters() {
    this.letterContainer.innerHTML = "";
    this.letterElements = [];

    this.letters.forEach((letter, index) => {
      const letterDiv = document.createElement("div");
      letterDiv.className = "letter";
      letterDiv.textContent = letter;
      this.letterContainer.appendChild(letterDiv);
      this.letterElements.push(letterDiv);
    });

    this.updateLetterStates();
  }

  /** Updates CSS classes to show active/done/fail states for each letter. */
  updateLetterStates() {
    this.letterElements.forEach((element, index) => {
      element.classList.remove("letter-active", "letter-done", "letter-fail");

      if (index < this.currentIndex) {
        element.classList.add("letter-done");
      } else if (index === this.currentIndex) {
        element.classList.add("letter-active");
      }
    });
  }

  /** Starts the countdown timer that updates the progress bar. */
  startGameLoop() {
    this.startTime = Date.now();
    this.progressBar.style.width = "100%";

    if (this.progressBarAnimationId) {
      cancelAnimationFrame(this.progressBarAnimationId);
    }

    this.updateProgressBar();
  }

  /** Animation frame callback for smooth progress bar. */
  updateProgressBar() {
    if (!this.isActive) return;

    const elapsed = Date.now() - this.startTime;
    const remainingPercent = Math.max(0, 100 - (elapsed / this.timeLimit) * 100);
    this.progressBar.style.width = `${remainingPercent}%`;

    if (remainingPercent <= 0) {
      this.progressBarAnimationId = null;
      this.handleFailure("Time expired");
    } else {
      this.progressBarAnimationId = requestAnimationFrame(() => this.updateProgressBar());
    }
  }

  /** Stops the progress bar animation. */
  stopGameLoop() {
    if (this.progressBarAnimationId) {
      cancelAnimationFrame(this.progressBarAnimationId);
      this.progressBarAnimationId = null;
    }
  }

  /** Keyboard event handler: checks if pressed key matches the current expected letter. */
  handleKeyDown(event) {
    if (!this.isActive) return;

    const pressedKey = event.key.toUpperCase();
    if (pressedKey.length !== 1 || !this.allowedLetters.includes(pressedKey)) return;

    const expectedLetter = this.letters[this.currentIndex];

    if (pressedKey === expectedLetter) {
      const currentElement = this.letterElements[this.currentIndex];
      if (currentElement) {
        currentElement.classList.remove("letter-active");
        currentElement.classList.add("letter-done");
      }

      if (this.sounds.correct) {
        this.sounds.correct.play();
      }

      this.currentIndex++;

      if (this.currentIndex >= this.letters.length) {
        this.handleSuccess("All letters pressed successfully");
      } else {
        const nextElement = this.letterElements[this.currentIndex];
        if (nextElement) {
          nextElement.classList.add("letter-active");
        }
      }
    } else {
      const currentElement = this.letterElements[this.currentIndex];
      if (currentElement) {
        currentElement.classList.add("letter-fail");
      }

      if (this.sounds.lose) {
        this.sounds.lose.play();
      }

      this.handleFailure(`Incorrect key pressed. Expected ${expectedLetter}, got ${pressedKey}`);
    }
  }

  /** Periodically updates the fake CPU usage display. */
  updateStats() {
    if (!this.isActive) return;

    if (this.cpuEl) {
      this.cpuEl.textContent = Math.floor(Math.random() * 30) + 70;
    }

    if (this.memEl) {
      this.memEl.textContent = Math.floor(Math.random() * 30) + 70;
    }

    const delay = 1000 + Math.random() * 1000;
    this.statsUpdateTimeout = setTimeout(() => this.updateStats(), delay);
  }

  /** Periodically updates the fake signal strength bars. */
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
      if (index < activeBars) {
        if (activeBars === 1) {
          bar.className = "h-3 w-1 bg-red-600";
        } else if (activeBars === 2) {
          bar.className = "h-3 w-1 bg-yellow-400";
        } else {
          bar.className = "h-3 w-1 bg-main-400";
        }
      } else {
        bar.className = "h-3 w-1 bg-main-900";
      }
    });

    const delay = 100 + Math.random() * 400;
    this.signalUpdateTimeout = setTimeout(() => this.updateSignal(), delay);
  }

  /** Clears the stats and signal update timers. */
  cleanupTimeouts() {
    if (this.statsUpdateTimeout) {
      clearTimeout(this.statsUpdateTimeout);
      this.statsUpdateTimeout = null;
    }

    if (this.signalUpdateTimeout) {
      clearTimeout(this.signalUpdateTimeout);
      this.signalUpdateTimeout = null;
    }
  }

  /** Called when all letters are pressed correctly: shows win overlay. */
  handleSuccess(reason) {
    if (!this.isActive) return;

    this.isActive = false;
    this.stopGameLoop();
    this.cleanupTimeouts();

    showElement("winOverlay");

    if (this.sounds.win) {
      this.sounds.win.play();
    }

    window.removeEventListener("keydown", this.handleKeyDown);

    setTimeout(() => {
      hideElement("app", () => {
        fetchNUI("gameFinished", { result: true });
      });
    }, 3000);
  }

  /** Called on wrong key or timeout: shows loss overlay. */
  handleFailure(reason) {
    if (!this.isActive) return;

    this.isActive = false;
    this.stopGameLoop();
    this.cleanupTimeouts();

    if (this.letterElements[this.currentIndex]) {
      this.letterElements[this.currentIndex].classList.add("letter-fail");
    }

    showElement("lossOverlay");

    if (this.sounds.lose) {
      this.sounds.lose.play();
    }

    window.removeEventListener("keydown", this.handleKeyDown);

    setTimeout(() => {
      hideElement("app", () => {
        fetchNUI("gameFinished", { result: false });
      });
    }, 3000);
  }

  /** Hides the win/loss overlay elements. */
  cleanupOverlays() {
    ["winOverlay", "lossOverlay"].forEach((overlayId) => {
      const overlay = document.getElementById(overlayId);
      if (overlay) {
        overlay.classList.add("hidden", "opacity-0");
        overlay.classList.remove("opacity-100");
      }
    });
  }

  /** Initializes and starts a new game with letter count and time limit. */
  start(numberOfLetters, timeoutSeconds) {
    this.cleanupOverlays();
    this.stopGameLoop();
    this.cleanupTimeouts();
    window.removeEventListener("keydown", this.handleKeyDown);

    this.numberOfLetters = numberOfLetters;
    this.timeLimit = timeoutSeconds * 1000;
    this.currentIndex = 0;
    this.isActive = true;

    this.generateLetters(this.numberOfLetters);
    this.displayLetters();
    this.startGameLoop();
    this.updateStats();
    this.updateSignal();

    showElement("app");

    if (this.sounds.start) {
      this.sounds.start.play();
    }

    window.addEventListener("keydown", this.handleKeyDown);
  }
}

/* ========================================================================
 * Initialization
 * Sets up the game instance and registers NUI event listeners.
 * In debug mode, wires up the debug panel controls instead.
 * ======================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const game = new LetterSequenceGame();

  game.cpuEl = document.getElementById("cpuNumber");
  game.memEl = document.getElementById("memoryNumber");
  game.progressBar = document.getElementById("progress-fill");
  game.letterContainer = document.getElementById("letter-container");

  if (isDebug()) {
    const startButton = document.getElementById("startGame");
    const timeoutInput = document.getElementById("timeout");
    const numLettersInput = document.getElementById("numLetters");
    const debugPanel = document.getElementById("debug");

    if (debugPanel) {
      debugPanel.classList.remove("hidden");
    }

    if (startButton && timeoutInput && numLettersInput) {
      startButton.addEventListener("click", () => {
        const timeoutSeconds = parseInt(timeoutInput.value, 10) || 10;
        const letterCount = parseInt(numLettersInput.value, 10) || 15;
        game.start(letterCount, timeoutSeconds);
      });
    }

    return;
  }

  const handleEscapeKey = (event) => {
    if (event.key !== "Escape") return;
    if (!game.isActive) return;

    const appElement = document.getElementById("app");
    if (appElement && appElement.classList.contains("opacity-100")) {
      game.handleFailure("Esc pressed");
    }
  };

  let escapeListenerActive = false;

  const unsubscribeStart = onNUIMessage("start", (data = {}) => {
    const rawLetterCount = data.numberOfLetters || 15;
    const rawTimeout = data.timeout || 10;
    const clampedLetterCount = Math.max(5, Math.min(30, rawLetterCount));
    const clampedTimeout = Math.max(3, Math.min(60, rawTimeout));
    game.start(clampedLetterCount, clampedTimeout);
  });

  window.addEventListener("unload", () => {
    unsubscribeStart();
    if (escapeListenerActive) {
      window.removeEventListener("keydown", handleEscapeKey);
    }
  });

  fetchNUI("nuiLoaded", {}).then((response) => {
    if (response.theme && response.theme !== "default" && response.theme !== "green") {
      document.documentElement.setAttribute("theme", response.theme);
    }

    if (response.escapeEndsGame === true) {
      window.addEventListener("keydown", handleEscapeKey);
      escapeListenerActive = true;
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

      document.getElementById("sessionText").textContent = texts.END_SCREEN_SESSION;
      document.getElementById("errorText").textContent = texts.END_SCREEN_ERROR;
      document.getElementById("authFailedText").textContent = texts.END_SCREEN_AUTHENTICATION_FAILED;
    }
  });
});
