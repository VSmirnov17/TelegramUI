const assert = require('node:assert/strict');

const readLayout = (page) => page.evaluate(() => {
  const panel = document.querySelector('[data-testid="page-tabbar"]');
  const content = document.querySelector('[data-testid="page-content"]');
  const action = document.querySelector('[data-testid="last-action"]');
  const style = getComputedStyle(panel);
  return {
    panel: panel.getBoundingClientRect().toJSON(),
    action: action.getBoundingClientRect().toJSON(),
    lastRow: [...content.querySelectorAll('[data-tgui-cell]')].at(-1).getBoundingClientRect().toJSON(),
    height: innerHeight,
    width: innerWidth,
    pageWidth: document.documentElement.scrollWidth,
    scrollY,
    position: style.position,
    inset: parseFloat(style.paddingBottom),
    contentPadding: parseFloat(getComputedStyle(content).paddingBottom),
    samePanel: panel === window.__layoutPanel,
    buttons: [...panel.querySelectorAll('button')].map((button) => ({
      name: button.getAttribute('aria-label'),
      pressed: button.getAttribute('aria-pressed'),
      color: getComputedStyle(button).color,
    })),
  };
});

async function settledLayout(page, inset) {
  // Item padding animates for 150ms; allow React's platform update and that transition to settle.
  await page.waitForTimeout(180);
  await page.waitForFunction(async () => {
    const panel = document.querySelector('[data-testid="page-tabbar"]');
    const content = document.querySelector('[data-testid="page-content"]');
    if (panel.getAnimations({ subtree: true }).some((animation) => animation.playState === 'running')) return false;
    const height = panel.getBoundingClientRect().height;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return Math.abs(panel.getBoundingClientRect().height - height) < 0.1
      && Math.abs(parseFloat(getComputedStyle(content).paddingBottom) - height - 16) < 1;
  });
  const state = await readLayout(page);
  assert.equal(state.samePanel, true, 'The fixed Tabbar/ref node stays mounted');
  assert.equal(state.position, 'fixed');
  assert.ok(Math.abs(state.panel.bottom - state.height) < 1, 'Tabbar stays at the viewport bottom');
  assert.ok(Math.abs(state.panel.left) < 1 && Math.abs(state.panel.right - state.width) < 1);
  assert.ok(Math.abs(state.contentPadding - state.panel.height - 16) < 1,
    `Content reserves the complete border box exactly once: ${JSON.stringify(state)}`);
  assert.equal(state.inset, inset, 'Compiled CSS resolves safe-area sources without double counting');
  assert.ok(state.pageWidth <= state.width, 'No horizontal page overflow');
  return state;
}

async function finalAction(page, inset, tab) {
  // Wheel the document itself; locator.click's automatic scrolling must not hide a bad layout.
  await page.mouse.move(100, 150);
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const state = await readLayout(page);
    if (state.action.top >= 0 && state.action.bottom <= state.panel.top) break;
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(40);
  }
  const state = await settledLayout(page, inset);
  assert.ok(state.scrollY > 0, 'Long page really scrolls');
  assert.ok(state.action.top >= 0 && state.action.bottom <= state.panel.top - 1, 'Final action is fully above the bar');
  assert.ok(state.lastRow.top >= 0 && state.lastRow.bottom <= state.panel.top - 1, 'Final row is fully above the bar');
  const action = page.getByTestId('last-action');
  assert.equal(await action.textContent(), `Finish ${tab}`);
  await action.click();
  assert.equal(await action.evaluate((element) => document.activeElement === element), true);
  await page.getByRole('status').waitFor();
  assert.equal(await page.getByRole('status').textContent(), 'Page action completed');
}

async function selectedColors(page, tab, appearance) {
  const active = appearance === 'light' ? 'rgb(0, 122, 255)' : 'rgb(41, 144, 255)';
  const inactive = appearance === 'light' ? 'rgb(162, 172, 176)' : 'rgb(120, 121, 126)';
  const expected = tab === 'devices' ? [active, inactive] : [inactive, active];
  // Color transitions must finish before checking the actual selected/inactive palette.
  await page.waitForFunction((expected) => {
    const buttons = [...document.querySelector('[data-testid="page-tabbar"]').querySelectorAll('button')];
    return buttons.every((button, index) => getComputedStyle(button).color === expected[index]);
  }, expected);
  const state = await readLayout(page);
  assert.deepEqual(state.buttons.map((item) => item.color), expected);
  assert.deepEqual(state.buttons.map((item) => item.pressed), tab === 'devices' ? ['true', 'false'] : ['false', 'true']);
}

