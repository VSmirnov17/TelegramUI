# Storybook verification

For changes to components, styles, stories, or Storybook configuration, verify every affected example and its Docs page before handing the work back to the user.

## Required screen sizes

Select each preset using Storybook's **Change the size of the preview** toolbar menu:

| Preset | Preview width | Preview height |
| --- | --- | --- |
| Small mobile | 320px | 568px |
| Large mobile | 414px | 896px |
| Tablet | 834px | 1112px |

Test each size with both platforms (`base`, `ios`) and both themes (`light`, `dark`): **12 combinations per example**. Resizing only the outer browser window does not replace selecting a Storybook preset. Confirm that the preview iframe has the selected device dimensions and that its scaled frame fits inside the visible preview area.

## What to check

- Inspect screenshots for layout, spacing, typography, theme colors, wrapping, clipping, and overlapping elements. Compare with the library's existing examples.
- Check for unexpected horizontal page overflow. Vertical content must remain reachable by scrolling. Fixed controls, including Tabbar, must stay in their intended visible area.
- Exercise the affected behavior: typing and focus, buttons, selection, opening and closing overlays, scrolling, or other interactions relevant to the change. Check the browser console for errors.
- Verify existing examples of the affected component as well as new examples. Preserve default behavior; compare with the previous build when changing shared layout or styles.
- Check Docs at widths of 320px, 414px, and 834px on both platforms and themes. Tables and code blocks may scroll internally, but must not cause horizontal overflow of the page.
- Confirm that new stories appear in the Storybook index and are reachable from the component's Docs page in the sidebar. This project builds Storybook in Docs mode, where examples normally appear inside the component page.

## Published Storybook

The project's published Storybook is at <http://45.90.120.183:6006/>. After publishing a changed build, repeat the affected examples' screen-size checks against this address, including interactions and Docs. A successful local build or a desktop-only smoke check does not establish that the published examples work at all required sizes.

In the handoff, report the tested scope, sizes, platforms, themes, results, and any remaining failures. Describe only checks actually completed. Record dated verification results below when requested; keep the procedure above applicable to future changes.

## Recorded verification — 2026-10-19, issue #33

- Target: the published Storybook at <http://45.90.120.183:6006/>.
- Section examples: `blocks-section--with-gaps`, `blocks-section--custom-layout`, `blocks-section--playground`, `blocks-section--row-dividers`, and `blocks-section--adjacent-errors`.
- All five examples passed the 12-combination matrix above using the actual Storybook viewport menu: **60 checks passed**. Confirmed iframe dimensions and preview fitting, spacing, responsive grid columns, wrapping buttons, input values and focus, default separators, disabled separators, and absence of horizontal page overflow.
- Section Docs (`blocks-section--documentation`) passed at all three widths on both platforms and themes: **12 checks passed**. Both new examples and the `bodyProps` / `showDividers` documentation are present; no horizontal page overflow was detected.
- Screenshots were reviewed across Small mobile, Large mobile, Tablet, light/dark themes, and base/iOS examples. No visual defects or browser runtime errors were found in this run. Total: **72 checks passed**.
