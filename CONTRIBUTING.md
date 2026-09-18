# 🤝 Contributing

Thanks for your interest in contributing to Figma Tools.

Use pnpm and the Node.js version documented in the README.

For small, focused fixes, feel free to open a pull request directly. For larger changes, new behavior, or changes that affect the user experience, start with an issue describing the problem and proposed direction.

## 🛠️ Development guidelines

- Keep color math, conversions, and parsing in `apps/chromakit/src/lib`. These utilities should remain framework-agnostic and independent of React and Figma APIs.
- Keep shadcn's native component behavior and neutral color tokens. Use Hugeicons for icons.
- Preserve keyboard support, focus behavior, and accessible names for every interactive control.
- Avoid unnecessary dependencies. When dependencies change, include the updated pnpm lockfile.

## ✅ Tests

Add regression tests for relevant edge cases, including:

- invalid input and conversion errors
- minimum and maximum boundaries
- precision and rounding
- alpha handling

Before submitting a pull request, run:

```sh
pnpm format
pnpm typecheck
pnpm test
pnpm build
```

All checks should pass.

## 🧩 UI and plugin verification

For ChromaKit, verify the 512 × 656 plugin UI in a browser in both light and dark themes.

Also build and test the plugin in Figma to confirm that the production build behaves as expected.

## 🔀 Pull requests

Keep pull requests focused and describe:

- what changed
- why the change was needed
- how the change was verified

Never include access tokens, credentials, or private Figma content in issues, pull requests, screenshots, fixtures, or test data.

## ⚖️ License

By contributing, you agree that your contributions are licensed under the MIT License.

## Workspace boundaries

Each plugin owns its manifest, release version, sandbox code, and build output under `apps/<plugin>`. Shared UI belongs in `packages/ui`; product-specific behavior stays in its app. Add other shared packages when a concrete use case exists. Planned folders are not runnable plugins.

Run `pnpm --filter @figma-tools/chromakit dev` for ChromaKit. Root checks cover all implemented workspaces. See [ChromaKit publishing](apps/chromakit/PUBLISHING.md) for its release checklist.
