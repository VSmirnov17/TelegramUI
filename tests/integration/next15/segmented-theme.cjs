const assert = require('node:assert/strict');

const ids = ['segmented-auto', 'segmented-sdk', 'segmented-base-light', 'segmented-base-dark', 'segmented-ios-light', 'segmented-ios-dark'];
const palettes = {
  light: { track: 'rgb(244, 244, 247)', thumb: 'rgb(255, 255, 255)', text: 'rgb(0, 0, 0)' },
  dark: { track: 'rgb(42, 42, 42)', thumb: 'rgb(47, 47, 47)', text: 'rgb(255, 255, 255)' },
  sdkDark: { track: 'rgb(35, 46, 60)', thumb: 'rgb(23, 33, 43)', text: 'rgb(255, 255, 255)' },
  sdkLight: { track: 'rgb(239, 241, 244)', thumb: 'rgb(255, 255, 255)', text: 'rgb(24, 34, 45)' },
};

// Inspect rendered surfaces and text, rather than only custom-property strings.
async function readSegmentedState(page) {
  return page.evaluate((ids) => Object.fromEntries(ids.map((id) => {
    const root = document.querySelector(`[data-testid="${id}"]`);
    const thumb = root.querySelector('[aria-hidden][style*="translateX"]');
    const buttons = [...root.querySelectorAll('[role="tab"]')];
    const labels = buttons.map((button) => button.lastElementChild);
    const nodes = [root, thumb, ...buttons, ...labels];
    return [id, {
      track: getComputedStyle(root).backgroundColor,
      thumb: getComputedStyle(thumb).backgroundColor,
      labels: labels.map((label) => {
        const style = getComputedStyle(label);
        return { text: label.textContent, color: style.color, weight: style.fontWeight, size: style.fontSize, line: style.lineHeight };
      }),
      transform: thumb.style.transform,
      sameNodes: nodes.every((node, index) => node === window.__segmentedNodes[id][index]),
    }];
  })), ids);
}

function assertSegmentedColors(states, source, phase, selected = 'Week') {
  for (const id of ids) {
    const explicit = id.match(/^segmented-(base|ios)-(light|dark)$/);
    const appearance = explicit?.[2] || (phase === 'hydrated' ? 'dark' : 'light');
    const platform = explicit?.[1] || (phase !== 'server' && source === 'telegram' ? 'ios' : 'base');
    const expected = id === 'segmented-sdk'
      ? palettes[phase === 'changed' && source === 'telegram' ? 'sdkLight' : 'sdkDark']
      : palettes[appearance];
    const state = states[id];
    const scope = `${source}/${phase}/${id}`;
    assert.equal(state.track, expected.track, `${scope}: actual track background`);
    assert.equal(state.thumb, expected.thumb, `${scope}: actual selected segment background`);
    assert.deepEqual(state.labels.map((label) => label.color), Array(3).fill(expected.text), `${scope}: actual Caption colors`);
    assert.equal(state.sameNodes, true, `${scope}: preserve SSR control, thumb, button and Caption nodes`);
    const period = id === 'segmented-auto' ? selected : 'Week';
    assert.deepEqual(state.labels.map((label) => label.weight), ['Day', 'Week', 'Month'].map((label) => label === period ? '600' : '400'), `${scope}: selected Caption weight`);
    assert.deepEqual(state.labels.map((label) => [label.size, label.line]), Array(3).fill(['13px', platform === 'ios' ? '16px' : '20px']), `${scope}: platform typography`);
    assert.equal(state.transform, `translateX(${['Day', 'Week', 'Month'].indexOf(period) * 100}%)`, `${scope}: selected segment position`);
  }
}

async function selectPeriod(page, id, period, expected) {
  const control = page.getByTestId(id);
  await control.getByRole('tab', { name: period, exact: true }).click();
  // Wait for the 150ms slider transition as well as React's selected label update.
  await page.waitForFunction(({ id, period }) => {
    const root = document.querySelector(`[data-testid="${id}"]`);
    const button = [...root.querySelectorAll('[role="tab"]')].find((node) => node.textContent === period);
    const thumb = root.querySelector('[aria-hidden][style*="translateX"]');
    return getComputedStyle(button.lastElementChild).fontWeight === '600'
      && Math.abs(button.getBoundingClientRect().left - thumb.getBoundingClientRect().left) < 1;
  }, { id, period });
  const state = (await readSegmentedState(page))[id];
  const scope = `${id}/${period}`;
  assert.equal(state.track, expected.track, `${scope}: track color after selection`);
  assert.equal(state.thumb, expected.thumb, `${scope}: selected segment color after selection`);
  assert.deepEqual(state.labels.map((label) => label.color), expected.labels.map((label) => label.color), `${scope}: all Caption colors after selection`);
  assert.deepEqual(state.labels.map((label) => label.weight), ['Day', 'Week', 'Month'].map((label) => label === period ? '600' : '400'), `${scope}: exactly one selected Caption`);
  assert.equal(state.sameNodes, true, `${scope}: selection preserves SSR nodes`);
  assert.equal(state.transform, `translateX(${['Day', 'Week', 'Month'].indexOf(period) * 100}%)`, `${scope}: slider after selection`);
  assert.equal(await control.getByRole('tab', { name: period, exact: true }).evaluate((node) => node === document.activeElement), true, `${scope}: keep focus`);
}

