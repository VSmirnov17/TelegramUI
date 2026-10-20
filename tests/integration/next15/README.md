# Next 15 / React 19 runtime integration

This isolated JavaScript App Router consumer tests Next **15.5.28** and React / React DOM **19.2.9** against the library's actual npm tarball. Root development and Storybook remain on React 18. The fixture build skips the root ESLint configuration because it uses the library TypeScript project, which excludes this JavaScript consumer. The fixture and Next dependencies are excluded from the library distribution and root TypeScript compilation.

From the repository root, with Node 20.9+ and the root development dependencies installed:

```sh
npm ci --prefix tests/integration/next15
cd tests/integration/next15
npx playwright install chromium
cd ../../..
npm run test:next15
```

The smoke command:

1. Runs `npm pack`, including the full library prepack build, tests and artifact checks.
2. Runs the fixture's pinned `npm ci`, then installs the temporary tarball with `npm install --no-save --package-lock=false`. This resolves the library's React 19 peers without force or legacy peer flags. It clears the Next compilation cache so an older local archive with the same package version cannot be reused. The lockfile pins the framework and browser tooling; the changing local library artifact is intentionally installed separately rather than committing its archive or integrity hash.
3. Starts Next dev, checks the real HTTP SSR response and imported CSS, then blocks browser scripts to inspect the pre-hydration DOM. It verifies that hydration preserves nodes (including the library `Input` inside a `Cell` and the Cell's text elements, but not the base-only decorative ripple), input contents, focus and selection when Telegram reports iOS/dark or the browser reports dark, after the server rendered base/light.
4. Exercises nested inheritance, explicit overrides, theme changes, typing, clicking, and opening a Modal containing Multiselect fields (full-click selection, default stay-open behavior, opt-in `closeDropdownAfterSelect` closing, portal and focus restoration). The SSR response also includes a Multiselect. It replaces and unmounts callback refs, checking React 19 cleanup callbacks and legacy null notifications through merged library refs. Browser errors and warnings, including React hydration diagnostics, fail the check.
5. Opens a Modal inside a bounded, transformed portal (matching inline Docs), then checks that opening focus preserves both container and page scroll positions, the complete dialog stays visible, and closing restores focus to the trigger (issue #8).
6. Keeps a long-content Modal open while resizing the layout viewport from 320 × 220 to 320 × 568, 414 × 896, 834 × 1112 and back. Checks growing/shrinking height, bottom alignment, preserved dialog identity and draft value, internal scrolling to the final action, closing, and absence of horizontal page overflow (issue #5). The input is blurred before resizing to distinguish this from virtual-keyboard visual viewport behavior.
7. Stops dev, builds Next production and repeats the same browser checks with `next start`.

The fixture starts at a 414 × 896 browser viewport and changes size for the Modal regression. It verifies framework runtime integration, not the Storybook visual matrix. No library components or styles are changed by this fixture. Its JavaScript consumer does not establish React 19 TypeScript declaration compatibility. The library `Input` inside a `Cell` is the hydration probe: it must keep its DOM node, value, focus and selection when the platform changes from base to iOS, and a controlled `Input` in a `Cell` must keep focus on every keystroke.

Set `NEXT15_PORT` to change the default port 3105. A separately provisioned Chromium can be selected with `PLAYWRIGHT_EXECUTABLE_PATH`; `PLAYWRIGHT_NO_SANDBOX=1` is available for isolated CI containers that require it. Browser system libraries still need to be available (see Playwright's `install --with-deps` option). The runner stops its server/browser and removes the temporary tarball on success or failure.
