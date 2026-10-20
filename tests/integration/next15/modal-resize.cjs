const assert = require('node:assert/strict');

module.exports = async function verifyModalResize(page) {
  await page.setViewportSize({ width: 320, height: 220 });
  await page.getByRole('button', { name: 'Open responsive modal', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Responsive modal', exact: true });
  await dialog.waitFor();
  const handle = await dialog.elementHandle();
  const input = dialog.getByRole('textbox', { name: 'Responsive draft', exact: true });
  await input.fill('Draft survives resizing');
  // This covers a layout viewport resize, as in issue #5, rather than a virtual keyboard.
  await dialog.focus();
  const finish = dialog.getByRole('button', { name: 'Finish responsive modal', exact: true });
  let previous;
  for (const viewport of [
    { width: 320, height: 220 },
    { width: 320, height: 568 },
    { width: 414, height: 896 },
    { width: 834, height: 1112 },
    { width: 320, height: 568 },
    { width: 320, height: 220 },
  ]) {
    await finish.evaluate((node) => {
      for (let parent = node.parentElement; parent; parent = parent.parentElement) {
        if (getComputedStyle(parent).overflowY === 'auto' && parent.scrollHeight > parent.clientHeight) {
          parent.scrollTop = 0;
          break;
        }
      }
    });
    await page.setViewportSize(viewport);
    // The long content must grow and shrink with the viewport while staying bottom aligned.
    await page.waitForFunction((node) => {
      const rect = node.getBoundingClientRect();
      return rect.height > innerHeight * 0.8 && rect.height <= innerHeight && Math.abs(rect.bottom - innerHeight) < 2;
    }, handle);
    const height = await dialog.evaluate((node) => node.getBoundingClientRect().height);
    if (previous && viewport.height !== previous.viewportHeight) {
      assert.equal(height > previous.height, viewport.height > previous.viewportHeight, 'Modal height follows viewport growth and shrinkage');
    }
    previous = { height, viewportHeight: viewport.height };
    assert.equal(await dialog.evaluate((node, original) => node === original, handle), true, 'Resize must preserve the open modal');
    assert.equal(await input.inputValue(), 'Draft survives resizing');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No horizontal page overflow');
    await finish.scrollIntoViewIfNeeded();
    assert.equal(await finish.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= innerHeight + 1;
    }), true, `Final action remains reachable at ${viewport.width} × ${viewport.height}`);
    assert.equal(await finish.evaluate((node) => {
      for (let parent = node.parentElement; parent; parent = parent.parentElement) {
        if (getComputedStyle(parent).overflowY === 'auto' && parent.scrollHeight > parent.clientHeight) {
          const action = node.getBoundingClientRect();
          const body = parent.getBoundingClientRect();
          return parent.scrollTop > 0 && action.top >= body.top && action.bottom <= body.bottom + 1;
        }
      }
      return false;
    }), true, 'Long content scrolls inside the modal');
  }
  await finish.click();
  await dialog.waitFor({ state: 'hidden' });
  await page.setViewportSize({ width: 414, height: 896 });
};