async function verifySegmentedControl(browser, url, mode) {
  for (const source of ['telegram', 'browser']) {
    const page = await browser.newPage({ colorScheme: 'dark', viewport: { width: 414, height: 896 } });
    page.setDefaultTimeout(30000);
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (['error', 'warning'].includes(message.type())) {
        errors.push(message.text());
      }
    });
    await page.addInitScript((source) => {
      window.__refLifecycle = [];
      window.__themeListeners = new Set();
      if (source === 'telegram') {
        window.Telegram = { WebApp: {
          platform: 'ios', colorScheme: 'dark', themeParams: {},
          onEvent: (name, listener) => {
            if (name === 'themeChanged') {
              window.__themeListeners.add(listener);
            }
          },
          offEvent: (name, listener) => window.__themeListeners.delete(listener),
        } };
      }
    }, source);
    let release;
    const gate = new Promise((resolve) => { release = resolve; });
    await page.route('**/*', async (route) => {
      if (route.request().resourceType() === 'script') {
        await gate;
      }
      await route.continue();
    });
    try {
      await page.goto(url, { waitUntil: 'commit' });
      await page.getByTestId('segmented-sdk').waitFor();
      await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-testid="segmented-auto"]')).getPropertyValue('--tgui--text--line_height').trim() === '26px');
      await page.evaluate((ids) => {
        window.__segmentedNodes = Object.fromEntries(ids.map((id) => {
          const root = document.querySelector(`[data-testid="${id}"]`);
          const buttons = [...root.querySelectorAll('[role="tab"]')];
          return [id, [root, root.querySelector('[aria-hidden][style*="translateX"]'), ...buttons, ...buttons.map((button) => button.lastElementChild)]];
        }));
        const button = [...document.querySelector('[data-testid="segmented-auto"]').querySelectorAll('[role="tab"]')].find((node) => node.textContent === 'Week');
        button.focus();
        window.__segmentedFocus = button;
      }, ids);
      assertSegmentedColors(await readSegmentedState(page), source, 'server');
      assert.equal(await page.evaluate(() => document.querySelector('main').dataset.hydrated), 'false');
      release();
      await page.waitForFunction((source) => {
        const root = document.querySelector('[data-testid="segmented-auto"]');
        return document.querySelector('main').dataset.hydrated === 'true'
          && getComputedStyle(root).backgroundColor === 'rgb(42, 42, 42)'
          && getComputedStyle(root.querySelector('[role="tab"]').lastElementChild).lineHeight === (source === 'telegram' ? '16px' : '20px');
      }, source);
      const hydrated = await readSegmentedState(page);
      assertSegmentedColors(hydrated, source, 'hydrated');
      assert.equal(await page.evaluate(() => document.activeElement === window.__segmentedFocus), true, `${source}: retain focused server button through hydration`);

      for (const id of ids) {
        for (const period of ['Day', 'Month', 'Week']) {
          await selectPeriod(page, id, period, hydrated[id]);
        }
      }
      await selectPeriod(page, 'segmented-auto', 'Month', hydrated['segmented-auto']);
      await page.evaluate(() => { window.__segmentedFocus = document.activeElement; });
      if (source === 'telegram') {
        assert.equal(await page.evaluate(() => window.__themeListeners.size), 1);
        // Emulate the SDK updating CSS variables and notifying its subscribers together.
        await page.evaluate(() => {
          const host = document.querySelector('[data-testid="segmented-sdk-host"]');
          host.style.setProperty('--tg-theme-bg-color', '#ffffff');
          host.style.setProperty('--tg-theme-secondary-bg-color', '#eff1f4');
          host.style.setProperty('--tg-theme-text-color', '#18222d');
          window.Telegram.WebApp.colorScheme = 'light';
          window.__themeListeners.forEach((listener) => listener());
        });
      } else {
        await page.emulateMedia({ colorScheme: 'light' });
      }
      await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-testid="segmented-auto"]')).backgroundColor === 'rgb(244, 244, 247)');
      const changed = await readSegmentedState(page);
      assertSegmentedColors(changed, source, 'changed', 'Month');
      assert.equal(await page.evaluate(() => document.activeElement === window.__segmentedFocus), true, `${source}: preserve selected button focus through theme change`);
      for (const id of ids) {
        for (const period of ['Day', 'Month', 'Week']) {
          await selectPeriod(page, id, period, changed[id]);
        }
      }
      assertSegmentedColors(await readSegmentedState(page), source, 'changed');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No horizontal page overflow');
      assert.deepEqual(errors, [], 'SegmentedControl browser console and hydration errors');
      console.log(`PASS Next 15 ${mode}: SegmentedControl ${source}, actual SSR/hydrated/theme-change surfaces, six platform/appearance probes, Caption selection, slider, DOM and focus`);
    } finally {
      release();
      await page.close();
    }
  }
}

module.exports = { verifySegmentedControl, readSegmentedState, assertSegmentedColors };
