const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');

const ids = ['auto', 'base-light', 'base-dark', 'ios-light', 'ios-dark'];

async function readDates(page) {
  return page.evaluate((ids) => Object.fromEntries(ids.map((id) => {
    const inputs = ['date', 'light', 'dark', 'text'].map((name) => document.querySelector(`[data-testid="${id}-${name}"]`));
    return [id, inputs.map((node, index) => ({
      type: node.type, value: node.value, scheme: getComputedStyle(node).colorScheme,
      sameNode: node === window.__dateNodes[id][index], focused: node === document.activeElement,
    }))];
  })), ids);
}

function assertDates(states, auto, scope) {
  for (const id of ids) {
    const appearance = id === 'auto' ? auto : id.endsWith('dark') ? 'dark' : 'light';
    assert.deepEqual(states[id].map((node) => node.scheme), [appearance, 'light', 'dark', 'normal'], `${scope}/${id}: date-only scheme, both explicit style overrides and unchanged text scheme`);
    assert.deepEqual(states[id].map((node) => node.type), ['date', 'date', 'date', 'text']);
    assert.equal(states[id].every((node) => node.sameNode), true, `${scope}/${id}: preserve all native inputs`);
  }
}

module.exports = async function verifyDateInput(browser, url, mode) {
  for (const source of ['telegram', 'browser']) {
    const page = await browser.newPage({ colorScheme: 'dark', viewport: { width: 320, height: 568 } });
    page.setDefaultTimeout(30000);
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (['error', 'warning'].includes(message.type())) errors.push(message.text());
    });
    await page.addInitScript((source) => {
      window.__dateThemeListeners = new Set();
      if (source === 'telegram') window.Telegram = { WebApp: {
        platform: 'ios', colorScheme: 'dark', themeParams: {},
        onEvent: (name, listener) => { if (name === 'themeChanged') window.__dateThemeListeners.add(listener); },
        offEvent: (name, listener) => window.__dateThemeListeners.delete(listener),
      } };
    }, source);
    let release;
    const gate = new Promise((resolve) => { release = resolve; });
    await page.route('**/*', async (route) => {
      if (route.request().resourceType() === 'script') await gate;
      await route.continue();
    });
    try {
      await page.goto(`${url}/date-input`, { waitUntil: 'commit' });
      await page.getByTestId('ios-dark-date').waitFor();
      await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-testid="ios-dark-date"]')).colorScheme === 'dark');
      await page.evaluate((ids) => {
        window.__dateNodes = Object.fromEntries(ids.map((id) => [id, ['date', 'light', 'dark', 'text'].map((name) => document.querySelector(`[data-testid="${id}-${name}"]`))]));
      }, ids);
      const date = page.getByTestId('auto-date');
      await date.fill('2026-11-12');
      await date.focus();
      const server = await readDates(page);
      assertDates(server, 'light', `${mode}/${source}/SSR`);
      assert.equal(await page.getByTestId('date-input').getAttribute('data-hydrated'), 'false');
      release();
      await page.waitForFunction(() => document.querySelector('[data-testid="date-input"]').dataset.hydrated === 'true'
        && getComputedStyle(document.querySelector('[data-testid="auto-date"]')).colorScheme === 'dark');
      const hydrated = await readDates(page);
      assertDates(hydrated, 'dark', `${mode}/${source}/hydrated`);
      assert.equal(hydrated.auto[0].value, '2026-11-12', 'Keep native date edited before hydration');
      assert.equal(hydrated.auto[0].focused, true, 'Keep focused native date through hydration/platform detection');
      await page.getByRole('button', { name: 'Focus auto date', exact: true }).click();
      assert.equal(await date.evaluate((node) => document.activeElement === node), true, 'Forwarded HTMLInputElement ref focuses the real date field');
      await date.fill('2026-12-31');
      if (source === 'telegram') {
        assert.equal(await page.evaluate(() => window.__dateThemeListeners.size), 1);
        await page.evaluate(() => {
          window.Telegram.WebApp.colorScheme = 'light';
          window.__dateThemeListeners.forEach((listener) => listener());
        });
      } else {
        await page.emulateMedia({ colorScheme: 'light' });
      }
      await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-testid="auto-date"]')).colorScheme === 'light');
      const changed = await readDates(page);
      assertDates(changed, 'light', `${mode}/${source}/themeChanged`);
      assert.equal(changed.auto[0].value, '2026-12-31');
      assert.equal(changed.auto[0].focused, true, 'Theme change preserves native date focus');
      assert.equal(await date.evaluate((node) => node.min === '2026-01-01' && node.max === '2026-12-31' && node.required && node.validity.valid), true, 'Native date bounds/value/validity preserved');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No date fixture page overflow');
      assert.deepEqual(errors, [], 'Native date browser and hydration errors');
      if (process.env.NEXT15_ARTIFACT_DIR) {
        mkdirSync(process.env.NEXT15_ARTIFACT_DIR, { recursive: true });
        writeFileSync(path.join(process.env.NEXT15_ARTIFACT_DIR, `date-input-${mode}-${source}.json`), JSON.stringify({ mode, source, server, hydrated, changed, errors, status: 'passed' }, null, 2));
      }
      console.log(`PASS Next 15 ${mode}: date schemes ${source}, actual SSR/hydrated/changed CSS, four explicit platform/theme roots, inline overrides, text unchanged, native edit/ref/focus/DOM preserved`);
    } finally {
      release();
      await page.close();
    }
  }
};
