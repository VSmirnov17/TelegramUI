const assert = require('node:assert/strict');

const finishAnimation = (dialog) => dialog.evaluate(async (element) => {
  await Promise.all(element.getAnimations({ subtree: true })
    .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
    .map((animation) => animation.finished.catch(() => {})));
});

async function verifyModalClose(browser, url, mode) {
  const page = await browser.newPage({ viewport: { width: 414, height: 896 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) errors.push(message.text());
  });
  await page.addInitScript(() => {
    window.__closeEvents = [];
    window.__closeLifecycle = [];
    window.__closeRefs = {};
    window.__closeChildren = {};
    window.__closeRequests = {};
    window.__nativeCloseClicks = [];
  });
  try {
    await page.goto(`${url}/modal-close`);
    const root = page.getByTestId('close-root');
    const outerTrigger = page.getByRole('button', { name: 'Open async form', exact: true });
    const outer = page.getByRole('dialog', { name: 'Async form', exact: true });
    const nested = page.getByRole('dialog', { name: 'Nested async form', exact: true });
    const readEvents = () => page.evaluate(() => window.__closeEvents);
    const focusIs = (button) => button.evaluate((element) => element === document.activeElement);
    const openOuter = async () => {
      await outerTrigger.click();
      await outer.waitFor();
      await finishAnimation(outer);
      assert.equal(await outer.evaluate((element) => element === window.__modalDiv && element instanceof HTMLDivElement), true);
      assert.equal(await outer.getByTestId('outer-close').evaluate((element) => element === window.__closeRefs.outer
        && element === window.__closeChildren.outer.current && element instanceof HTMLButtonElement), true);
      // Ignore the development StrictMode mount probe; subsequent ref churn is a failure.
      await page.evaluate(() => { window.__closeLifecycle = []; window.__nativeCloseClicks = []; });
    };
    const assertClosed = async (dialog, trigger, id) => {
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await focusIs(trigger), true, 'Native close restores focus to its owning trigger');
      assert.deepEqual(await page.evaluate(() => window.__closeLifecycle), [`${id} cleaned`], 'One cleanup, no reattachment during async state changes');
      assert.deepEqual(await page.evaluate(() => window.__nativeCloseClicks), [id], 'One actual native close click');
    };

    for (const platform of ['base', 'ios']) {
      if (await root.getAttribute('data-platform') !== platform) await page.getByRole('button', { name: 'Toggle close platform' }).click();
      for (const appearance of ['light', 'dark']) {
        if (await root.getAttribute('data-appearance') !== appearance) await page.getByRole('button', { name: 'Toggle close appearance' }).click();
        await page.evaluate(() => { window.__closeEvents = []; });
        await openOuter();
        const original = await outer.getByTestId('outer-close').evaluate((element) => { window.__originalClose = element; return element.tagName; });
        assert.equal(original, 'BUTTON');
        await outer.getByRole('button', { name: 'Save outer', exact: true }).click();
        await outer.getByText('Pending', { exact: true }).waitFor();
        assert.deepEqual(await readEvents(), [['outer', true]], 'Pending work does not request close');
        await page.evaluate(() => window.__closeRequests.outer.reject(new Error('Expected rejection')));
        await outer.getByText('Rejected; retry', { exact: true }).waitFor();
        assert.deepEqual(await readEvents(), [['outer', true]], 'Rejected work leaves uncontrolled modal open');
        assert.equal(await outer.getByTestId('outer-close').evaluate((element) => element === window.__originalClose), true);
        assert.deepEqual(await page.evaluate(() => window.__closeLifecycle), [], 'Pending/rejection rerenders preserve ref and child');
        await outer.getByRole('button', { name: 'Save outer', exact: true }).click();
        await outer.getByText('Pending', { exact: true }).waitFor();
        await page.evaluate(() => window.__closeRequests.outer.resolve());
        await assertClosed(outer, outerTrigger, 'outer');
        assert.deepEqual(await readEvents(), [['outer', true], ['outer', false]], 'Success closes once through the uncontrolled native path');

        for (const key of ['Enter', 'Space']) {
          await page.evaluate(() => { window.__closeEvents = []; });
          await openOuter();
          const close = outer.getByRole('button', { name: 'Close outer', exact: true });
          await close.focus();
          await close.press(key);
          await assertClosed(outer, outerTrigger, 'outer');
          assert.deepEqual(await readEvents(), [['outer', true], ['outer', false]], `${key} follows native button semantics`);
        }

        await page.evaluate(() => { window.__closeEvents = []; });
        await openOuter();
        const nestedTrigger = outer.getByRole('button', { name: 'Open nested async form', exact: true });
        await nestedTrigger.click();
        await nested.waitFor();
        await finishAnimation(nested);
        await page.evaluate(() => { window.__closeLifecycle = []; window.__nativeCloseClicks = []; });
        assert.equal(await nested.getByTestId('nested-close').evaluate((element) => element === window.__closeRefs.nested
          && element === window.__closeChildren.nested.current), true);
        await nested.getByRole('button', { name: 'Save nested', exact: true }).click();
        await nested.getByText('Pending', { exact: true }).waitFor();
        await page.evaluate(() => window.__closeRequests.nested.resolve());
        await assertClosed(nested, nestedTrigger, 'nested');
        assert.equal(await outer.isVisible(), true, 'Nested close does not dismiss its parent');
        assert.deepEqual(await readEvents(), [['outer', true], ['nested', true], ['nested', false]]);
        await page.evaluate(() => { window.__closeLifecycle = []; window.__nativeCloseClicks = []; });
        await outer.getByRole('button', { name: 'Close outer', exact: true }).click();
        await assertClosed(outer, outerTrigger, 'outer');

        await page.evaluate(() => { window.__closeEvents = []; });
        const controlledTrigger = page.getByRole('button', { name: 'Open controlled form', exact: true });
        const controlled = page.getByRole('dialog', { name: 'Controlled form', exact: true });
        await controlledTrigger.click();
        await controlled.waitFor();
        await finishAnimation(controlled);
        await controlled.getByRole('button', { name: 'Click controlled ref', exact: true }).click();
        assert.equal(await controlled.isVisible(), true, 'Controlled open state remains owned by caller');
        assert.deepEqual(await readEvents(), [['controlled', true], ['controlled', false]], 'Controlled ref click requests one close');
        await controlled.getByRole('button', { name: 'Apply controlled close', exact: true }).click();
        await controlled.waitFor({ state: 'hidden' });
        assert.equal(await focusIs(controlledTrigger), true);
        assert.deepEqual(await readEvents(), [['controlled', true], ['controlled', false]]);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      }
    }
    assert.deepEqual(errors, [], 'No browser, hydration or ref warnings/errors');
    console.log(`PASS Next 15 ${mode}: Modal.Close async pending/reject/retry/success, native keyboard, nested ownership, controlled requests, actual child/div refs and React19 cleanup × both platforms/themes`);
  } finally {
    await page.close();
  }
}

module.exports = verifyModalClose;
