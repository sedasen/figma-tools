# @figma-tools/ui

Shared shadcn components, Hugeicons wrappers, class-name utilities, and neutral light/dark theme. This private package exports TypeScript source for each app to bundle; it does not need a separate build.

Import components from `@figma-tools/ui/components/button` and styles from `@figma-tools/ui/styles/globals.css`. Each consuming app must register this package as a Tailwind source (see ChromaKit). Keep product-specific components and styles inside their app.
