const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { ESLint } = require('eslint');
const prettier = require('prettier');

const root = path.resolve(__dirname, '..');
const buttonPath = path.join(root, 'src/components/Blocks/Button/Button.tsx');

const checkFormatConfig = async () => {
  // ESLint's existing parserOptions.project is relative to the repository.
  process.chdir(root);
  const configPath = await prettier.resolveConfigFile(buttonPath);
  assert.equal(configPath, path.join(root, '.prettierrc'), 'Prettier must discover the repository configuration');
  const config = await prettier.resolveConfig(buttonPath, { editorconfig: true });
  for (const [option, expected] of Object.entries({
    printWidth: 180,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: true,
    jsxSingleQuote: false,
    trailingComma: 'all',
  })) {
    assert.equal(config[option], expected, `Unexpected Prettier ${option}`);
  }

  const eslint = new ESLint({ cwd: root });
  const fixer = new ESLint({ cwd: root, fix: true });
  const format = (source, filepath = buttonPath) => prettier.format(source, { ...config, filepath });
  // An existing filePath lets ESLint use its real TypeScript project for unsaved text.
  // lintText never writes the provided text to that file, including with fix:true.
  const lint = async (source, filepath = buttonPath, engine = eslint) => (await engine.lintText(source, { filePath: filepath }))[0];
  const assertClean = (result, name) => {
    assert.equal(result.messages.length, 0, `${name}: ${result.messages.map((message) => `${message.ruleId}: ${message.message}`).join('\n')}`);
  };
  const checkStable = async (name, source, filepath = buttonPath) => {
    const formatted = await format(source, filepath);
    assertClean(await lint(formatted, filepath), name);
    const fixed = await lint(formatted, filepath, fixer);
    assertClean(fixed, name);
    assert.equal(fixed.output ?? formatted, formatted, `${name}: ESLint must not undo Prettier formatting`);
    assert.equal(await format(formatted, filepath), formatted, `${name}: Prettier must be idempotent`);
    return formatted;
  };

  const basic = await checkStable(
    'JSX quotes, indentation and semicolons',
    `
export const Demo = () => {
const label = 'Action'
return <button type='button' title='Example'>{label}</button>
}
`,
  );
  assert.ok(basic.includes("  const label = 'Action';"));
  assert.ok(basic.includes('type="button" title="Example"'));

  const apostrophe = await checkStable('apostrophe quotes', "export const message = 'it\\'s working';\n");
  assert.ok(apostrophe.includes('"it\'s working"'), 'Prettier avoids escaping an apostrophe with double quotes');

  await checkStable(
    'TypeScript intersection continuation',
    `
import { ComponentPropsWithRef, ElementType } from 'react';

type VisualProperties = { disabled?: boolean; descriptiveVisualSetting?: 'small' | 'large' };
export type PolymorphicProperties<C extends ElementType = 'button'> = VisualProperties & Omit<ComponentPropsWithRef<C>, keyof VisualProperties> & (C extends 'button' ? { Component?: C } : { Component: C });
`,
  );

  const parameters = ['first', 'second', 'third'].map((prefix) => `${prefix}VeryLongDescriptiveParameterNameForFormattingAlignment`);
  const multiline = await checkStable(
    'multiline function commas',
    `export const list = (${parameters.map((name) => `${name}: string`).join(', ')}) => [${parameters.join(', ')}];`,
  );
  assert.match(multiline, /,\n\) =>/, 'Multiline function parameters need a trailing comma');

  for (const relative of ['src/components/Blocks/Button/Button.tsx', 'src/components/Form/Input/Input.tsx', 'src/components/Blocks/Section/Section.tsx']) {
    const filepath = path.join(root, relative);
    await checkStable(relative, await fs.readFile(filepath, 'utf8'), filepath);
  }

  // Static backticks are an existing lint violation, not a formatter/linter cycle:
  // ESLint converts them to single quotes, which Prettier then preserves.
  const template = await format('export const message = `plain text`;\n');
  assert.ok((await lint(template)).messages.some((message) => message.ruleId === '@typescript-eslint/quotes'));
  const templateFix = await lint(template, buttonPath, fixer);
  assertClean(templateFix, 'static template after lint fix');
  assert.ok(templateFix.output?.includes("'plain text'"));
  assert.equal(await format(templateFix.output), templateFix.output);
  await checkStable('fixed static template', templateFix.output);

  // printWidth does not split arbitrary tokens. Keep the existing max-len policy.
  const longLiteral = await format(`export const content = '${'a'.repeat(200)}';`);
  const longResult = await lint(longLiteral);
  assert.ok(
    longResult.messages.some((message) => message.ruleId === 'max-len'),
    'ESLint must still reject unbreakable lines over 180 columns',
  );

  const json = await format('{"name":"value","nested":{"enabled":true}}', path.join(root, 'sample.json'));
  assert.deepEqual(JSON.parse(json), { name: 'value', nested: { enabled: true } });
  const css = await format('.sample{color:red;padding:4px 8px;}', path.join(root, 'sample.css'));
  assert.ok(css.includes('\n  color: red;'));

  console.log('Formatting configuration verified: discovery, TSX fixed points, three source copies, static-template policy, max-len, JSON and CSS. No files rewritten.');
};

checkFormatConfig().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
