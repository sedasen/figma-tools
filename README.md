# Figma Tools

A collection of independent Figma plugins built with React, TypeScript, Vite, Tailwind CSS, shadcn/ui, and Hugeicons. Each plugin has its own manifest and release; shared components and theme live in one workspace package.

## Workspace

```text
apps/
  chromakit/                 # Implemented color conversion plugin
  token-inspector/           # Planned
  spacing-checker/           # Planned
  design-linter/             # Planned
  fake-data-generator/       # Planned; name to be decided
  accessibility-checker/     # Planned
packages/
  ui/                       # Shared components, utilities, and theme
  figma-utils/              # Planned Figma helpers
  data-generators/          # Planned data-generation utilities
  accessibility/            # Planned accessibility checks
package.json
pnpm-workspace.yaml
pnpm-lock.yaml
```

Planned folders contain scope notes only. They become workspace packages when implemented; no placeholder plugin is included in builds. ChromaKit-specific color conversion and code generation remain inside ChromaKit.

## Development

Use Node.js 22.12.0 or newer and pnpm 11.19.0 (declared in `package.json`). Run commands from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm typecheck
pnpm test
pnpm build
```

`dev` and `preview` open ChromaKit. `build`, `typecheck`, and `test` run across implemented workspace packages. Use `pnpm --filter @figma-tools/chromakit build` to build only ChromaKit. `pnpm format` formats the repository; `pnpm format:check` verifies formatting.

## Run ChromaKit in Figma

After `pnpm build`, import `apps/chromakit/manifest.json` using Figma desktop's development plugin menu. If previously imported from the repository root, import it again from its new location. The portable release lives in `apps/chromakit/dist/`, including its own manifest.

See [ChromaKit features and usage](apps/chromakit/README.md), [publishing checklist](apps/chromakit/PUBLISHING.md), [contributing guidelines](CONTRIBUTING.md), and [third-party notices](THIRD_PARTY_NOTICES.md).

## Adding a plugin

Create its own `package.json` named `@figma-tools/<plugin>`, manifest, UI, sandbox entry point, and build scripts. Add `@figma-tools/ui` with `workspace:*`, reuse the shared theme, and register shared component sources with Tailwind. Use ChromaKit's Vite and shadcn configuration as a working reference. Each plugin should produce a self-contained `dist/` and receive its own Figma plugin ID.

Shared packages must not depend on apps. Keep browser UI and Figma sandbox code separate, and introduce reusable domain helpers when their requirements are clear. pnpm workspaces handle the current build orchestration; no additional task runner is required.

The project display name is **Figma Tools**; the root package name is `figma-tools`. Renaming the GitHub repository or local checkout is a separate operation.
