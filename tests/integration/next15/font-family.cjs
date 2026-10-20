const assert = require('node:assert/strict');
const { mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');

const sections = ['global', 'scoped', 'default', 'inherited'];

async function readFonts(page) {
  return page.evaluate((ids) => Object.fromEntries(ids.map((id) => {
    const section = document.querySelector(`[data-testid="${id}"]`);
    const text = [`${id} section`, `${id} banner`, `${id} description`, 'Show tooltip'];
    const nodes = text.map((value) => [...section.querySelectorAll('*')].find((node) => node.textContent === value && node.children.length === 0));
    return [id, {
      parent: getComputedStyle(section).fontFamily,
      fonts: nodes.map((node) => getComputedStyle(node).fontFamily),
      sameButtonText: nodes[3] === window.__fontNodes[id][3],
    }];
  })), sections);
}

function assertFonts(states, scope) {
  const defaults = states.default.fonts[0];
  assert.match(defaults, /^system-ui,/, `${scope}: existing default system font stack`);
  for (const id of sections) {
    const expected = id === 'global' ? 'serif' : id === 'scoped' ? 'monospace' : defaults;
    assert.deepEqual(states[id].fonts, Array(4).fill(expected), `${scope}/${id}: actual Section, Banner and Button typography`);
    assert.equal(states[id].sameButtonText, true, `${scope}/${id}: preserve server Button text node`);
  }
  assert.equal(states.inherited.parent, 'cursive', `${scope}: original plain fontFamily is applied on Section`);
  assert.notEqual(defaults, 'cursive', `${scope}: parent fontFamily does not replace Typography's explicit font`);
  return defaults;
}

async function checkTooltip(page, id, font, rootId, sectionId, key, screenshot) {
  const trigger = page.getByRole('button', { name: `Toggle ${id}`, exact: true });
  const button = await trigger.elementHandle();
  if (key) {
    await trigger.focus();
    await trigger.press(key);
  } else {
    await trigger.click();
  }
  const tooltip = page.getByRole('tooltip').filter({ hasText: `${id} tooltip text` });
  await tooltip.waitFor();
  // SSR/in-place rendering is not evidence of the real portal's inheritance.
  await page.waitForFunction(({ id, rootId }) => document.getElementById(`${id}-tooltip`)?.parentElement
    === document.querySelector(`[data-testid="${rootId}"]`), { id, rootId });
  const actualFont = await tooltip.getByText(`${id} tooltip text`, { exact: true }).evaluate((node) => getComputedStyle(node).fontFamily);
  assert.equal(actualFont, font, `${id}: portaled Caption font`);
  assert.equal(await tooltip.evaluate((node, sectionId) => document.querySelector(`[data-testid="${sectionId}"]`).contains(node), sectionId), false, `${id}: portal is outside source Section`);
  assert.equal(await trigger.getAttribute('aria-describedby'), `${id}-tooltip`);
  assert.equal(await trigger.getAttribute('aria-pressed'), 'true');
  assert.equal(await trigger.evaluate((node, button) => node === button && document.activeElement === node, button), true, `${id}: keep trigger identity and focus`);
  const geometry = await trigger.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const label = node.lastElementChild;
    const clipping = [];
    for (let parent = node.parentElement; parent; parent = parent.parentElement) {
      if (['hidden', 'clip', 'auto', 'scroll'].includes(getComputedStyle(parent).overflowX)) {
        const bounds = parent.getBoundingClientRect();
        clipping.push({ left: bounds.left, right: bounds.right });
      }
    }
    return { left: rect.left, right: rect.right, viewport: innerWidth, labelFits: label.scrollWidth <= label.clientWidth, clipping };
  });
  assert.equal(geometry.left >= 0 && geometry.right <= geometry.viewport, true, `${id}: complete trigger fits viewport`);
  assert.equal(geometry.labelFits, true, `${id}: visible Button label is not ellipsized`);
  assert.equal(geometry.clipping.every((rect) => geometry.left >= rect.left && geometry.right <= rect.right), true, `${id}: complete trigger fits clipping ancestors`);
  if (screenshot) await page.screenshot({ path: screenshot, fullPage: true });
  await trigger.press(key === 'Enter' ? 'Space' : 'Enter');
  await tooltip.waitFor({ state: 'detached' });
  assert.equal(await trigger.getAttribute('aria-describedby'), null);
  assert.equal(await trigger.getAttribute('aria-pressed'), 'false');
  assert.equal(await trigger.evaluate((node, button) => node === button && document.activeElement === node, button), true, `${id}: close retains trigger focus`);
  return { id, actualFont, expectedFont: font, rootId, outsideSection: sectionId, activation: key || 'click', geometry, screenshot };
}

