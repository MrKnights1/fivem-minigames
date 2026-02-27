/**
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
 *
 * Dependencies (loaded before this file):
 *   - Howler.js (Howl, Howler globals)
 *   - nui-utils.js (isDebug, fetchNUI, onNUIMessage, showElement, hideElement)
 */

class PairMatchingGame {
  constructor() {
    this.isActive = false;
    this.boardLocked = false;
    this.firstCard = null;
    this.secondCard = null;
    this.cpuElement = document.getElementById("cpuNumber");
    this.memoryElement = document.getElementById("memoryNumber");

    this.sounds = {
      win: new Howl({ src: ["sounds/win.wav"], volume: 0.1 }),
      lose: new Howl({ src: ["sounds/lose.wav"], volume: 0.05 }),
      start: new Howl({ src: ["sounds/start.wav"], volume: 0.1 }),
      pairMatch: new Howl({ src: ["sounds/pairMatch.mp3"], volume: 0.05 }),
    };

    /* SVG icon definitions for card faces - each has a name and SVG path data */
    this.cardIcons = [
      { name: "shield", path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
      {
        name: "shieldAlert",
        path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M12 14h.01 M12 8v4",
      },
      {
        name: "shieldCheck",
        path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4",
      },
      {
        name: "shieldQuestion",
        path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3 M12 17h.01",
      },
      {
        name: "lock",
        path: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
      },
      {
        name: "unlock",
        path: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 9.9-1",
      },
      {
        name: "key",
        path: "M21 2l-2 2M11.39 11.39a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78z M11.39 11.39L15.5 7.5l3 3L22 7l-3-3-3.5 3.5",
      },
      {
        name: "keyRound",
        path: "M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z",
      },
      {
        name: "fileCode",
        path: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z M14 2v6h6 M10 13l-2 2 2 2 M14 17l2-2-2-2",
      },
      {
        name: "fileCode2",
        path: "M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4 M14 2v6h6 M9 18l3-3-3-3 M5 12h9",
      },
      {
        name: "bug",
        path: "M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0 1 12 12.75Zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 0 1-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75a2.25 2.25 0 0 0 2.248-2.354M12 12.75a2.25 2.25 0 0 1-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 0 0-.399-2.25M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.734 3.734 0 0 1 .4-2.253M12 8.25a2.25 2.25 0 0 0-2.248 2.146M12 8.25a2.25 2.25 0 0 1 2.248 2.146M8.683 5a6.032 6.032 0 0 1-1.155-1.002c.07-.63.27-1.222.574-1.747m.581 2.749A3.75 3.75 0 0 1 15.318 5m0 0c.427-.283.815-.62 1.155-.999a4.471 4.471 0 0 0-.575-1.752M4.921 6a24.048 24.048 0 0 0-.392 3.314c1.668.546 3.416.914 5.223 1.082M19.08 6c.205 1.08.337 2.187.392 3.314a23.882 23.882 0 0 1-5.223 1.082",
      },
      {
        name: "window",
        path: "M3 8.25V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V8.25m-18 0V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6ZM7.5 6h.008v.008H7.5V6Zm2.25 0h.008v.008H9.75V6Z",
      },
      {
        name: "signal",
        path: "M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z",
      },
      {
        name: "signalOff",
        path: "m3 3 8.735 8.735m0 0a.374.374 0 1 1 .53.53m-.53-.53.53.53m0 0L21 21M14.652 9.348a3.75 3.75 0 0 1 0 5.304m2.121-7.425a6.75 6.75 0 0 1 0 9.546m2.121-11.667c3.808 3.807 3.808 9.98 0 13.788m-9.546-4.242a3.733 3.733 0 0 1-1.06-2.122m-1.061 4.243a6.75 6.75 0 0 1-1.625-6.929m-.496 9.05c-3.068-3.067-3.664-7.67-1.79-11.334M12 12h.008v.008H12V12Z",
      },
      {
        name: "link",
        path: "M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244",
      },
      {
        name: "unlink",
        path: "M13.181 8.68a4.503 4.503 0 0 1 1.903 6.405m-9.768-2.782L3.56 14.06a4.5 4.5 0 0 0 6.364 6.365l3.129-3.129m5.614-5.615 1.757-1.757a4.5 4.5 0 0 0-6.364-6.365l-4.5 4.5c-.258.26-.479.541-.661.84m1.903 6.405a4.495 4.495 0 0 1-1.242-.88 4.483 4.483 0 0 1-1.062-1.683m6.587 2.345 5.907 5.907m-5.907-5.907L8.898 8.898M2.991 2.99 8.898 8.9",
      },
      {
        name: "server",
        path: "M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z",
      },
      {
        name: "wifi",
        path: "M12 20h.01 M8.5 16.5a5 5 0 0 1 7 0 M5 12.5a10 10 0 0 1 14 0 M1.5 8.5a15 15 0 0 1 21 0",
      },
      {
        name: "fingerprint",
        path: "M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.666 18.666 0 0 1-2.485 5.33",
      },
      {
        name: "rss",
        path: "M12.75 19.5v-.75a7.5 7.5 0 0 0-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z",
      },
      {
        name: "terminal",
        path: "M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z M8 9l2 2-2 2 M12 15h4",
      },
      {
        name: "userX",
        path: "M2 20s1-4 6-4 6 4 6 4H2z M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M16 2l4 4 M20 2l-4 4",
      },
      {
        name: "cpu",
        path: "M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z",
      },
      {
        name: "wrench",
        path: "M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z",
      },
      {
        name: "database",
        path: "M4 6c0-1.1 3.58-2 8-2s8 .9 8 2v12c0 1.1-3.58 2-8 2s-8-.9-8-2V6z M4 10c0 1.1 3.58 2 8 2s8-.9 8-2 M4 14c0 1.1 3.58 2 8 2s8-.9 8-2",
      },
      {
        name: "lightning",
        path: "m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z",
      },
      {
        name: "qrCode",
        path: "M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z",
      },
    ];

    if (isDebug()) {
      document.getElementById("debug").classList.remove("hidden");
      document.querySelector("#startGame").addEventListener("click", () => {
        const timeoutValue = parseInt(document.querySelector("#timeout").value, 10);
        const pairAmountValue = parseInt(document.querySelector("#pairAmount").value, 10);
        this.start(pairAmountValue, timeoutValue);
      });
    }
  }

  /* Animation frame callback for the game timeout progress bar */
  updateProgressBar() {
    if (!this.isActive) return;

    const elapsed = Date.now() - this.startedAt;
    const remainingPercent = Math.max(0, 100 - (elapsed / this.startedTimeoutDiff) * 100);

    this.progressBar.style.width = `${remainingPercent}%`;

    if (remainingPercent > 0) {
      this.animationFrameId = requestAnimationFrame(() => this.updateProgressBar());
    } else {
      this.animationFrameId = null;
      this.boardLocked = true;

      if (this.pairsFound !== this.pairsRequired) {
        showElement("lossOverlay");
        this.finish(false);
      }
    }
  }

  /* Creates a single card DOM element with front (dot) and back (icon) faces */
  createCard(iconName, svgPath) {
    const cardElement = document.createElement("div");
    cardElement.className =
      "card size-24 mx-auto border rounded border-card-border bg-gray-800 hover:bg-gray-700 hover:shadow-lg shadow-main-400 relative cursor-pointer transition-all duration-300 transform transform-style-preserve-3d";

    const frontFace = document.createElement("div");
    frontFace.className =
      "absolute inset-0 backface-hidden transition-all duration-300 flex items-center justify-center";

    const dotIndicator = document.createElement("div");
    dotIndicator.className = "w-2 h-2 rounded-full bg-card-dot";
    frontFace.appendChild(dotIndicator);

    const backFace = document.createElement("div");
    backFace.className =
      "absolute inset-0 backface-hidden flex items-center justify-center rotate-y-180";

    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgElement.setAttribute("width", "32");
    svgElement.setAttribute("height", "32");
    svgElement.setAttribute("viewBox", "0 0 24 24");
    svgElement.setAttribute("fill", "none");
    svgElement.setAttribute("stroke", "currentColor");
    svgElement.setAttribute("stroke-width", "2");
    svgElement.setAttribute("stroke-linecap", "round");
    svgElement.setAttribute("stroke-linejoin", "round");
    svgElement.classList.add("text-card-icon");

    const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathElement.setAttribute("d", svgPath);

    svgElement.appendChild(pathElement);
    backFace.appendChild(svgElement);
    cardElement.appendChild(frontFace);
    cardElement.appendChild(backFace);

    cardElement.addEventListener("click", () => this.onCardClick(cardElement, iconName));

    return cardElement;
  }

  /* Generates all card elements and adds them to the grid container */
  createCards(numberOfPairs) {
    const cardContainer = document.getElementById("card-container");
    cardContainer.innerHTML = "";

    const availableIcons = this.cardIcons;
    const cardPairs = this.generateCardPairs(availableIcons, numberOfPairs);

    cardPairs.forEach((card) => {
      const cardElement = this.createCard(card.name, card.path);
      cardContainer.appendChild(cardElement);
    });
  }

  /* Resets the current turn state (clears first/second card references) */
  resetTurn() {
    if (this.firstCard) {
      this.firstCard = null;
    }
    if (this.secondCard) {
      this.secondCard = null;
    }
    this.boardLocked = false;
  }

  /* Card click handler: flips card and checks for pair match */
  onCardClick(cardElement, iconName) {
    if (
      this.boardLocked ||
      cardElement === this.firstCard ||
      cardElement.classList.contains("matched")
    ) {
      return;
    }

    cardElement.classList.add("flipped");

    if (!this.firstCard) {
      this.firstCard = cardElement;
      cardElement.dataset.icon = iconName;
      return;
    }

    this.secondCard = cardElement;
    cardElement.dataset.icon = iconName;
    this.boardLocked = true;

    if (this.firstCard.dataset.icon !== this.secondCard.dataset.icon) {
      setTimeout(() => {
        this.firstCard.classList.remove("flipped");
        this.secondCard.classList.remove("flipped");
        this.resetTurn();
      }, 400);
      return;
    }

    this.pairsFound += 1;
    this.firstCard.classList.add("matched");
    this.secondCard.classList.add("matched");
    this.sounds.pairMatch.play();
    this.resetTurn();

    if (this.pairsFound === this.pairsRequired) {
      setTimeout(() => {
        showElement("winOverlay");
        this.sounds.win.play();
      }, 800);
      this.finish(true);
    }
  }

  /* Fisher-Yates shuffle for uniform randomness */
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /* Shuffles icons and creates matched pairs array */
  generateCardPairs(availableIcons, numberOfPairs) {
    const selectedIcons = this.shuffle([...availableIcons]).slice(0, numberOfPairs);
    return this.shuffle(selectedIcons.concat(selectedIcons));
  }

  /* Sets up the game board, timer, and creates card elements */
  initialize(numberOfPairs, timeoutSeconds) {
    this.startedAt = Date.now();
    this.timeoutAt = this.startedAt + timeoutSeconds * 1000;
    this.startedTimeoutDiff = this.timeoutAt - this.startedAt;
    this.progressBar = document.getElementById("progress-fill");

    this.updateProgressBar();
    this.updateSignal();
    this.updateStats();
    this.createCards(numberOfPairs);

    this.pairsFound = 0;
    this.pairsRequired = numberOfPairs;
  }

  /* Periodically updates the fake CPU and memory usage display */
  updateStats() {
    if (!this.isActive) return;

    if (this.cpuElement) {
      this.cpuElement.textContent = Math.floor(Math.random() * 30) + 70;
    }
    if (this.memoryElement) {
      this.memoryElement.textContent = Math.floor(Math.random() * 30) + 70;
    }

    const delay = 1000 + Math.random() * 1000;
    this.statsUpdateTimeout = setTimeout(() => this.updateStats(), delay);
  }

  /* Periodically updates the fake signal strength bars */
  updateSignal() {
    const signalBars = document.querySelectorAll("#signalBars div");
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

  /* Resets all game state, clears timers, and hides overlays */
  cleanup() {
    if (this.statsUpdateTimeout) {
      clearTimeout(this.statsUpdateTimeout);
      this.statsUpdateTimeout = null;
    }

    if (this.signalUpdateTimeout) {
      clearTimeout(this.signalUpdateTimeout);
      this.signalUpdateTimeout = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    document.getElementById("progress-fill").style.width = "100%";

    const winOverlay = document.getElementById("winOverlay");
    winOverlay.classList.add("hidden");
    winOverlay.classList.add("opacity-0");
    winOverlay.classList.remove("opacity-100");

    const lossOverlay = document.getElementById("lossOverlay");
    lossOverlay.classList.add("hidden");
    lossOverlay.classList.add("opacity-0");
    lossOverlay.classList.remove("opacity-100");

    this.pairsFound = 0;
    this.boardLocked = false;

    Object.values(this.sounds).forEach((sound) => sound.stop());
  }

  /* Initializes and starts a new game with pair count and timeout */
  start(numberOfPairs, timeoutSeconds) {
    this.cleanup();
    this.isActive = true;
    this.initialize(numberOfPairs, timeoutSeconds);
    showElement("app");
    this.sounds.start.play();
  }

  /* Shows win/loss overlay and sends result to FiveM */
  finish(didWin) {
    if (!didWin) {
      this.sounds.lose.play();
    }

    this.isActive = false;

    if (this.statsUpdateTimeout) clearTimeout(this.statsUpdateTimeout);
    if (this.signalUpdateTimeout) clearTimeout(this.signalUpdateTimeout);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.statsUpdateTimeout = null;
    this.signalUpdateTimeout = null;
    this.animationFrameId = null;

    setTimeout(() => {
      hideElement("app", () => {
        fetchNUI("gameFinished", { result: didWin });
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
  const game = new PairMatchingGame();

  if (isDebug()) {
    return;
  }

  const MIN_PAIRS = 3;
  const MAX_PAIRS = 10;
  const MIN_TIMEOUT = 3;
  const MAX_TIMEOUT = 1000;

  const onEscapeKey = (event) => {
    if (event.key !== "Escape" || !game.isActive) {
      return;
    }

    const appElement = document.getElementById("app");
    if (appElement && appElement.classList.contains("opacity-100")) {
      showElement("lossOverlay");
      game.finish(false);
    }
  };

  let escapeListenerActive = false;

  const unsubscribeStartMessage = onNUIMessage("start", (data) => {
    const numberOfPairs = data.numberOfPairs
      ? Math.min(Math.max(data.numberOfPairs, MIN_PAIRS), MAX_PAIRS)
      : MIN_PAIRS;

    const timeoutSeconds = data.timeout
      ? Math.min(Math.max(data.timeout, MIN_TIMEOUT), MAX_TIMEOUT)
      : MIN_TIMEOUT;

    game.start(numberOfPairs, timeoutSeconds);
  });

  window.addEventListener("unload", () => {
    unsubscribeStartMessage();
    if (escapeListenerActive) {
      window.removeEventListener("keydown", onEscapeKey);
    }
  });

  fetchNUI("nuiLoaded", {}).then((response) => {
    if (response.theme && response.theme !== "default" && response.theme !== "green") {
      document.documentElement.setAttribute("theme", response.theme);
    }

    if (response.escapeEndsGame === true) {
      window.addEventListener("keydown", onEscapeKey);
      escapeListenerActive = true;
    }

    if (!response.texts) {
      return;
    }

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
  });
});
