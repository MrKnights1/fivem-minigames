/**
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
 *
 * Depends on shared scripts loaded before this file:
 *   - howler.js (Howl, Howler globals)
 *   - nui-utils.js (isDebug, fetchNUI, onNUIMessage, showElement, hideElement)
 */

/* WORD_POOL - Array of hacking/cyber-themed words used in the game */
const WORD_POOL = [
  "ACCESS",
  "ADMIN",
  "AGENT",
  "ALERT",
  "ALPHA",
  "ANOMALY",
  "ARCHIVE",
  "ASSETS",
  "ATTACK",
  "AUDIT",
  "BACKDOOR",
  "BACKUP",
  "BANDWIDTH",
  "BARRIER",
  "BEACON",
  "BINARY",
  "BIOMETRIC",
  "BLOCKADE",
  "BOTNET",
  "BREACH",
  "BRIDGE",
  "BUFFER",
  "BYPASS",
  "CACHE",
  "CALLBACK",
  "CELLULAR",
  "CHANNEL",
  "CIPHER",
  "CIRCUIT",
  "CLIENT",
  "CLUSTER",
  "CODEC",
  "COMMAND",
  "COMPILE",
  "COMPROMISE",
  "CONSOLE",
  "CONTAINER",
  "CORE",
  "CORRUPT",
  "COUNTER",
  "CRACK",
  "CREDENTIAL",
  "CRITICAL",
  "CRONJOB",
  "CRYPTO",
  "CYBER",
  "DAEMON",
  "DATABASE",
  "DATALINK",
  "DECODE",
  "DECRYPT",
  "DEFENSE",
  "DELETE",
  "DEPLOY",
  "DETECT",
  "DEVICE",
  "DIGITAL",
  "DIRECTORY",
  "DISABLE",
  "DISK",
  "DOMAIN",
  "DOWNLOAD",
  "DRIVER",
  "DRONE",
  "ECHO",
  "EMAIL",
  "EMBED",
  "ENCODE",
  "ENCRYPT",
  "ENDPOINT",
  "ENGINE",
  "ENTRY",
  "ERASE",
  "ERROR",
  "ESCORT",
  "EVENT",
  "EXPLOIT",
  "EXTRACT",
  "FAILURE",
  "FEED",
  "FIBER",
  "FILE",
  "FILTER",
  "FIREWALL",
  "FIRMWARE",
  "FLAG",
  "FLASHDRIVE",
  "FLUX",
  "FORENSIC",
  "FRAGMENT",
  "FRAME",
  "FREQUENCY",
  "FUSION",
  "GATEWAY",
  "GENERATE",
  "GHOST",
  "GLITCH",
  "GRID",
  "HACK",
  "HANDLER",
  "HARDDRIVE",
  "HASH",
  "HEADER",
  "HEX",
  "HIDDEN",
  "HIJACK",
  "HOST",
  "IDENTITY",
  "IMPLANT",
  "INDEX",
  "INFECT",
  "INFILTRATE",
  "INJECT",
  "INPUT",
  "INTERFACE",
  "INTRUSION",
  "INVALID",
  "ISOLATE",
  "KERNEL",
  "KEY",
  "KEYLOGGER",
  "KILLSWITCH",
  "LAG",
  "LASER",
  "LATENCY",
  "LAYER",
  "LEAK",
  "LEGACY",
  "LIBRARY",
  "LINK",
  "LISTENER",
  "LOAD",
  "LOCK",
  "LOGFILE",
  "LOGIC",
  "LOOP",
  "MALWARE",
  "MASK",
  "MATRIX",
  "MEMORY",
  "MESSAGE",
  "METADATA",
  "MIMIC",
  "MIRROR",
  "MOBILE",
  "MODULE",
  "MONITOR",
  "NANO",
  "NETWORK",
  "NEURAL",
  "NODE",
  "NOISE",
  "NULL",
  "OFFLINE",
  "ONLINE",
  "OPENPORT",
  "OPERATOR",
  "OUTPUT",
  "OVERLOAD",
  "OVERRIDE",
  "PACKET",
  "PARADOX",
  "PARAM",
  "PARTITION",
  "PASSWORD",
  "PATCH",
  "PAYLOAD",
  "PERIMETER",
  "PHANTOM",
  "PHASE",
  "PHISHING",
  "PING",
  "PIPELINE",
  "PIXEL",
  "PLATFORM",
  "POINTER",
  "POLICY",
  "PORTAL",
  "POWER",
  "PRIME",
  "PROBE",
  "PROCESS",
  "PROFILE",
  "PROTOCOL",
  "PROXY",
  "PULSE",
  "PURGE",
  "QUANTUM",
  "QUERY",
  "QUEUE",
  "RADAR",
  "RAM",
  "RANDOM",
  "REACTOR",
  "READ",
  "REBOOT",
  "RECEIVER",
  "RECOVERY",
  "REDIRECT",
  "REDUNDANCY",
  "REGISTER",
  "RELAY",
  "REMOTE",
  "REPLICATE",
  "REQUEST",
  "RESOLVER",
  "RESPONSE",
  "REVERSE",
  "RISK",
  "ROOT",
  "ROUTER",
  "ROUTINE",
  "RUNTIME",
  "SANDBOX",
  "SATELLITE",
  "SCAN",
  "SCRIPT",
  "SECTOR",
  "SECURE",
  "SECURITY",
  "SEGMENT",
  "SEQUENCE",
  "SERVER",
  "SESSION",
  "SHADOW",
  "SHELL",
  "SHIELD",
  "SIGNAL",
  "SILENT",
  "SIMULATE",
  "SLAVE",
  "SNIFFER",
  "SOCKET",
  "SOFTWARE",
  "SOURCE",
  "SPAM",
  "SPECTRUM",
  "SPOOF",
  "STACK",
  "STEALTH",
  "STREAM",
  "SUBMIT",
  "SUBROUTINE",
  "SWITCH",
  "SYNC",
  "SYNTAX",
  "SYSTEM",
  "TABLE",
  "TAG",
  "TARGET",
  "TASK",
  "TCP",
  "TELEMETRY",
  "TEMPEST",
  "TERMINAL",
  "THREAD",
  "TICKER",
  "TIMEOUT",
  "TOKEN",
  "TOOLKIT",
  "TRACE",
  "TRACK",
  "TRAFFIC",
  "TRANSFER",
  "TRANSMIT",
  "TRAP",
  "TRIGGER",
  "TROJAN",
  "TUNNEL",
  "UDP",
  "UNLOCK",
  "UPLOAD",
  "USER",
  "VALIDATE",
  "VECTOR",
  "VERIFY",
  "VERSION",
  "VIRTUAL",
  "VIRUS",
  "VOICE",
  "VOLATILE",
  "VPN",
  "VULNERABLE",
  "WAREZ",
  "WEB",
  "WIPE",
  "WIREFRAME",
  "WORM",
  "WRITE",
  "ZERO",
  "ZONE",
  "ZIP",
];

