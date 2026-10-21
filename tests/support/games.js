const { expect } = require('@playwright/test');

// Sub-pixel rounding tolerance for layout comparisons.
const EPSILON = 0.5;

// The six NUI games show their game window in #app and are started from the #debug panel.
// The four standalone games start a round on load and draw it inside .minigame.
const GAMES = {
    data_miner_game: { kind: 'nui', ready: '#gridContainer .tile' },
    grid_memory_game: { kind: 'nui', ready: '#gridContainer .grid-tile', startButton: '#startButton' },
    letter_sequence_game: { kind: 'nui', ready: '#letter-container .letter' },
    pair_matching_game: { kind: 'nui', ready: '#card-container .card' },
    typeracer_game: { kind: 'nui', ready: '#wordInput' },
    word_memory_game: { kind: 'nui', ready: '#seenButton' },
    thermite_game: { kind: 'standalone', ready: '.groups:not(.hidden) .group' },
    hopscotch_game: { kind: 'standalone', ready: '.groups:not(.hidden) .group' },
    untangle_game: { kind: 'standalone', ready: '#game-canvas:not(.hidden)' },
    hacking_device_game: { kind: 'standalone', ready: '.hack:not(.hidden) .codes > div' },
};

const NUI_GAMES = Object.keys(GAMES).filter((name) => GAMES[name].kind === 'nui');
const STANDALONE_GAMES = Object.keys(GAMES).filter((name) => GAMES[name].kind === 'standalone');

function boardSelector(name) {
    return GAMES[name].kind === 'nui' ? '#app' : '.minigame';
}

/** Opens a game through the menu, exactly like a player does, and returns its iframe. */
async function openGame(page, name) {
    await page.goto('/#' + name);
    const iframe = page.locator('.game-iframe');
    await expect(iframe).toBeVisible();
    const frame = await (await iframe.elementHandle()).contentFrame();
    await frame.waitForLoadState('load');
    return frame;
}

/**
 * Starts a round and waits until the playing field is on screen.
 * `settings` maps NUI debug-panel input ids to values applied before starting.
 */
async function startRound(frame, name, settings = {}) {
    const game = GAMES[name];
    if (game.kind === 'nui') {
        if (game.startButton) {
            await frame.locator(game.startButton).click();
            await expect(frame.locator(game.ready).first()).toBeVisible();
        }
        for (const [id, value] of Object.entries(settings)) {
            await frame.locator('#' + id).fill(String(value));
        }
        if (!game.startButton || Object.keys(settings).length > 0) {
            await frame.locator('#startGame').click();
        }
    }
    await expect(frame.locator(game.ready).first()).toBeVisible({ timeout: 10000 });
}

/** Viewport size of the game document and whether the player can scroll it vertically. */
function viewportOf(frame) {
    return frame.evaluate(() => {
        const htmlOverflow = getComputedStyle(document.documentElement).overflowY;
        const bodyOverflow = getComputedStyle(document.body).overflowY;
        const viewportOverflow = htmlOverflow === 'visible' ? bodyOverflow : htmlOverflow;
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            scrollWidth: document.documentElement.scrollWidth,
            scrollsVertically: !['hidden', 'clip'].includes(viewportOverflow),
        };
    });
}

/**
 * Union of the rectangles of an element and all of its rendered descendants, at scroll
 * position 0. Descendants count because tiles can spill out of a clipped container.
 */
function boundsOf(frame, selector) {
    return frame.evaluate((sel) => {
        window.scrollTo(0, 0);
        const root = document.querySelector(sel);
        const rects = [root, ...root.querySelectorAll('*')]
            .map((el) => el.getBoundingClientRect())
            .filter((r) => r.width > 0 && r.height > 0);
        return {
            left: Math.min(...rects.map((r) => r.left)),
            top: Math.min(...rects.map((r) => r.top)),
            right: Math.max(...rects.map((r) => r.right)),
            bottom: Math.max(...rects.map((r) => r.bottom)),
        };
    }, selector);
}

/** Rectangle of a single element inside the game document. */
function rectOf(frame, selector) {
    return frame.evaluate((sel) => {
        const r = document.querySelector(sel).getBoundingClientRect();
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    }, selector);
}

/** Rectangle of what an element actually paints: its text for a full-width heading, its box otherwise. */
function inkRectOf(frame, selector) {
    return frame.evaluate((sel) => {
        const range = document.createRange();
        range.selectNodeContents(document.querySelector(sel));
        const r = range.getBoundingClientRect();
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    }, selector);
}

function intersects(a, b) {
    return a.left < b.right - EPSILON && b.left < a.right - EPSILON
        && a.top < b.bottom - EPSILON && b.top < a.bottom - EPSILON;
}

module.exports = {
    EPSILON,
    GAMES,
    NUI_GAMES,
    STANDALONE_GAMES,
    boardSelector,
    openGame,
    startRound,
    viewportOf,
    boundsOf,
    rectOf,
    inkRectOf,
    intersects,
};
