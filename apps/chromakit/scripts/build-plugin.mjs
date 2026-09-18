import { build } from "esbuild";
import { readFile, writeFile } from "node:fs/promises";

await build({
  entryPoints: ["plugin/main.ts"],
  outfile: "dist/plugin.js",
  bundle: true,
  target: "es2020",
  format: "iife",
  minify: true,
});
const manifest = JSON.parse(await readFile("manifest.json", "utf8"));
await writeFile(
  "dist/manifest.json",
  JSON.stringify(
    { ...manifest, main: "plugin.js", ui: "index.html" },
    null,
    2,
  ) + "\n",
);
console.log("Figma plugin built in dist/.");
