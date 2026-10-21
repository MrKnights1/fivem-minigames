const { defineConfig } = require('@playwright/test');

const PORT = 8765;

const phone = (width, height) => ({
    viewport: { width, height },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
});

module.exports = defineConfig({
    testDir: './tests',
    fullyParallel: true,
    // A few browsers at a time; many more can exhaust memory on a WSL dev machine.
    workers: 4,
    forbidOnly: !!process.env.CI,
    reporter: 'list',
    use: {
        baseURL: `http://127.0.0.1:${PORT}`,
        browserName: 'chromium',
    },
    projects: [
        { name: 'phone-small', use: phone(360, 640) },
        { name: 'phone', use: phone(390, 844) },
        { name: 'phone-landscape', use: phone(844, 390) },
        { name: 'tablet', use: { ...phone(768, 1024), deviceScaleFactor: 2 } },
        { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    ],
    webServer: {
        command: `python3 -m http.server ${PORT} --bind 127.0.0.1`,
        url: `http://127.0.0.1:${PORT}/index.html`,
        reuseExistingServer: !process.env.CI,
    },
});
