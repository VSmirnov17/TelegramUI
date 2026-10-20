const { execFileSync } = require('node:child_process');
const path = require('node:path');

const checkPackage = (manifest, files) => {
  const packedFiles = new Map(files.map((file) => [file.path, file.size]));
  const entries = ['main', 'module', 'typings', 'types']
    .filter((field) => manifest[field])
    .map((field) => manifest[field]);
  const requiredFiles = [...new Set([...entries, 'dist/styles.css'])];
  const missingFiles = requiredFiles.filter(
    (file) => !(packedFiles.get(file.replace(/^\.\//, '')) > 0),
  );

  if (missingFiles.length) {
    throw new Error(
      `Package artifacts are missing or empty: ${missingFiles.join(', ')}`,
    );
  }

  return requiredFiles;
};

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const manifest = require(path.join(root, 'package.json'));
  // Skip lifecycle scripts here: prepack calls this check after building.
  const packArgs = ['pack', '--dry-run', '--json', '--ignore-scripts'];
  const output = process.env.npm_execpath
    ? execFileSync(process.execPath, [process.env.npm_execpath, ...packArgs], {
        cwd: root,
        encoding: 'utf8',
      })
    : execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', packArgs, {
        cwd: root,
        encoding: 'utf8',
        shell: process.platform === 'win32',
      });
  const [packed] = JSON.parse(output);
  const checkedFiles = checkPackage(manifest, packed.files);
  console.log(`Package artifacts verified: ${checkedFiles.join(', ')}`);
}

module.exports = { checkPackage };
