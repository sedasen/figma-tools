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