async function verifyTabbarLayout(browser, url, mode) {
  const page = await browser.newPage({ viewport: { width: 320, height: 568 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) errors.push(message.text());
  });
  try {
    await page.goto(`${url}/tabbar-layout`);
    await page.getByTestId('page-tabbar').waitFor();
    await page.evaluate(() => { window.__layoutPanel = document.querySelector('[data-testid="page-tabbar"]'); });
    let state = await settledLayout(page, 0);
    const labeledBaseHeight = state.panel.height;
    for (const tab of ['chat', 'devices']) {
      const button = page.getByRole('button', { name: tab === 'chat' ? 'Chat' : 'Devices', exact: true });
      await button.click();
      assert.equal(await button.evaluate((element) => document.activeElement === element), true);
      await page.getByText(`${tab} row 36`, { exact: true }).waitFor();
      await settledLayout(page, 0);
      await selectedColors(page, tab, 'light');
      await finalAction(page, 0, tab);
    }

    for (const platform of ['base', 'ios']) {
      if (platform === 'ios') {
        await page.getByRole('button', { name: 'Switch platform', exact: true }).click();
        await page.waitForFunction((height) => document.querySelector('[data-testid="page-tabbar"]').getBoundingClientRect().height < height, labeledBaseHeight);
      }
      const labeled = await settledLayout(page, 0);
      if (platform === 'ios') assert.ok(labeled.panel.height < labeledBaseHeight, 'Platform changes the measured height');
      await page.getByLabel('Show labels', { exact: true }).uncheck();
      await page.waitForFunction((height) => document.querySelector('[data-testid="page-tabbar"]').getBoundingClientRect().height < height, labeled.panel.height);
      const unlabeled = await settledLayout(page, 0);
      assert.ok(unlabeled.panel.height < labeled.panel.height, 'Label removal updates the observer');
      await page.getByLabel('Show labels', { exact: true }).check();
      await page.waitForFunction((height) => Math.abs(document.querySelector('[data-testid="page-tabbar"]').getBoundingClientRect().height - height) < 1, labeled.panel.height);
      await settledLayout(page, 0);

      // Simulate bound bridge/SDK CSS variables; no physical Telegram or keyboard claim.
      const sources = [
        { '--tg-viewport-safe-area-inset-bottom': '20px', '--tg-viewport-content-safe-area-inset-bottom': '10px' },
        { '--tg-safe-area-inset-bottom': '34px', '--tg-content-safe-area-inset-bottom': '12px' },
        { '--tg-safe-area-inset-bottom': '0px', '--tg-content-safe-area-inset-bottom': '0px' },
      ];
      for (const [index, values] of sources.entries()) {
        await page.evaluate((values) => {
          const root = document.querySelector('[data-testid="tabbar-layout"]');
          Object.entries(values).forEach(([key, value]) => root.style.setProperty(key, value));
        }, values);
        const inset = [30, 46, 0][index];
        state = await settledLayout(page, inset);
        assert.ok(Math.abs(state.panel.height - labeled.panel.height - inset) < 1, 'Inset is added to the measured panel once');
        await finalAction(page, inset, 'devices');
      }
      await page.evaluate(() => {
        const root = document.querySelector('[data-testid="tabbar-layout"]');
        [...root.style].filter((key) => key.startsWith('--tg-')).forEach((key) => root.style.removeProperty(key));
      });
      await settledLayout(page, 0);
      for (const appearance of ['light', 'dark']) {
        if (appearance === 'dark') await page.getByRole('button', { name: 'Switch appearance', exact: true }).click();
        for (const viewport of [{ width: 320, height: 568 }, { width: 414, height: 896 }, { width: 834, height: 1112 }, { width: 320, height: 568 }]) {
          await page.setViewportSize(viewport);
          await settledLayout(page, 0);
          await selectedColors(page, 'devices', appearance);
          await finalAction(page, 0, 'devices');
        }
      }
      await page.getByRole('button', { name: 'Switch appearance', exact: true }).click();
    }
    assert.deepEqual(errors, [], 'No console, hydration or runtime errors');
    console.log(`PASS Next 15 ${mode}: Tabbar page content, native selection/focus, scrolling, responsive measurement, viewport anchoring and bound safe-area CSS`);
  } finally {
    await page.close();
  }
}

module.exports = verifyTabbarLayout;
