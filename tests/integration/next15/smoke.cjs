const assert = require('node:assert/strict');
const { spawn, spawnSync } = require('node:child_process');
const { mkdtempSync, readdirSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');

const fixture = __dirname;
const root = path.resolve(fixture, '../../..');
const port = Number(process.env.NEXT15_PORT || 3105);
const url = `http://127.0.0.1:${port}`;
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' };
const npmCli = process.env.npm_execpath;
assert.ok(npmCli, 'Run this fixture through npm run test:next15');

function run(args, cwd = fixture) {
  const result = spawnSync(process.execPath, [npmCli, ...args], { cwd, env, stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`npm ${args.join(' ')} failed (${result.status})`);
  }
}

async function start(mode) {
  const server = spawn(process.execPath, [require.resolve('next/dist/bin/next'), mode, '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: fixture, env, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  server.stdout.on('data', (data) => { output += data; });
  server.stderr.on('data', (data) => { output += data; });
  server.on('error', (error) => { output += error.message; });
  try {
    for (let attempt = 0; attempt < 180; attempt += 1) {
      if (server.exitCode !== null) {
        throw new Error(`Next exited before startup:\n${output}`);
      }
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
        if (response.ok) {
          return { server, output: () => output };
        }
      } catch {}
      await delay(500);
    }
    throw new Error(`Next startup timed out:\n${output}`);
  } catch (error) {
    await stop(server);
    throw error;
  }
}

async function stop(server) {
  if (server.exitCode !== null) {
    return;
  }
  const exited = new Promise((resolve) => server.once('exit', resolve));
  server.kill('SIGTERM');
  const timeout = setTimeout(() => server.kill('SIGKILL'), 10000);
  await exited;
  clearTimeout(timeout);
}

async function verify(browser, mode) {
  const response = await fetch(url);
  assert.equal(response.status, 200);
  const html = await response.text();
  // Inspect actual HTTP output, before any client-side rendering.
  assert.match(html, /data-testid="auto"/);
  assert.match(html, /Server draft/);
  assert.match(html, /Packed library in Next 15/);
  assert.match(html, /data-hydrated="false"/);
  assert.match(html, /<link[^>]+\.css/);

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
    // Hold external JS so the browser parses SSR HTML and CSS before hydration.
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
      await page.getByTestId('auto').waitFor();
      await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-testid="auto"]')).getPropertyValue('--tgui--text--line_height').trim() === '26px');
      const serverState = await page.evaluate(() => {
        const nodes = ['auto', 'inherited', 'override', 'explicit', 'explicit-inherited'].map((id) => document.querySelector(`[data-testid="${id}"]`));
        const input = document.querySelector('input[aria-label="Draft"]');
        window.__serverNodes = { nodes, input };
        input.value = 'Typed before hydration';
        input.focus();
        input.setSelectionRange(2, 7);
        return nodes.map((node) => ({ color: getComputedStyle(node).color, lineHeight: getComputedStyle(node).getPropertyValue('--tgui--text--line_height').trim() }));
      });
      assert.deepEqual(serverState, [
        { color: 'rgb(0, 0, 0)', lineHeight: '26px' },
        { color: 'rgb(0, 0, 0)', lineHeight: '26px' },
        { color: 'rgb(0, 0, 0)', lineHeight: '26px' },
        { color: 'rgb(255, 255, 255)', lineHeight: '22px' },
        { color: 'rgb(255, 255, 255)', lineHeight: '22px' },
      ]);
      release();
      await page.waitForFunction(() => document.querySelector('main').dataset.hydrated === 'true');
      await page.waitForFunction((source) => {
        const style = getComputedStyle(document.querySelector('[data-testid="auto"]'));
        return style.color === 'rgb(255, 255, 255)' && style.getPropertyValue('--tgui--text--line_height').trim() === (source === 'telegram' ? '22px' : '26px');
      }, source);
      assert.deepEqual(await page.evaluate(() => {
        const { nodes, input } = window.__serverNodes;
        return {
          sameNodes: nodes.every((node) => document.querySelector(`[data-testid="${node.dataset.testid}"]`) === node),
          sameInput: document.querySelector('input[aria-label="Draft"]') === input,
          value: input.value, focused: document.activeElement === input,
          selection: [input.selectionStart, input.selectionEnd],
          inherited: getComputedStyle(nodes[1]).color,
          inheritedLineHeight: getComputedStyle(nodes[1]).getPropertyValue('--tgui--text--line_height').trim(),
          override: getComputedStyle(nodes[2]).color,
          overrideLineHeight: getComputedStyle(nodes[2]).getPropertyValue('--tgui--text--line_height').trim(),
          explicitLineHeight: getComputedStyle(nodes[4]).getPropertyValue('--tgui--text--line_height').trim(),
        };
      }), {
        sameNodes: true,
        sameInput: true,
        value: 'Typed before hydration',
        focused: true,
        selection: [2, 7],
        inherited: 'rgb(255, 255, 255)',
        inheritedLineHeight: source === 'telegram' ? '22px' : '26px',
        override: 'rgb(0, 0, 0)',
        overrideLineHeight: '26px',
        explicitLineHeight: '22px',
      });
      await page.getByRole('textbox', { name: 'Draft', exact: true }).fill('Hydrated draft');
      const libraryInput = page.getByRole('textbox', { name: 'Library input', exact: true });
      await libraryInput.fill('Library interaction');
      assert.equal(await libraryInput.inputValue(), 'Library interaction');
      assert.equal(await libraryInput.evaluate((node) => document.activeElement === node), true);
      await page.getByRole('button', { name: 'Count: 0', exact: true }).click();
      await page.getByRole('button', { name: 'Count: 1', exact: true }).waitFor();
      if (source === 'telegram') {
        assert.equal(await page.evaluate(() => window.__themeListeners.size), 1);
        await page.evaluate(() => {
          window.Telegram.WebApp.colorScheme = 'light';
          window.__themeListeners.forEach((listener) => listener());
        });
      } else {
        await page.emulateMedia({ colorScheme: 'light' });
      }
      await page.waitForFunction(() => ['auto', 'inherited', 'override'].every((id) => getComputedStyle(document.querySelector(`[data-testid="${id}"]`)).color === 'rgb(0, 0, 0)'));
      assert.equal(await page.getByTestId('explicit-inherited').evaluate((node) => getComputedStyle(node).color), 'rgb(255, 255, 255)');
      assert.equal(await page.getByRole('textbox', { name: 'Draft', exact: true }).inputValue(), 'Hydrated draft');
      await page.getByRole('button', { name: 'Open form', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'Platform form', exact: true });
      await dialog.waitFor();
      const combobox = dialog.getByRole('combobox');
      await combobox.fill('Web');
      const dropdownId = await combobox.getAttribute('aria-controls');
      const dropdown = page.locator(`[id="${dropdownId}"]`);
      await dropdown.getByText('Web', { exact: true }).click();
      assert.equal(await dropdown.evaluate((node) => node.closest('[role="dialog"]') !== null), true);
      await combobox.press('Tab');
      assert.equal(await page.getByTestId('selection').textContent(), 'Web');
      await dialog.getByRole('button', { name: 'Done', exact: true }).click();
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await page.getByRole('button', { name: 'Open form', exact: true }).evaluate((node) => document.activeElement === node), true);
      assert.deepEqual(errors, [], 'Browser console and runtime must be error-free (including hydration warnings)');
      console.log(`PASS Next 15 ${mode}: ${source}, SSR, preserved hydration, theme, input, click, Modal and Multiselect`);
    } catch (error) {
      console.error({ mode, source, browserErrors: errors });
      throw error;
    } finally {
      release();
      await page.close();
    }
  }
}

async function main() {
  const directory = mkdtempSync(path.join(tmpdir(), 'telegram-ui-next15-'));
  try {
    // prepack builds and validates the real public artifact, not a source alias.
    run(['pack', '--quiet', '--pack-destination', directory], root);
    const archives = readdirSync(directory).filter((file) => file.endsWith('.tgz'));
    assert.equal(archives.length, 1, 'npm pack must produce one library archive');
    run(['ci', '--no-audit', '--no-fund']);
    run(['install', '--no-save', '--package-lock=false', '--no-audit', '--no-fund', path.join(directory, archives[0])]);
    run(['ls', 'react', 'react-dom', '@telegram-apps/telegram-ui']);
    const { chromium } = require('playwright');
    for (const mode of ['dev', 'start']) {
      if (mode === 'start') {
        run(['run', 'build']);
      }
      const server = await start(mode);
      let browser;
      try {
        browser = await chromium.launch({
          headless: true,
          ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
          ...(process.env.PLAYWRIGHT_NO_SANDBOX === '1' ? { args: ['--no-sandbox'] } : {}),
        });
        await verify(browser, mode);
      } catch (error) {
        console.error(server.output());
        throw error;
      } finally {
        await browser?.close();
        await stop(server.server);
      }
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