module.exports = async function verifyFontFamily(browser, url, mode) {
  const page = await browser.newPage({ viewport: { width: 320, height: 568 } });
  page.setDefaultTimeout(30000);
  const errors = [];
  const artifacts = process.env.NEXT15_ARTIFACT_DIR;
  if (artifacts) mkdirSync(artifacts, { recursive: true });
  const evidence = { mode, url, viewport: page.viewportSize(), cases: [] };
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) errors.push(message.text());
  });
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() === 'script') await gate;
    await route.continue();
  });
  try {
    await page.goto(`${url}/font-family`, { waitUntil: 'commit' });
    await page.getByTestId('inherited').waitFor();
    await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-testid="scoped"]')).getPropertyValue('--tgui--font-family').trim() === 'monospace'
      && getComputedStyle(document.querySelector('[data-testid="default-font-root"]')).getPropertyValue('--tgui--font-family').trim().startsWith('system-ui'));
    await page.evaluate((ids) => {
      window.__fontNodes = Object.fromEntries(ids.map((id) => {
        const section = document.querySelector(`[data-testid="${id}"]`);
        return [id, [`${id} section`, `${id} banner`, `${id} description`, 'Show tooltip']
          .map((value) => [...section.querySelectorAll('*')].find((node) => node.textContent === value && node.children.length === 0))];
      }));
      const trigger = document.querySelector('[data-testid="global"] button');
      trigger.focus();
      window.__fontFocus = trigger;
    }, sections);
    assert.equal(await page.getByTestId('font-family').getAttribute('data-hydrated'), 'false');
    evidence.server = await readFonts(page);
    assertFonts(evidence.server, `${mode}/SSR`);
    release();
    await page.waitForFunction(() => document.querySelector('[data-testid="font-family"]').dataset.hydrated === 'true');
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.evaluate(() => document.activeElement === window.__fontFocus), true, 'Hydration preserves focused server Button');

    for (const platform of ['base', 'ios']) {
      for (const appearance of ['light', 'dark']) {
        for (const [name, value, label] of [['platform', platform, 'platform'], ['appearance', appearance, 'appearance']]) {
          if (await page.getByTestId('font-family').getAttribute(`data-${name}`) !== value) {
            await page.getByRole('button', { name: `Switch font ${label}`, exact: true }).click();
          }
        }
        await page.waitForFunction(({ platform, appearance }) => {
          const root = document.querySelector('[data-testid="font-family"]');
          return root.dataset.platform === platform && root.dataset.appearance === appearance;
        }, { platform, appearance });
        const context = await page.getByTestId('default-font-root').evaluate((node) => {
          const style = getComputedStyle(node);
          return { color: style.color, line: style.getPropertyValue('--tgui--text--line_height').trim() };
        });
        assert.deepEqual(context, { color: appearance === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)', line: platform === 'ios' ? '22px' : '26px' }, 'Explicit appearance and platform actually applied');
        const fonts = await readFonts(page);
        const defaults = assertFonts(fonts, `${mode}/${platform}/${appearance}`);
        const scopedButtonRects = await page.getByTestId('scoped').getByRole('button').evaluateAll((nodes) => nodes.map((node) => {
          const rect = node.getBoundingClientRect();
          return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
        }));
        assert.equal(scopedButtonRects.length, 2);
        assert.equal(scopedButtonRects[1].top > scopedButtonRects[0].bottom, true, 'List stacks the scoped probes with space between complete buttons');
        const screenshot = artifacts && path.join(artifacts, `font-family-${mode}-${platform}-${appearance}.png`);
        const tooltips = [];
        tooltips.push(await checkTooltip(page, 'global-portal', 'serif', 'global-font-root', 'global'));
        tooltips.push(await checkTooltip(page, 'scoped-portal', defaults, 'default-font-root', 'scoped', 'Enter'));
        tooltips.push(await checkTooltip(page, 'scoped-explicit', 'monospace', 'default-font-root', 'scoped', 'Space', screenshot));
        tooltips.push(await checkTooltip(page, 'default-portal', defaults, 'default-font-root', 'default'));
        assertFonts(await readFonts(page), `${mode}/${platform}/${appearance}/after portals`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No horizontal page overflow');
        evidence.cases.push({ platform, appearance, context, fonts, scopedButtonRects, tooltips, status: 'passed' });
      }
    }
    assert.deepEqual(errors, [], 'Font recipe browser and hydration errors');
    if (artifacts) writeFileSync(path.join(artifacts, `font-family-${mode}.json`), JSON.stringify({ ...evidence, errors, status: 'passed' }, null, 2));
    console.log(`PASS Next 15 ${mode}: font token SSR/hydration, original parent fontFamily reproduction, global/scoped/default text, actual Tooltip portals and keyboard focus on both platforms/appearances`);
  } finally {
    release();
    await page.close();
  }
};
