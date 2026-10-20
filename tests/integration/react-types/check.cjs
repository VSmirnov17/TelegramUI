const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { cpSync, mkdtempSync, readdirSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '../../..');
const npmCli = process.env.npm_execpath;
assert.ok(npmCli, 'Run through npm run test:react-types');
const workspace = mkdtempSync(path.join(tmpdir(), 'telegram-ui-react-types-'));
function run(args, cwd) {
  const result = spawnSync(process.execPath, args, { cwd, stdio: 'inherit' });
  assert.equal(result.status, 0, `${args.join(' ')} failed`);
}
function npm(args, cwd) { run([npmCli, ...args], cwd); }
const matrix = [
  { name: 'react18', react: '18.2.0', types: '18.3.0', domTypes: '18.3.0' },
  { name: 'react19', react: '19.2.9', types: '19.3.0', domTypes: '19.3.0' },
];
try {
  npm(['pack', '--quiet', '--pack-destination', workspace], root);
  const archive = readdirSync(workspace).find((file) => file.endsWith('.tgz'));
  assert.ok(archive, 'npm pack must produce a public library archive');
  for (const version of matrix) {
    const directory = path.join(workspace, version.name);
    cpSync(__dirname, directory, { recursive: true });
    writeFileSync(path.join(directory, 'package.json'), JSON.stringify({
      name: `telegram-ui-${version.name}-types`, private: true,
      dependencies: {
        '@telegram-apps/telegram-ui': `file:../${archive}`,
        react: version.react, 'react-dom': version.react,
        '@types/react': version.types, '@types/react-dom': version.domTypes,
        typescript: '5.9.3', '@types/node': '22.15.30',
        'typescript-5-3': 'npm:typescript@5.3.3', 'react-router-dom': '6.30.6',
      },
    }, null, 2));
    npm(['install', '--no-audit', '--no-fund'], directory);
    npm(['ls', 'react', 'react-dom', '@types/react', '@types/react-dom'], directory);
    const options = {
      strict: true, skipLibCheck: false, noEmit: true, jsx: 'react-jsx',
      target: 'ES2020', module: 'Node16', moduleResolution: 'Node16',
      esModuleInterop: true, types: ['react', 'react-dom'],
    };
    writeFileSync(path.join(directory, 'tsconfig.json'), JSON.stringify({ compilerOptions: options, files: ['consumer.tsx', 'button.tsx', 'font-family.tsx', 'date-input.tsx'] }));
    const tsc = path.join(directory, 'node_modules/typescript/bin/tsc');
    run([tsc, '-p', 'tsconfig.json'], directory);
    run([path.join(directory, 'node_modules/typescript-5-3/bin/tsc'), '-p', 'tsconfig.json'], directory);
    // Also compile the implementation against this version's types. Keeping the
    // copy inside the isolated consumer prevents root React 18 types leaking in.
    cpSync(path.join(root, 'src'), path.join(directory, 'source/src'), { recursive: true });
    cpSync(path.join(root, 'types'), path.join(directory, 'source/types'), { recursive: true });
    writeFileSync(path.join(directory, 'tsconfig.source.json'), JSON.stringify({
      compilerOptions: { ...options, types: ['react', 'react-dom', 'node'], baseUrl: 'source', paths: { '*': ['./src/*'] } },
      include: ['source/src/**/*.ts', 'source/src/**/*.tsx'],
      exclude: ['source/src/**/*.stories.tsx', 'source/src/**/*.test.ts', 'source/src/**/*.test.tsx'],
      files: ['source/types/declarations.d.ts'],
    }));
    run([tsc, '-p', 'tsconfig.source.json'], directory);
    console.log(`PASS ${version.name}: strict public declarations (TypeScript 5.3/5.9), Router Button props and complete source`);
  }
} finally {
  rmSync(workspace, { recursive: true, force: true });
}
