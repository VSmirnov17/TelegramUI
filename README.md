# Telegram UI

## Overview

Telegram UI kit equips you with a variety of pre-designed components and tools to help you quickly develop high-quality Telegram applications. Whether you're aiming to create custom client apps, integrate Telegram functionality, or develop unique bots, this toolkit is your go-to resource.

## Features

- **Cross-Platform Design Consistency:** Use built-in support for iOS’s Human Interface Guidelines and Android’s Material Design to maintain a uniform look and functionality across both platforms.
- **Pre-designed UI Components:** Access a variety of ready-to-use UI components inspired by Telegram’s interface, designed for easy integration and customization.
- **Responsive Design:** Create apps that look and work great on any device, using flexible layouts and media queries to ensure optimal display and functionality.
- **Telegram Color Scheme Support:** Apply Telegram’s native color schemes to your apps for consistent branding and a familiar user experience.

## 🖥 Environment Support

- Modern browsers
- Server-side Rendering
- [All known](https://telegram.org/apps) Telegram clients

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Ios |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| \>= 79 | \>= 78 | \>= 73 | \>= 12.0 | \>= 12.0                                                                                                                                                                                                        |


## Resources

- **Example Mini App:** Typescript version — https://github.com/Telegram-Mini-Apps/TGUI-Example
- **Playground and Storybook:** Experiment with components and visualize changes in real-time at [Playground and Storybook](https://tgui.xelene.me/).
- **Figma Resources:** Design and prototype with ease using our comprehensive Figma files available at [Figma](https://figma.com/community/file/1348989725141777736/).

## Installation

```sh
npm i @telegram-apps/telegram-ui
```

```sh
yarn add @telegram-apps/telegram-ui
```

```sh
pnpm add @telegram-apps/telegram-ui
```

## Usage

```jsx static
import '@telegram-apps/telegram-ui/dist/styles.css';

import { AppRoot, Placeholder } from '@telegram-apps/telegram-ui';

const App = () => (
  <AppRoot>
    <Placeholder
      header="Title"
      description="Description"
    >
      <img
        alt="Telegram sticker"
        src="https://xelene.me/telegram.gif"
        style={{ display: 'block', width: '144px', height: '144px' }}
      />
    </Placeholder>
  </AppRoot>
);

export default App;
```

## Input styling

Use `rootStyle` to customize the whole `Input` container, including its background, header, and icon areas.
The standard `style` prop applies to the native input element:

```tsx
<Input
  header="Name"
  rootStyle={{ backgroundColor: '#dceeff' }}
  style={{ color: '#18334d' }}
  placeholder="Your name"
/>
```

See **Form → Input → Custom Background** in Storybook for default, error, and disabled examples.

## Section layout

`className` and `style` on `Section` apply to the outer section, including its header and footer.
Use `bodyProps.className` or `bodyProps.style` to customize the container around its children.
Disable separators with `showDividers={false}` when using flex, grid, or gaps:

```tsx
<Section
  header="Actions"
  showDividers={false}
  bodyProps={{ style: { display: 'flex', flexWrap: 'wrap', gap: 12, padding: 16 } }}
>
  <div><Button size="s">New chat</Button></div>
  <div><Button size="s" mode="gray">Devices</Button></div>
</Section>
```

See **Blocks → Section → With Gaps / Custom Layout** in Storybook for spaced fields, a responsive grid, and wrapping actions.

## Troubleshooting TON imports in Vite

If adding `@ton/ton` leaves a blank page, check the browser console first. A `Buffer is not defined` error can occur before React renders: TON code uses the Node.js `Buffer` global, which Vite does not supply automatically. This error also reproduces without Telegram UI.

For this specific error, install the browser implementation of Buffer:

```sh
npm install buffer
```

Create `src/bootstrap.ts`:

```ts
import { Buffer } from 'buffer';

Object.assign(globalThis, { Buffer });
void import('./main');
```

Point the module script in `index.html` at this bootstrap instead of `src/main.tsx`:

```html
<script type="module" src="/src/bootstrap.ts"></script>
```

Keep your React entry point and TON imports in `src/main.tsx`. The dynamic import ensures Buffer is available before TON modules execute. A static `import './main'` executes its dependencies before the assignment and does not provide this ordering.

For example, this renders a parsed address using Telegram UI from `src/main.tsx`:

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Address } from '@ton/ton';
import { AppRoot, Cell } from '@telegram-apps/telegram-ui';
import '@telegram-apps/telegram-ui/dist/styles.css';

const address = Address.parse(`0:${'0'.repeat(64)}`).toString();

createRoot(document.getElementById('root')!).render(
  <AppRoot platform="base" appearance="light">
    <Cell>{address}</Cell>
  </AppRoot>,
);
```

Verified with React/React DOM 18.2.0, Vite 5.4.21, `@ton/ton` 16.3.0 (`@ton/core` 0.63.1), and `buffer` 6.0.3 using this repository's Telegram UI 2.1.9 build. Address parsing and formatting passed in a production browser build with and without Telegram UI after the bootstrap was added. Other TON APIs may need additional browser support; this example only verifies address parsing and formatting.

For a different error, include its full console stack, package versions, bundler configuration, and a minimal reproduction when reporting an issue.

## Icons

Import icons alongside components from the package root:

```tsx
import { Cell, Icon28Chat, Icon28Devices } from '@telegram-apps/telegram-ui';

const Settings = () => (
  <>
    <Cell before={<Icon28Chat aria-hidden />}>Chat Settings</Cell>
    <Cell before={<Icon28Devices aria-hidden />}>Data and Storage</Cell>
  </>
);
```

The number in each icon's name is its default size in pixels. Icons accept standard SVG props, including `width`, `height`, `className`, and `style`.
Monochrome icons use `currentColor`; colored icons keep their own palette.
Browse all available names and previews under **Icons → Catalog** in Storybook (`npm run dev`).

## 🤝 Contributing [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

<a href="https://next.ossinsight.io/widgets/official/compose-recent-active-contributors?limit=30&repo_id=738096149" target="_blank" style="display: block" align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://next.ossinsight.io/widgets/official/compose-recent-active-contributors/thumbnail.png?limit=30&repo_id=738096149&image_size=auto&color_scheme=dark" width="655" height="auto">
    <img alt="Active Contributors of Telegram-Mini-Apps/TelegramUI - Last 28 days" src="https://next.ossinsight.io/widgets/official/compose-recent-active-contributors/thumbnail.png?limit=30&repo_id=738096149&image_size=auto&color_scheme=light" width="655" height="auto">
  </picture>
</a>

Contributions are welcome! To contribute, fork the repository, make your changes, and submit a pull request. We look forward to your innovative [ideas](https://github.com/Telegram-Mini-Apps/TelegramUI/pulls) and improvements.

### Package verification

Run `npm pack` to create a release archive. Its `prepack` hook cleans `dist`, runs the tests and builds JavaScript, declarations, and CSS. It then checks npm's package file list for every declared entry and `dist/styles.css`, rejecting missing or empty files before packaging or publishing.

To check an existing build without rebuilding, run `npm run check:package`. Avoid `--ignore-scripts` when preparing a release, as it bypasses the build and verification hook.

## License
This Telegram UI Kit is available under the [MIT License](https://opensource.org/license/mit). Use it freely in both personal and commercial projects.

The library was skillfully crafted by [mainsmirnov](https://github.com/mainsmirnov), with the generous sponsorship of [TON Foundation](https://github.com/ton-society/grants-and-bounties/issues/364).
