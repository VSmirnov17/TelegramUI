const assert = require('node:assert/strict');
const { test } = require('node:test');
const { checkPackage } = require('./check-package.cjs');

const manifest = {
  main: 'dist/cjs/index.js',
  module: 'dist/index.js',
  typings: 'dist/index.d.ts',
};
const files = [...Object.values(manifest), 'dist/styles.css'].map((file) => ({
  path: file,
  size: 100,
}));

test('accepts a package containing all declared entries and stylesheet', () => {
  assert.deepEqual(
    checkPackage(manifest, files),
    files.map((file) => file.path),
  );
});

for (const artifact of files) {
  test(`rejects a package missing ${artifact.path}`, () => {
    assert.throws(
      () =>
        checkPackage(
          manifest,
          files.filter((file) => file !== artifact),
        ),
      { message: `Package artifacts are missing or empty: ${artifact.path}` },
    );
  });

  test(`rejects an empty ${artifact.path}`, () => {
    assert.throws(
      () =>
        checkPackage(
          manifest,
          files.map((file) =>
            file === artifact ? { ...file, size: 0 } : file,
          ),
        ),
      { message: `Package artifacts are missing or empty: ${artifact.path}` },
    );
  });
}

test('checks the manifest paths instead of hardcoded entry names', () => {
  assert.throws(
    () =>
      checkPackage(
        {
          ...manifest,
          module: './dist/esm/index.js',
          types: 'dist/types.d.ts',
        },
        files,
      ),
    {
      message:
        'Package artifacts are missing or empty: ./dist/esm/index.js, dist/types.d.ts',
    },
  );
});

test('accepts entry paths prefixed with ./', () => {
  assert.doesNotThrow(() =>
    checkPackage({ ...manifest, main: './dist/cjs/index.js' }, files),
  );
});
