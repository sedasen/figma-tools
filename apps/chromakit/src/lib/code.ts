import type { Color } from "culori";
import {
  cssColor,
  serializeColor,
  COLOR_FORMATS,
  type ColorFormat,
} from "./colors";

export const CODE_FORMATS = [
  "CSS",
  "SCSS",
  "Tailwind",
  "React (JSX)",
  "JSON",
] as const;
export type CodeFormat = (typeof CODE_FORMATS)[number];

export function generateCode(
  color: Color,
  target: ColorFormat,
  language: CodeFormat,
): string {
  const value = cssColor(color, target);
  switch (language) {
    case "CSS":
      return `color: ${value};`;
    case "SCSS":
      return `$color-primary: ${value};\n\n.element {\n  color: $color-primary;\n}`;
    case "Tailwind":
      return `@theme {\n  --color-primary: ${value};\n}\n\n/* Usage: text-primary, bg-primary, border-primary */`;
    case "React (JSX)":
      return `<div style={{ color: '${value}' }}>\n  ChromaKit\n</div>`;
    case "JSON":
      return JSON.stringify(
        Object.fromEntries(
          COLOR_FORMATS.map((format) => [
            format.toLowerCase(),
            serializeColor(color, format),
          ]),
        ),
        null,
        2,
      );
  }
}
