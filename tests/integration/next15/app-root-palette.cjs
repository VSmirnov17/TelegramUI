const assert = require('node:assert/strict');

const names = [
  'bg_color', 'text_color', 'hint_color', 'link_color', 'button_color', 'button_text_color',
  'secondary_bg_color', 'header_bg_color', 'accent_text_color', 'section_bg_color',
  'section_header_text_color', 'subtitle_text_color', 'destructive_text_color',
  'tertiary_bg_color', 'segmented_control_active_bg',
];
// Existing documented CSS fallbacks, including the distinct custom-token defaults.
const defaults = {
  light: ['#FFFFFF', '#000000', '#707579', '#007AFF', '#007AFF', '#FFFFFF', '#EFEFF4', '#FFFFFF', '#007AFF', '#FFFFFF', '#707579', '#707579', '#E53935', '#F4F4F7', '#FFFFFF'],
  dark: ['#212121', '#FFFFFF', '#AAAAAA', '#2990FF', '#2990FF', '#FFFFFF', '#0F0F0F', '#212121', '#007AFF', '#212121', '#AAAAAA', '#AAAAAA', '#E53935', '#2A2A2A', '#2F2F2F'],
};
const incoming = [...Array.from({ length: 13 }, (_, index) => `#${String(index + 1).padStart(6, '0')}`), '#000007', '#000001'];
const normalize = (colors) => colors.map((color) => color.toLowerCase());

module.exports = async function verifyAppRootPalette(browser, url, mode) {
  const page = await browser.newPage({ viewport: { width: 414, height: 896 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      errors.push(message.text());
    }
  });
  try {
    await page.goto(`${url}/palette`);
    await page.getByTestId('palette-portal').waitFor();
    await page.waitForFunction(() => document.querySelector('[data-testid="palette-portal"]')?.parentElement
      === document.querySelector('[data-testid="palette"]'));
    for (const telegram of [true, false]) {
      for (const platform of ['base', 'ios']) {
        for (const appearance of ['light', 'dark']) {
          for (const library of [false, true]) {
            const expectedAttributes = { telegram: String(telegram), platform, appearance, library: String(library) };
            for (const [key, label] of [['telegram', 'incoming colors'], ['platform', 'platform'], ['appearance', 'appearance'], ['library', 'library colors']]) {
              if (await page.getByTestId('palette').getAttribute(`data-${key}`) !== expectedAttributes[key]) {
                await page.getByRole('button', { name: `Toggle ${label}`, exact: true }).click();
              }
            }
            await page.waitForFunction((attributes) => Object.entries(attributes).every(([key, value]) => document.querySelector('[data-testid="palette"]').dataset[key] === value), expectedAttributes);
            const actual = await page.evaluate((names) => {
              const read = (id, prefix = '--tgui--', tokens = names) => {
                const style = getComputedStyle(document.querySelector(`[data-testid="${id}"]`));
                return tokens.map((name) => style.getPropertyValue(`${prefix}${name}`).trim().toLowerCase()
                  .replace(/^#([0-9a-f]{3})$/, (_, hex) => `#${[...hex].map((digit) => digit.repeat(2)).join('')}`));
              };
              const portal = document.querySelector('[data-testid="palette-portal"]');
              return {
                root: read('palette'), inherited: read('palette-inherited'), reset: read('palette-reset'),
                override: read('palette-override'), portal: read('palette-portal'),
                telegram: read('palette', '--tg-theme-', names.slice(0, 13).map((name) => name.replaceAll('_', '-'))),
                isPortal: portal.parentElement === document.querySelector('[data-testid="palette"]'),
                lineHeight: getComputedStyle(portal).getPropertyValue('--tgui--text--line_height').trim(),
              };
            }, names);
            const expected = normalize(library || !telegram ? defaults[appearance] : incoming);
            const reset = normalize(telegram ? incoming : defaults[appearance]);
            const scope = `${mode}/${platform}/${appearance}/library=${library}/telegram=${telegram}`;
            assert.deepEqual(actual.root, expected, `${scope}: all 15 root colors`);
            assert.deepEqual(actual.inherited, expected, `${scope}: nested option inheritance`);
            assert.deepEqual(actual.reset, reset, `${scope}: explicit false restores Telegram sourcing`);
            assert.deepEqual(actual.override, ['#abcdef', ...expected.slice(1)], `${scope}: inline user token override`);
            assert.deepEqual(actual.portal, expected, `${scope}: portal colors`);
            assert.deepEqual(actual.telegram, telegram ? incoming.slice(0, 13) : Array(13).fill(''), `${scope}: SDK variables unchanged`);
            assert.equal(actual.isPortal, true, `${scope}: real portal is outside source container`);
            assert.equal(actual.lineHeight, platform === 'ios' ? '22px' : '26px');
          }
        }
      }
    }
    assert.deepEqual(errors, [], 'Palette browser console and runtime errors');
    console.log(`PASS Next 15 ${mode}: AppRoot compiled CSS, 16 palette combinations × 15 tokens, inheritance, false reset, inline overrides, SDK variables and portals`);
  } finally {
    await page.close();
  }
};
