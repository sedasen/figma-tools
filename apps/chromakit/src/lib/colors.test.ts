import { describe, expect, it } from "vitest";
import { converter } from "culori";
import {
  COLOR_FORMATS,
  cssColor,
  isOutsideSrgb,
  parseColor,
  serializeColor,
} from "./colors";
import { CODE_FORMATS, generateCode } from "./code";

const rgb = converter("rgb");
describe("color conversion", () => {
  it.each([
    ["OKLCH", "oklch(0.5854 0.2041 277.12)"],
    ["LCH", "lch(49.05 78.02 292.89)"],
  ] as const)(
    "formats %s with numeric lightness and compact precision",
    (format, expected) => {
      const color = parseColor("#6366F1", "HEX");
      expect(serializeColor(color, format)).toBe(expected);
      expect(serializeColor({ ...color, alpha: 0.5 }, format)).toBe(
        expected.replace(")", " / 0.5)"),
      );
      expect(generateCode(color, format, "CSS")).toBe(`color: ${expected};`);
      expect(
        JSON.parse(generateCode(color, format, "JSON"))[format.toLowerCase()],
      ).toBe(expected);
    },
  );
  it("matches known sRGB red, white and black values", () => {
    const red = parseColor("#ff0000", "HEX");
    expect(serializeColor(red, "RGB")).toBe("rgb(255, 0, 0)");
    expect(serializeColor(red, "HSL")).toBe("hsl(0 100% 50%)");
    expect(serializeColor(red, "HSB")).toBe("hsb(0 100% 100%)");
    expect(serializeColor(red, "CMYK")).toBe("cmyk(0% 100% 100% 0%)");
    expect(serializeColor(parseColor("#000", "HEX"), "CMYK")).toBe(
      "cmyk(0% 0% 0% 100%)",
    );
    expect(serializeColor(parseColor("#fff", "HEX"), "CMYK")).toBe(
      "cmyk(0% 0% 0% 0%)",
    );
    const ok = converter("oklch")(red);
    expect(ok.l).toBeCloseTo(0.627955, 5);
    expect(ok.c).toBeCloseTo(0.257683, 5);
    expect(ok.h).toBeCloseTo(29.2339, 3);
    const lab = converter("lch")(red);
    expect(lab.l).toBeCloseTo(54.29, 1);
  });
  for (const hex of [
    "#6366f1",
    "#000",
    "#fff",
    "#f008",
    "#1d3a77",
    "#12345600",
  ]) {
    for (const format of COLOR_FORMATS) {
      it(`round-trips ${hex} through ${format}`, () => {
        const original = parseColor(hex, "HEX");
        const actual = rgb(
          parseColor(serializeColor(original, format), format),
        );
        const expected = rgb(original);
        for (const key of ["r", "g", "b"] as const)
          expect(actual[key]).toBeCloseTo(expected[key], 3);
        expect(actual.alpha ?? 1).toBeCloseTo(expected.alpha ?? 1, 3);
      });
    }
  }
  it("parses modern CSS channels, alpha and angle units", () => {
    expect(
      serializeColor(parseColor("rgb(100% 0% 0% / 50%)", "RGB"), "RGBA"),
    ).toBe("rgba(255, 0, 0, 0.5)");
    expect(
      serializeColor(parseColor("hsl(-120deg 100% 50%)", "HSL"), "HEX"),
    ).toBe("#0000FF");
    expect(
      serializeColor(parseColor("hsl(0.5turn 100% 50%)", "HSL"), "HEX"),
    ).toBe("#00FFFF");
    expect(serializeColor(parseColor("cmyk(100 0 0 0)", "CMYK"), "HEX")).toBe(
      "#00FFFF",
    );
  });
  it("retains wide-gamut sources and clips only sRGB destinations", () => {
    const wide = parseColor("oklch(70% 0.4 30)", "OKLCH");
    expect(isOutsideSrgb(wide)).toBe(true);
    expect(serializeColor(wide, "OKLCH")).toBe("oklch(0.7 0.4 30)");
    expect(serializeColor(wide, "HEX")).toMatch(/^#[0-9A-F]{6}$/);
    expect(wide.mode).toBe("oklch");
  });
  it.each([
    ["#zzzzzz", "HEX"],
    ["#12345", "HEX"],
    ["", "HEX"],
    ["red", "HEX"],
    ["rgb(256, 0, 0)", "RGB"],
    ["rgb(-1, 0, 0)", "RGB"],
    ["1,2", "RGB"],
    ["rgb(1,,2,3)", "RGB"],
    ["1deg 2 3", "RGB"],
    ["rgb(1 2 3)", "HSL"],
    ["rgba(1 2 3 / 2)", "RGBA"],
    ["hsl(0 101% 50%)", "HSL"],
    ["oklch(101% 0.2 30)", "OKLCH"],
    ["oklch(50% -1 30)", "OKLCH"],
    ["cmyk(0 0 0 101)", "CMYK"],
    ["NaN 0 0", "RGB"],
    ["1e999 0 0", "RGB"],
    ["oklch(50% 1e308 30)", "OKLCH"],
    ["hsl(1e308turn 50% 50%)", "HSL"],
  ] as const)("rejects invalid %s in %s", (input, format) => {
    expect(() => parseColor(input, format)).toThrow();
  });
});

describe("code generation", () => {
  const color = parseColor("#6366F180", "HEX");
  it("returns valid JSON with all formats", () => {
    const result = JSON.parse(generateCode(color, "HEX", "JSON"));
    expect(Object.keys(result)).toHaveLength(8);
    expect(result.hex).toBe("#6366F180");
  });
  it("uses CSS-compatible RGB for HSB and CMYK", () => {
    for (const target of ["HSB", "CMYK"] as const) {
      expect(cssColor(color, target)).toContain("rgb(");
      for (const language of CODE_FORMATS.filter((v) => v !== "JSON"))
        expect(generateCode(color, target, language)).not.toMatch(
          /hsb\(|cmyk\(/,
        );
    }
  });
  it("generates Tailwind v4 theme tokens and JSX style syntax", () => {
    expect(generateCode(color, "HEX", "Tailwind")).toContain(
      "--color-primary: #6366F180;",
    );
    expect(generateCode(color, "HEX", "React (JSX)")).toContain(
      "style={{ color: '#6366F180' }}",
    );
  });
});
