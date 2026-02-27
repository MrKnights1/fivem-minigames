/**
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
 *
 * Dependencies (loaded before this file):
 *   - howler.js (provides global Howl / Howler)
 *   - nui-utils.js (provides isDebug, fetchNUI, onNUIMessage, showElement, hideElement)
 */

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
  "DISCORD",
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

/**
 * WordMemoryGame - Main game controller class (word recall/recognition).
 *
 * Words are displayed one at a time. The player must decide if each word
 * has already been shown ("SEEN") or is appearing for the first time ("NEW").
 */
class WordMemoryGame {
  constructor() {
    this.wordPool = [...WORD_POOL];
    this.gameWordPool = [];
    this.seenWords = new Set();
    this.currentWord = null;
    this.correctCount = 0;
    this.targetScore = 25;
    this.wordTimeoutDuration = 5000;
    this.isActive = false;
    this.buttonsLocked = false;
    this.wordTimerId = null;
    this.progressBarTimerStart = null;
    this.progressBarAnimationId = null;
    this.statsUpdateTimeout = null;
    this.signalUpdateTimeout = null;

    this.appElement = document.getElementById("app");
    this.wordElement = document.getElementById("currentWord");
    this.progressBarElement = document.getElementById("wordProgressBar");
    this.scoreProgressBarFill = document.getElementById("scoreProgressBarFill");
    this.seenButton = document.getElementById("seenButton");
    this.newButton = document.getElementById("newButton");
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
      correct: new Howl({ src: ["sounds/pairMatch.mp3"], volume: 0.05 }),
    };