/* TypeRacerGame - Main game controller class (word typing challenge) */
class TypeRacerGame {
  constructor() {
    this.wordPool = [...WORD_POOL];
    this.currentWord = null;
    this.typedWordCount = 0;
    this.targetWordCount = 15;
    this.wordTimeoutDuration = 8000;
    this.isActive = false;
    this.inputLocked = false;
    this.wordTimerId = null;
    this.progressBarTimerStart = null;
    this.progressBarAnimationId = null;
    this.statsUpdateTimeout = null;
    this.signalUpdateTimeout = null;

    this.appElement = document.getElementById("app");
    this.wordElement = document.getElementById("currentWord");
    this.inputElement = document.getElementById("wordInput");
    this.progressBarElement = document.getElementById("wordProgressBar");
    this.scoreProgressBarFill = document.getElementById("scoreProgressBarFill");
    this.cpuEl = document.getElementById("cpuNumber");
    this.memEl = document.getElementById("memoryNumber");
    this.debugContainer = document.getElementById("debug");
    this.debugStartButton = document.getElementById("startGame");
    this.debugTimeoutInput = document.getElementById("wordTimeout");
    this.debugTargetScoreInput = document.getElementById("targetScore");

    this.sounds = {
      win: new Howl({ src: ["sounds/win.wav"], volume: 0.1 }),
      lose: new Howl({ src: ["sounds/lose.wav"], volume: 0.05 }),
      start: new Howl({ src: ["sounds/start.wav"], volume: 0.1 }),
      correct: new Howl({ src: ["sounds/correct.mp3"], volume: 0.05 }),
    };

    this.handleInput = this.handleInput.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.updateProgressBar = this.updateProgressBar.bind(this);
    this.updateStats = this.updateStats.bind(this);
    this.updateSignal = this.updateSignal.bind(this);
    this.start = this.start.bind(this);

    if (isDebug()) {
      if (this.debugContainer) {
        this.debugContainer.classList.remove("hidden");
      }
      if (this.debugStartButton) {
        this.debugStartButton.addEventListener("click", () => {
          const timeoutValue = parseInt(
            this.debugTimeoutInput ? this.debugTimeoutInput.value : "8",
            10,
          ) || 8;
          const targetScoreValue = parseInt(
            this.debugTargetScoreInput ? this.debugTargetScoreInput.value : "15",
            10,
          ) || 15;
          this.start({ targetWordCount: targetScoreValue, wordTimeout: timeoutValue });
        });
      }
    }

    if (this.inputElement) {
      this.inputElement.addEventListener("input", this.handleInput);
      this.inputElement.addEventListener("keydown", this.handleKeyDown);
    }
  }

