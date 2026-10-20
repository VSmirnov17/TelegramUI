const assert = require('node:assert/strict');

module.exports = async function verifyModalFocus(page) {
  await page.setViewportSize({ width: 414, height: 896 });
  const container = page.getByTestId('modal-focus-container');
  await container.scrollIntoViewIfNeeded();
  const before = await container.evaluate((node) => ({ scrollTop: node.scrollTop, windowY: scrollY }));
  assert.equal(before.scrollTop, 0);

  const trigger = container.getByRole('button', { name: 'Open contained modal', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Contained preview', exact: true });
  await dialog.waitFor();
  await dialog.evaluate(async (node) => {
    // Focus happens while the opening transform still places the drawer below its container.
    // Inspect the final geometry after that animation has finished.
    await Promise.all(node.getAnimations({ subtree: true })
      .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
      .map((animation) => animation.finished.catch(() => {})));
  });
  const after = await dialog.evaluate((node) => {
    const parent = document.querySelector('[data-testid="modal-focus-container"]');
    return {
      scrollTop: parent.scrollTop,
      windowY: scrollY,
      focused: document.activeElement === node,
      dialog: node.getBoundingClientRect().toJSON(),
      container: parent.getBoundingClientRect().toJSON(),
      viewport: { width: innerWidth, height: innerHeight },
    };
  });
  assert.equal(after.scrollTop, 0, 'Opening focus must preserve the transformed container scroll position');
  assert.equal(after.windowY, before.windowY, 'Opening focus must preserve the page scroll position');
  assert.equal(after.focused, true, 'The open dialog receives keyboard focus');
  assert.ok(after.dialog.top >= after.container.top - 1 && after.dialog.bottom <= after.container.bottom + 1,
    'The complete dialog remains visible inside its transformed container');
  assert.ok(after.dialog.left >= -1 && after.dialog.right <= after.viewport.width + 1
    && after.dialog.top >= -1 && after.dialog.bottom <= after.viewport.height + 1,
  'The complete dialog remains inside the viewport');

  await dialog.getByRole('button', { name: 'Close contained modal', exact: true }).click();
  await dialog.waitFor({ state: 'hidden' });
  assert.equal(await trigger.evaluate((node) => document.activeElement === node), true, 'Closing restores focus to the trigger');
  assert.equal(await container.evaluate((node) => node.scrollTop), 0);
  assert.equal(await page.evaluate(() => scrollY), before.windowY);
};
