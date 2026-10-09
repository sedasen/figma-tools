# Accessibility Checker

Figma plugin using ChromaKit's React + TypeScript + Vite architecture and shared neutral shadcn components from `@figma-tools/ui`. Uses **pnpm**, Node >= 22.12.

## Development

From the repository root:

```sh
pnpm install
pnpm --filter @figma-tools/accessibility-checker dev
pnpm --filter @figma-tools/accessibility-checker test
pnpm --filter @figma-tools/accessibility-checker build
```

Browser preview supports manual contrast checking. Selection scanning requires Figma.

## Figma installation

Build, then choose Plugins → Development → Import plugin from manifest in Figma desktop and select this app's `dist/manifest.json`. Select text or a frame and use Selection audit.

The manifest intentionally omits a published plugin ID. Add the ID assigned by Figma when registering this plugin; do not reuse ChromaKit's ID. UI scripts, styles, fonts and the supplied logo are embedded in a single HTML file. No network access is required.

## Features and limitations

- Manual HEX contrast, AA / AAA text thresholds, AA non-text threshold, live preview and color swap.
- Light/dark themes, labeled controls and keyboard-accessible shadcn tabs.
- Selection audit for visible text on explicit solid ancestor backgrounds, with transparent text paint compositing.
- Pass / fail / review results, filtering and click-to-focus layers.
- Deduplicated selections; limits of 5,000 visited nodes or 500 text results with a truncation notice.

This checks **text contrast and design guidance**, not full WCAG compliance. Semantics, keyboard navigation and screen-reader behavior are outside the scan. Mixed text styles, gradients, images, transparent backgrounds, layer opacity, effects, masks, rounded background edges and overlapping layers require manual review. Results are a snapshot: rescan after edits. Selection or level changes clear results.

Additional checks:

- **Font size:** text below 16 px receives a body-text recommendation, not a WCAG failure.
- **Touch target:** controls inferred from layer names or prototype reactions below 24 × 24 px receive a review item. Actual hit areas, spacing and WCAG exceptions must be verified in implementation. AA/AAA selection continues to control text contrast thresholds.
- **Heading hierarchy:** H1–H6 or Heading 1–6 layer names are checked for downward level skips in layer-tree order within each top-level frame. Partial selections and semantic reading order require manual verification.
- **Text readability:** paragraphs with explicit line height below 1.5× and long all-uppercase text receive guidance. Language complexity and runtime text-spacing support are not assessed.
- **Control distinction:** inferred controls receive a manual boundary-contrast review with a suggestion to increase contrast or add a visible border where required.
- **Fix Color:** the manual checker adjusts its foreground. In Figma, supported failing text fills are recalculated from live state and adjusted to the selected threshold while preserving paint opacity. Fixes can be undone in Figma. No automatic fix is offered when the threshold cannot be reached at the existing opacity.

Each finding shows its category, measured values, recommendation and suggestion. Category/status filters help review the results. [WCAG target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) and [heading guidance](https://www.w3.org/WAI/tutorials/page-structure/headings/) explain the contextual checks.

Thresholds follow [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [enhanced contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html). Large text begins at 24 px regular or 56/3 px bold (weight >= 700). Pass/fail uses unrounded ratios.

## Structure and verification

- `src/`: React UI and pure contrast functions.
- `plugin/`: Figma sandbox, bounded traversal and scanner tests.
- `scripts/build-plugin.mjs`: sandbox bundle and portable manifest.
- `src/assets/logo.png`: original user-provided logo.

Before publishing, run tests and build, then check a real Figma document with solid, transparent, mixed-style, overlapping and hidden layers. Scanner tests use Figma-shaped fixtures and do not replace a Figma runtime smoke test.
