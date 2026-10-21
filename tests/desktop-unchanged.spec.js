const { test, expect } = require('@playwright/test');
const { openGame, startRound } = require('./support/games');

// Sizes every game had before the mobile work. A full-size desktop window must keep them.
const DESKTOP_SIZES = {
    thermite_game: { '.minigame': [540, 540], '.group': [77, 77], '.streaks': [null, null, 30] },
    hopscotch_game: { '.minigame': [540, 540], '.group': [77, 77], '.title': [null, null, 32] },
    untangle_game: { '.minigame': [540, 540], '#game-canvas': [500, 500] },
    hacking_device_game: { '.minigame': [540, null], '.codes': [400, null], '.codes > div': [null, null, 18] },
    data_miner_game: { '#gridContainer .tile': [48, 48] },
    grid_memory_game: { '#gridContainer .grid-tile': [64, 64] },
    letter_sequence_game: { '#app': [720, null], '.letter': [64, 64] },
    pair_matching_game: { '#app': [480, null], '#card-container .card': [96, 96] },
};

test.skip(({ viewport }) => viewport.width < 1280, 'desktop layout only');

for (const [name, expected] of Object.entries(DESKTOP_SIZES)) {
    test(`${name} keeps its desktop size`, async ({ page }) => {
        const frame = await openGame(page, name);
        await startRound(frame, name);

        const measured = await frame.evaluate((spec) => {
            const result = {};
            for (const [selector, [width, height, fontSize]] of Object.entries(spec)) {
                const el = document.querySelector(selector);
                result[selector] = [
                    width === null ? null : Math.round(el.offsetWidth),
                    height === null ? null : Math.round(el.offsetHeight),
                ];
                if (fontSize !== undefined) result[selector].push(parseFloat(getComputedStyle(el).fontSize));
            }
            return result;
        }, expected);

        expect(measured).toEqual(expected);
    });
}
