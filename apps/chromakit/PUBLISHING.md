# Release checklist

Use this checklist when preparing a public GitHub release and submitting ChromaKit to the Figma Community.

## GitHub

1. Review the source code, MIT License, original asset rights, and any applicable third-party licenses or notices.

2. Install dependencies from the lockfile:

   ```bash
   pnpm install --frozen-lockfile
   ```

3. Run all project checks:

   ```bash
   pnpm format
   pnpm typecheck
   pnpm test
   pnpm build
   ```

4. Verify the production build locally and confirm that no development-only configuration, credentials, access tokens, or private Figma content are included.

5. Review and commit the release files yourself, then push them to the public repository.

6. Add or review the repository description, topics, README, and screenshots from the running plugin.

7. Create the release tag.

8. If useful, attach the contents of `apps/chromakit/dist/` as a ZIP to the GitHub release. The production manifest uses relative paths so the folder remains portable.

## Figma Community

1. Make sure two-factor authentication is enabled on the Figma account that will publish the plugin.

2. Register or create the plugin through Figma so that Figma assigns it a unique plugin ID.

3. Add the Figma-assigned `id` to `apps/chromakit/manifest.json` and rebuild the plugin.

   Never copy or publish using another plugin's ID.

4. Import `apps/chromakit/manifest.json` in the Figma desktop app and test the production build.

5. Verify all supported color formats and important interaction paths, including:

   - all eight source and target formats
   - invalid and malformed inputs
   - conversion boundaries and precision
   - opacity and alpha handling
   - the color picker
   - keyboard navigation
   - accessible control names
   - every copy action
   - close behavior
   - light and dark themes

6. Confirm that the plugin remains fully functional with:

   ```json
   "networkAccess": {
     "allowedDomains": ["none"]
   }
   ```

   Verify that the production bundle works without network access and does not depend on remote resources.

7. Prepare the Figma Community listing:

   - plugin name
   - description
   - category and relevant tags
   - plugin icon
   - cover or thumbnail
   - screenshots
   - support contact
   - repository link

8. Use the Figma source files for branding assets.

   Use `apps/chromakit/src/assets/logo.png` as the source for the published plugin icon and export it at Figma's currently requested dimensions when necessary.

   The Community publishing flow controls the published plugin icon. It is not configured through `manifest.json` or `figma.showUI()`.

9. Use the following description as a starting point:

   > Convert colors between HEX, RGB, RGBA, HSL, HSB, OKLCH, LCH, and CMYK. Copy individual values or ready-to-use CSS, SCSS, Tailwind, React, and JSON snippets. Runs locally without an account.

10. Include the following privacy statement in the listing where appropriate:

    > ChromaKit processes color values locally, does not collect analytics, does not send data to servers, and does not read your Figma document.

11. Clearly disclose the CMYK limitation:

    > CMYK conversion is approximate and does not use ICC color profiles.

12. Review Figma's current plugin publishing and review requirements immediately before submitting, since Community requirements may change over time.

13. Publish the plugin through Figma's plugin management flow using the account or team that should own the Community listing.

## Final verification

Before publishing either release, confirm that:

- the GitHub repository contains no secrets or private assets
- the committed lockfile matches the released dependencies
- all required checks pass
- the production plugin behaves correctly in Figma
- the Community listing accurately describes the plugin's capabilities, privacy behavior, and known limitations
