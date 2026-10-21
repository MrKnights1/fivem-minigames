const { test, expect } = require('@playwright/test');
const {
    EPSILON,
    GAMES,
    STANDALONE_GAMES,
    NUI_GAMES,
    boardSelector,
    openGame,
    startRound,
    viewportOf,
    boundsOf,
    rectOf,
    inkRectOf,
    intersects,
} = require('./support/games');

async function expectBoardWithinWidth(frame, name) {
    const view = await viewportOf(frame);
    const board = await boundsOf(frame, boardSelector(name));

    expect(view.scrollWidth, 'page scrolls sideways').toBeLessThanOrEqual(view.width);
    expect(board.left, 'board starts left of the screen').toBeGreaterThanOrEqual(-EPSILON);
    expect(board.right, 'board ends right of the screen').toBeLessThanOrEqual(view.width + EPSILON);
}

for (const name of Object.keys(GAMES)) {
    test.describe(name, () => {
        test('board fits the screen width', async ({ page }) => {
            const frame = await openGame(page, name);
            await startRound(frame, name);

            await expectBoardWithinWidth(frame, name);
        });

        test('board can be scrolled fully into view', async ({ page }) => {
            const frame = await openGame(page, name);
            await startRound(frame, name);

            const view = await viewportOf(frame);
            const board = await boundsOf(frame, boardSelector(name));

            expect(board.top, 'board top is cut off above the page').toBeGreaterThanOrEqual(-EPSILON);
            expect(
                board.bottom <= view.height + EPSILON || view.scrollsVertically,
                'board bottom is below the screen and the page cannot scroll',
            ).toBe(true);
        });

        test('board has no scrollbars of its own', async ({ page }) => {
            const frame = await openGame(page, name);
            await startRound(frame, name);

            const scrollers = await frame.evaluate((sel) => {
                const root = document.querySelector(sel);
                return [root, ...root.querySelectorAll('*')]
                    .filter((el) => {
                        const style = getComputedStyle(el);
                        const scrollsX = ['auto', 'scroll'].includes(style.overflowX) && el.scrollWidth > el.clientWidth + 1;
                        const scrollsY = ['auto', 'scroll'].includes(style.overflowY) && el.scrollHeight > el.clientHeight + 1;
                        return scrollsX || scrollsY;
                    })
                    .map((el) => el.id ? '#' + el.id : el.className);
            }, boardSelector(name));

            expect(scrollers, 'elements scrolling inside the board').toEqual([]);
        });

        test('BACK button covers no game content', async ({ page }) => {
            const frame = await openGame(page, name);
            await startRound(frame, name);

            const iframeBox = await page.locator('.game-iframe').boundingBox();
            const backBox = await page.locator('#backButton').boundingBox();
            const back = { left: backBox.x, top: backBox.y, right: backBox.x + backBox.width, bottom: backBox.y + backBox.height };
            // The page title is a full-width heading, so only its text counts as covered content.
            const content = GAMES[name].kind === 'nui'
                ? [['#app', rectOf]]
                : [['.title', inkRectOf], ['.minigame', rectOf]];
            const covered = [];
            for (const [selector, measure] of content) {
                const r = await measure(frame, selector);
                const onPage = { left: r.left + iframeBox.x, right: r.right + iframeBox.x, top: r.top + iframeBox.y, bottom: r.bottom + iframeBox.y };
                if (intersects(back, onPage)) covered.push(selector);
            }

            expect(covered, 'elements under the BACK button').toEqual([]);
        });
    });
}

for (const name of STANDALONE_GAMES) {
    test(`${name} board fits on one screen`, async ({ page }) => {
        const frame = await openGame(page, name);
        await startRound(frame, name);

        const view = await viewportOf(frame);
        const board = await rectOf(frame, '.minigame');

        expect(board.height).toBeLessThanOrEqual(view.height + EPSILON);
    });
}

for (const name of NUI_GAMES) {
    test(`${name} settings panel does not cover the game`, async ({ page }) => {
        const frame = await openGame(page, name);
        await startRound(frame, name);

        const app = await rectOf(frame, '#app');
        const panel = await rectOf(frame, '#debug');

        expect(intersects(app, panel)).toBe(false);
    });
}

// Grid sizes 5, 6, 9 and 10 fill the 540px board exactly, so scaling must not push a square onto the next row.
for (const size of [5, 6, 7, 8, 9, 10]) {
    test(`thermite_game ${size}x${size} grid keeps ${size} squares per row`, async ({ page }) => {
        const frame = await openGame(page, 'thermite_game');
        await startRound(frame, 'thermite_game');
        await frame.evaluate((value) => {
            const slider = document.querySelector('#grid');
            slider.value = String(value);
            slider.dispatchEvent(new Event('input'));
        }, size);
        await expect(frame.locator('.groups:not(.hidden) .group')).toHaveCount(size * size, { timeout: 10000 });

        const rowTops = await frame.evaluate(() => new Set(
            [...document.querySelectorAll('.group')].map((el) => Math.round(el.getBoundingClientRect().top)),
        ).size);

        expect(rowTops).toBe(size);
    });
}

test('grid_memory_game largest 5x5 grid fits the screen width', async ({ page }) => {
    const frame = await openGame(page, 'grid_memory_game');
    await startRound(frame, 'grid_memory_game', { gridSize: 5 });
    await expect(frame.locator('#gridContainer .grid-tile')).toHaveCount(25);

    await expectBoardWithinWidth(frame, 'grid_memory_game');
});

test('data_miner_game 15-column grid fits the screen width', async ({ page }) => {
    const frame = await openGame(page, 'data_miner_game');
    await startRound(frame, 'data_miner_game', { gridWidth: 15, gridHeight: 9 });
    await expect(frame.locator('#gridContainer .tile')).toHaveCount(135);

    await expectBoardWithinWidth(frame, 'data_miner_game');
});