  /* updateStats - Periodically updates the fake CPU usage display */
  updateStats() {
    if (!this.isActive) return;

    if (this.cpuEl) {
      this.cpuEl.textContent = Math.floor(Math.random() * 31) + 65;
    }
    if (this.memEl) {
      this.memEl.textContent = Math.floor(Math.random() * 31) + 60;
    }

    const nextDelay = 1000 + Math.random() * 1500;
    if (this.isActive) {
      this.statsUpdateTimeout = setTimeout(this.updateStats, nextDelay);
    }
  }

  /* updateSignal - Periodically updates the fake signal strength bars */
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

    signalBarElements.forEach((barElement, barIndex) => {
      barElement.className = "h-3 w-1";
      if (barIndex < activeBars) {
        if (activeBars === 1) {
          barElement.classList.add("bg-red-600");
        } else if (activeBars === 2) {
          barElement.classList.add("bg-yellow-400");
        } else {
          barElement.classList.add("bg-main-400");
        }
      } else {
        barElement.classList.add("bg-main-900");
      }
    });

    const nextDelay = 150 + Math.random() * 350;
    if (this.isActive) {
      this.signalUpdateTimeout = setTimeout(this.updateSignal, nextDelay);
    }
  }

  /* cleanup - Resets all game state, clears timers, and hides overlays */
  cleanup() {
    this.isActive = false;

    if (this.wordTimerId) {
      clearTimeout(this.wordTimerId);
    }
    if (this.progressBarAnimationId) {
      cancelAnimationFrame(this.progressBarAnimationId);
    }
    if (this.statsUpdateTimeout) {
      clearTimeout(this.statsUpdateTimeout);
    }
    if (this.signalUpdateTimeout) {
      clearTimeout(this.signalUpdateTimeout);
    }

    this.wordTimerId = null;
    this.progressBarAnimationId = null;
    this.statsUpdateTimeout = null;
    this.signalUpdateTimeout = null;
    this.progressBarTimerStart = null;
    this.currentWord = null;
    this.typedWordCount = 0;
    this.inputLocked = false;

    if (this.wordElement) {
      this.wordElement.textContent = "---";
    }
    if (this.inputElement) {
      this.inputElement.value = "";
      this.inputElement.disabled = true;
      this.inputElement.classList.remove("input-correct", "input-incorrect");
    }
    if (this.progressBarElement) {
      this.progressBarElement.style.transition = "none";
      this.progressBarElement.style.width = "100%";
    }
    if (this.scoreProgressBarFill) {
      this.scoreProgressBarFill.style.width = "0%";
    }
    if (this.cpuEl) {
      this.cpuEl.textContent = "--";
    }
    if (this.memEl) {
      this.memEl.textContent = "--";
    }

    const signalBarElements = document.querySelectorAll("#signalBars div");
    if (signalBarElements) {
      signalBarElements.forEach((barElement) => {
        barElement.className = "h-3 w-1 bg-main-900";
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

  /* start - Initializes and starts a new game with word count and timeout settings */
  start(config = {}) {
    this.cleanup();

    this.targetWordCount = Math.max(1, config.targetWordCount || 15);
    this.wordTimeoutDuration = Math.max(1000, (config.wordTimeout || 8) * 1000);
    this.currentWord = null;
    this.typedWordCount = 0;
    this.inputLocked = false;
    this.isActive = true;

    this.updateScoreProgress();
    this.updateStats();
    this.updateSignal();

    if (this.inputElement) {
      this.inputElement.disabled = false;
    }

    showElement("app");
    this.sounds.start.play();
    this.nextWord();

    setTimeout(() => {
      if (this.inputElement) {
        this.inputElement.focus();
      }
    }, 100);
  }

  /* nextWord - Picks a random word from the pool and displays it for the player to type */
  nextWord() {
    if (!this.isActive) return;

    if (this.typedWordCount >= this.targetWordCount) {
      this.finish(true);
      return;
    }

    this.inputLocked = true;

    let selectedWord;
    do {
      selectedWord = this.wordPool[Math.floor(Math.random() * this.wordPool.length)];
    } while (this.wordPool.length > 1 && selectedWord === this.currentWord);

    this.currentWord = selectedWord;

    if (this.wordElement) {
      this.wordElement.textContent = this.currentWord;
    }
    if (this.inputElement) {
      this.inputElement.value = "";
      this.inputElement.classList.remove("input-correct", "input-incorrect");
      this.inputElement.disabled = false;
      this.inputElement.focus();
    }

    this.startWordTimer();

    setTimeout(() => {
      this.inputLocked = false;
    }, 50);
  }

  /* startWordTimer - Starts the per-word countdown timer and progress bar */
  startWordTimer() {
    if (this.wordTimerId) {
      clearTimeout(this.wordTimerId);
    }
    if (this.progressBarAnimationId) {
      cancelAnimationFrame(this.progressBarAnimationId);
    }

    if (this.progressBarElement) {
      this.progressBarElement.style.transition = "none";
      this.progressBarElement.style.width = "100%";
    }

    this.progressBarTimerStart = Date.now();
    this.progressBarAnimationId = requestAnimationFrame(this.updateProgressBar);

    this.wordTimerId = setTimeout(() => {
      if (!this.isActive) return;

      if (this.progressBarAnimationId) {
        cancelAnimationFrame(this.progressBarAnimationId);
      }
      this.progressBarAnimationId = null;
      this.progressBarTimerStart = null;

      if (this.progressBarElement) {
        this.progressBarElement.style.transition = "none";
        this.progressBarElement.style.width = "0%";
      }

      this.inputLocked = true;
      this.flashInputState(false);
      this.finish(false);
    }, this.wordTimeoutDuration);
  }

  /* updateProgressBar - Animation frame callback for smooth word timeout progress bar */
  updateProgressBar() {
    if (!this.isActive || this.progressBarTimerStart === null) {
      if (this.progressBarAnimationId) {
        cancelAnimationFrame(this.progressBarAnimationId);
      }
      this.progressBarAnimationId = null;
      return;
    }

    const elapsed = Date.now() - this.progressBarTimerStart;
    const remainingPercent = Math.max(0, 100 - (elapsed / this.wordTimeoutDuration) * 100);

    if (this.progressBarElement) {
      this.progressBarElement.style.width = `${remainingPercent}%`;
    }

    if (remainingPercent > 0) {
      this.progressBarAnimationId = requestAnimationFrame(this.updateProgressBar);
    } else {
      this.progressBarAnimationId = null;
      this.progressBarTimerStart = null;
      if (this.progressBarElement) {
        this.progressBarElement.style.width = "0%";
      }
    }
  }

  /* handleInput - Input event handler: provides visual feedback if typed text matches so far */
  handleInput() {
    if (!this.isActive || this.inputLocked || !this.inputElement || !this.currentWord) {
      return;
    }

    const typedText = this.inputElement.value.toUpperCase();
    if (this.currentWord.startsWith(typedText)) {
      this.inputElement.classList.remove("input-incorrect");
    } else {
      this.inputElement.classList.add("input-incorrect");
    }
  }

  /* handleKeyDown - Keydown handler: submits answer when Enter is pressed */
  handleKeyDown(event) {
    if (!this.isActive || this.inputLocked || !this.inputElement || !this.currentWord) {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      this.checkAnswer();
    }
  }

  /* checkAnswer - Validates the typed word against the current target word */
  checkAnswer() {
    if (!this.isActive || this.inputLocked || !this.inputElement || !this.currentWord) {
      return;
    }

    this.inputLocked = true;

    if (this.wordTimerId) {
      clearTimeout(this.wordTimerId);
    }
    if (this.progressBarAnimationId) {
      cancelAnimationFrame(this.progressBarAnimationId);
    }
    this.wordTimerId = null;
    this.progressBarAnimationId = null;
    this.progressBarTimerStart = null;

    if (this.progressBarElement) {
      this.progressBarElement.style.transition = "none";
      const currentWidth = this.progressBarElement.style.width;
      this.progressBarElement.style.width = currentWidth;
    }

    if (this.inputElement.value.toUpperCase() === this.currentWord) {
      this.typedWordCount++;
      this.updateScoreProgress();
      this.sounds.correct.play();
      this.flashInputState(true);
      setTimeout(() => {
        if (this.isActive) {
          this.nextWord();
        }
      }, 300);
    } else {
      this.flashInputState(false);
      this.finish(false);
    }
  }

  /* flashInputState - Briefly flashes the input field green (correct) or red (incorrect) */
  flashInputState(isCorrect) {
    if (!this.inputElement) return;

    const cssClass = isCorrect ? "input-correct" : "input-incorrect";
    this.inputElement.classList.add(cssClass);
    setTimeout(() => {
      if (this.inputElement) {
        this.inputElement.classList.remove(cssClass);
      }
    }, 400);
  }

  /* updateScoreProgress - Updates the overall word completion progress bar */
  updateScoreProgress() {
    if (!this.scoreProgressBarFill || this.targetWordCount <= 0) return;

    const progressPercent = Math.min(100, (this.typedWordCount / this.targetWordCount) * 100);
    this.scoreProgressBarFill.style.width = `${progressPercent}%`;
  }

  /* finish - Shows win/loss overlay, plays sound, and sends result to FiveM */
  finish(isWin) {
    if (!this.isActive) return;

    this.isActive = false;
    this.inputLocked = true;

    if (this.wordTimerId) {
      clearTimeout(this.wordTimerId);
    }
    if (this.progressBarAnimationId) {
      cancelAnimationFrame(this.progressBarAnimationId);
    }
    if (this.statsUpdateTimeout) {
      clearTimeout(this.statsUpdateTimeout);
    }
    if (this.signalUpdateTimeout) {
      clearTimeout(this.signalUpdateTimeout);
    }

    this.wordTimerId = null;
    this.progressBarAnimationId = null;
    this.statsUpdateTimeout = null;
    this.signalUpdateTimeout = null;

    if (this.inputElement) {
      this.inputElement.disabled = true;
    }

    if (isWin) {
      this.sounds.win.play();
      showElement("winOverlay");
    } else {
      this.sounds.lose.play();
      showElement("lossOverlay");
    }

    setTimeout(() => {
      hideElement("app", () => {
        fetchNUI("gameFinished", { result: isWin });
      });
      setTimeout(() => this.cleanup(), 500);
    }, 3000);
  }
}

/* ========================================================================
 * Initialization
 * Sets up the game instance and registers NUI event listeners.
 * In debug mode, wires up the debug panel controls instead.
 * ======================================================================== */
document.addEventListener("DOMContentLoaded", function () {
  const game = new TypeRacerGame();

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

  const removeStartListener = onNUIMessage("start", (data) => {
    const config = {
      targetWordCount: data.targetScore ? parseInt(data.targetScore, 10) : 15,
      wordTimeout: data.wordTimeout ? parseInt(data.wordTimeout, 10) : 8,
    };
    game.start(config);
  });

  window.addEventListener("unload", () => {
    removeStartListener();
    if (escapeListenerActive) {
      window.removeEventListener("keydown", handleEscapeKey);
    }
    game.cleanup();
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
        element.innerHTML = texts.GAME_TITLE;
      });
      Array.from(document.getElementsByClassName("terminalTitleText")).forEach((element) => {
        element.innerHTML = texts.TERMINAL_TITLE;
      });
      Array.from(document.getElementsByClassName("accessGrantedText")).forEach((element) => {
        element.innerHTML = texts.END_SCREEN_ACCESS_GRANTED;
      });
      Array.from(document.getElementsByClassName("accessDeniedText")).forEach((element) => {
        element.innerHTML = texts.END_SCREEN_ACCESS_DENIED;
      });
      document.getElementById("sessionText").innerHTML = texts.END_SCREEN_SESSION;
      document.getElementById("errorText").innerHTML = texts.END_SCREEN_ERROR;
      document.getElementById("authFailedText").innerHTML = texts.END_SCREEN_AUTHENTICATION_FAILED;
      document.getElementById("awaitingInputText").innerHTML = texts.GAME_AWAITING_INPUT;
      document.getElementById("wordInput").placeholder = texts.GAME_INPUT_PLACEHOLDER;
    }
  });
});