    this.handleSeenClick = this.handleSeenClick.bind(this);
    this.handleNewClick = this.handleNewClick.bind(this);
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
          const rawTimeout = this.debugTimeoutInput
            ? this.debugTimeoutInput.value
            : undefined;
          const rawTargetScore = this.debugTargetScoreInput
            ? this.debugTargetScoreInput.value
            : undefined;
          const wordTimeout = parseInt(rawTimeout, 10) || 5;
          const targetScoreValue = parseInt(rawTargetScore, 10) || 25;
          this.start({ targetScore: targetScoreValue, wordTimeout: wordTimeout });
        });
      }
    }

    if (this.seenButton) {
      this.seenButton.addEventListener("click", this.handleSeenClick);
    }
    if (this.newButton) {
      this.newButton.addEventListener("click", this.handleNewClick);
    }
  }

  /** Periodically updates the fake CPU and memory usage display. */
  updateStats() {
    if (!this.isActive) {
      return;
    }

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

  /** Periodically updates the fake signal strength bars. */
  updateSignal() {
    if (!this.isActive) {
      return;
    }

    const signalBarElements = document.querySelectorAll("#signalBars div");
    if (!signalBarElements || signalBarElements.length === 0) {
      return;
    }

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

    signalBarElements.forEach(function (bar, index) {
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

  /** Resets all game state, clears timers, and hides overlays. */
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
    this.gameWordPool = [];
    this.seenWords.clear();
    this.currentWord = null;
    this.correctCount = 0;
    this.buttonsLocked = false;

    if (this.wordElement) {
      this.wordElement.textContent = "";
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
      signalBarElements.forEach(function (bar) {
        bar.className = "h-3 w-1 bg-main-900";
      });
    }

    ["winOverlay", "lossOverlay"].forEach(function (overlayId) {
      const overlay = document.getElementById(overlayId);
      if (overlay) {
        overlay.classList.add("hidden", "opacity-0");
        overlay.classList.remove("opacity-100");
      }
    });

    Object.values(this.sounds).forEach(function (sound) {
      sound.stop();
    });
  }

  /**
   * Initializes the game: builds a word pool subset, resets score, and shows UI.
   * @param {object} config - Game configuration
   * @param {number} [config.targetScore=25] - Number of correct answers needed to win
   * @param {number} [config.wordTimeout=5] - Time limit per word in seconds
   */
  start(config = {}) {
    this.cleanup();

    this.targetScore = Math.max(1, config.targetScore || 25);
    this.wordTimeoutDuration = Math.max(1000, (config.wordTimeout || 5) * 1000);

    const poolSize = Math.max(2, Math.ceil(this.targetScore / 2));
    const shuffledWords = [...this.wordPool].sort(function () {
      return Math.random() - 0.5;
    });

    this.gameWordPool = [...new Set(shuffledWords)].slice(0, poolSize);

    if (this.gameWordPool.length < 2) {
      console.error(
        "[Game] Error: Not enough unique words for pool size " +
          poolSize +
          ". Need at least 2."
      );
      return;
    }

    this.seenWords.clear();
    this.currentWord = null;
    this.correctCount = 0;
    this.buttonsLocked = false;
    this.isActive = true;

    this.updateScoreProgress();
    this.updateStats();
    this.updateSignal();
    showElement("app");
    this.sounds.start.play();
    this.nextWord();
  }

  /** Picks a random word from the game pool and displays it. */
  nextWord() {
    if (!this.isActive) {
      return;
    }

    if (this.correctCount >= this.targetScore) {
      this.finish(true);
      return;
    }

    this.buttonsLocked = true;

    if (this.currentWord !== null) {
      this.seenWords.add(this.currentWord);
    }

    this.currentWord =
      this.gameWordPool[Math.floor(Math.random() * this.gameWordPool.length)];

    if (this.wordElement) {
      this.wordElement.textContent = this.currentWord;
    }

    this.startWordTimer();

    setTimeout(() => {
      this.buttonsLocked = false;
    }, 100);
  }

  /** Starts the per-word countdown timer and progress bar animation. */
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
      this.progressBarElement.offsetWidth;
    }

    this.progressBarTimerStart = Date.now();
    this.progressBarAnimationId = requestAnimationFrame(this.updateProgressBar);

    this.wordTimerId = setTimeout(() => {
      if (this.isActive) {
        this.handleAnswer(null, true);
      }
    }, this.wordTimeoutDuration);
  }

  /** Animation frame callback for smooth word timeout progress bar. */
  updateProgressBar() {
    if (!this.isActive || this.progressBarTimerStart === null) {
      return;
    }

    const elapsed = Date.now() - this.progressBarTimerStart;
    const remainingPercent = Math.max(
      0,
      100 - (elapsed / this.wordTimeoutDuration) * 100
    );

    if (this.progressBarElement) {
      this.progressBarElement.style.width = remainingPercent + "%";
    }

    if (remainingPercent > 0) {
      this.progressBarAnimationId = requestAnimationFrame(
        this.updateProgressBar
      );
    } else {
      if (this.progressBarElement) {
        this.progressBarElement.style.width = "0%";
      }
      this.progressBarAnimationId = null;
      this.progressBarTimerStart = null;
    }
  }

  /** "SEEN" button handler: player claims this word was shown before. */
  handleSeenClick() {
    this.handleAnswer(true);
  }

  /** "NEW" button handler: player claims this word is new (first appearance). */
  handleNewClick() {
    this.handleAnswer(false);
  }

  /**
   * Evaluates the player answer: checks if word was actually seen before or is new.
   * @param {boolean|null} claimedSeen - true if player clicked SEEN, false if NEW, null on timeout
   * @param {boolean} [isTimeout=false] - true if the answer came from a timeout
   */
  handleAnswer(claimedSeen, isTimeout = false) {
    if (!this.isActive || this.buttonsLocked) {
      return;
    }

    this.buttonsLocked = true;

    if (this.wordTimerId) {
      clearTimeout(this.wordTimerId);
    }
    if (this.progressBarAnimationId) {
      cancelAnimationFrame(this.progressBarAnimationId);
    }
    this.wordTimerId = null;
    this.progressBarAnimationId = null;
    this.progressBarTimerStart = null;

    let isCorrect;
    if (isTimeout) {
      isCorrect = false;
    } else {
      const wordWasSeen = this.seenWords.has(this.currentWord);
      isCorrect = claimedSeen === wordWasSeen;
    }

    if (isCorrect) {
      this.correctCount++;
      this.updateScoreProgress();
      this.sounds.correct.play();

      if (this.wordElement) {
        this.wordElement.classList.add("correct-flash");
      }

      const flashDuration = 300;
      setTimeout(() => {
        if (this.wordElement) {
          this.wordElement.classList.remove("correct-flash");
        }
      }, flashDuration);

      setTimeout(() => {
        if (this.isActive) {
          this.nextWord();
        }
      }, flashDuration + 50);
    } else {
      this.finish(false);
    }
  }

  /** Updates the overall score progress bar width. */
  updateScoreProgress() {
    if (!this.scoreProgressBarFill || this.targetScore <= 0) {
      return;
    }
    const progressPercent = Math.min(
      100,
      (this.correctCount / this.targetScore) * 100
    );
    this.scoreProgressBarFill.style.width = progressPercent + "%";
  }

  /**
   * Shows win/loss overlay, plays sound, and sends result to FiveM.
   * @param {boolean} isWin - true if the player won, false if they lost
   */
  finish(isWin) {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    this.buttonsLocked = true;

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

    if (isWin) {
      this.sounds.win.play();
      showElement("winOverlay");
    } else {
      this.sounds.lose.play();
      showElement("lossOverlay");
    }

    setTimeout(function () {
      hideElement("app", function () {
        fetchNUI("gameFinished", { result: isWin });
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
  const game = new WordMemoryGame();

  if (isDebug()) {
    return;
  }

  const handleEscapeKey = function (event) {
    if (event.key !== "Escape") {
      return;
    }
    if (!game.isActive) {
      return;
    }
    const appElement = document.getElementById("app");
    if (appElement && appElement.classList.contains("opacity-100")) {
      game.finish(false);
    }
  };

  let escapeListenerActive = false;

  const unsubscribeStart = onNUIMessage("start", function (data) {
    const parsedConfig = {
      targetScore: data.targetScore ? parseInt(data.targetScore, 10) : 25,
      wordTimeout: data.wordTimeout ? parseInt(data.wordTimeout, 10) : 5,
    };
    game.start(parsedConfig);
  });

  window.addEventListener("unload", function () {
    unsubscribeStart();
    if (escapeListenerActive) {
      window.removeEventListener("keydown", handleEscapeKey);
    }
  });

  fetchNUI("nuiLoaded", {}).then(function (response) {
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
        function (element) {
          element.innerHTML = texts.GAME_TITLE;
        }
      );
      Array.from(document.getElementsByClassName("terminalTitleText")).forEach(
        function (element) {
          element.innerHTML = texts.TERMINAL_TITLE;
        }
      );
      Array.from(document.getElementsByClassName("accessGrantedText")).forEach(
        function (element) {
          element.innerHTML = texts.END_SCREEN_ACCESS_GRANTED;
        }
      );
      Array.from(document.getElementsByClassName("accessDeniedText")).forEach(
        function (element) {
          element.innerHTML = texts.END_SCREEN_ACCESS_DENIED;
        }
      );
      document.getElementById("newButtonText").innerHTML =
        texts.GAME_NEW_BUTTON;
      document.getElementById("seenButton").innerHTML = texts.GAME_SEEN_BUTTON;
      document.getElementById("gameStatusText").innerHTML = texts.GAME_STATUS;
    }
  });
});
