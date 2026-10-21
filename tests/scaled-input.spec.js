const { test, expect } = require('@playwright/test');
const { openGame, startRound } = require('./support/games');

// Untangle draws on a fixed 500x500 canvas bitmap; the canvas element itself is scaled to the screen.
const CANVAS_SIZE = 500;

test('untangle_game moves the dragged dot to where the pointer goes', async ({ page }) => {
    const frame = await openGame(page, 'untangle_game');
    await startRound(frame, 'untangle_game');
    const canvas = frame.locator('#game-canvas');
    await canvas.scrollIntoViewIfNeeded();
    const box = await canvas.boundingBox();
    const cssPerUnit = box.width / CANVAS_SIZE;
    const dot = await frame.evaluate(() => ({ x: dots[0].x, y: dots[0].y }));
    const start = { x: box.x + dot.x * cssPerUnit, y: box.y + dot.y * cssPerUnit };
    const move = { x: -40, y: 40 };

    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + move.x, start.y + move.y, { steps: 5 });
    const dragged = await frame.evaluate(() => ({ x: dots[0].x, y: dots[0].y }));
    await page.mouse.up();

    // Allow one CSS pixel of pointer rounding plus the game's rounding to whole canvas units.
    const tolerance = 1 / cssPerUnit + 0.5;
    expect(Math.abs(dragged.x - (dot.x + move.x / cssPerUnit))).toBeLessThanOrEqual(tolerance);
    expect(Math.abs(dragged.y - (dot.y + move.y / cssPerUnit))).toBeLessThanOrEqual(tolerance);
});

test.describe('touch screens', () => {
    test.skip(({ hasTouch }) => !hasTouch, 'touch devices only');

    test('thermite_game marks a tapped tile', async ({ page }) => {
        const frame = await openGame(page, 'thermite_game');
        await startRound(frame, 'thermite_game');
        await frame.waitForFunction(() => game_started === true, null, { timeout: 10000 });
        const tile = frame.locator('.group').first();

        await tile.tap();

        await expect(tile).toHaveClass(/\b(good|bad)\b/);
    });
});
