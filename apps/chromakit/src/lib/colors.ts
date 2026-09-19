import { converter, formatHex, formatHex8, parse, type Color } from "culori";

export const COLOR_FORMATS = [
  "HEX",
  "RGB",
  "RGBA",
  "HSL",
  "HSB",
  "OKLCH",
  "LCH",
  "CMYK",
] as const;
export type ColorFormat = (typeof COLOR_FORMATS)[number];
export const EXAMPLES: Record<ColorFormat, string> = {
  HEX: "#6366F1",
  RGB: "rgb(99, 102, 241)",
  RGBA: "rgba(99, 102, 241, 1)",
  HSL: "hsl(239 84% 67%)",
  HSB: "hsb(239 59% 95%)",
  OKLCH: "oklch(0.5854 0.2041 277.12)",
  LCH: "lch(49.05 78.02 292.89)",
  CMYK: "cmyk(59% 58% 0% 5%)",
};
const rgb = converter("rgb");
const hsl = converter("hsl");
const hsv = converter("hsv");
const oklch = converter("oklch");
const lch = converter("lch");
const clamp = (n: number) => Math.min(1, Math.max(0, n));
const round = (n: number, digits = 2) => Number(n.toFixed(digits));
const numberToken =
  /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?(%|deg|turn|rad|grad)?$/i;

function channel(token: string, scale = 1): number {
  if (!numberToken.test(token)) throw new Error("Use numeric color channels.");
  const value =
    Number.parseFloat(token) * (token.endsWith("%") ? scale / 100 : 1);
  if (!Number.isFinite(value))
    throw new Error("Color channels must be finite.");
  return value;
}
function ranged(token: string, max: number): number {
  if (/(deg|turn|rad|grad)$/i.test(token))
    throw new Error("Only hue accepts angle units.");
  const value = channel(token, max);
  if (value < 0 || value > max)
    throw new Error(`Channel must be between 0 and ${max}.`);
  return value;
}
function hue(token: string): number {
  token = token.toLowerCase();
  if (token.endsWith("%")) throw new Error("Hue must be an angle.");
  const n = channel(token);
  const degrees = token.endsWith("turn")
    ? n * 360
    : token.endsWith("grad")
      ? n * 0.9
      : token.endsWith("rad")
        ? (n * 180) / Math.PI
        : n;
  if (!Number.isFinite(degrees))
    throw new Error("Hue exceeds the supported numeric range.");
  return ((degrees % 360) + 360) % 360;
}

/** Parse only the selected format; do not silently reinterpret invalid input. */
function parseColorValue(input: string, format: ColorFormat): Color {
  const text = input.trim();
  if (format === "HEX") {
    if (!/^#?(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(text))
      throw new Error("Enter 3, 4, 6 or 8 HEX digits.");
    return parse(text.startsWith("#") ? text : `#${text}`)!;
  }
  const fn = text.match(/^([a-z]+)\((.*)\)$/i);
  const names: Record<Exclude<ColorFormat, "HEX">, string[]> = {
    RGB: ["rgb"],
    RGBA: ["rgba", "rgb"],
    HSL: ["hsl", "hsla"],
    HSB: ["hsb", "hsv"],
    OKLCH: ["oklch"],
    LCH: ["lch"],
    CMYK: ["cmyk"],
  };
  if (fn && !names[format].includes(fn[1].toLowerCase()))
    throw new Error(`Enter a ${format} value.`);
  const body = fn ? fn[2] : text;
  if (/[()]/.test(body) || /,\s*,|^\s*,|,\s*$/.test(body))
    throw new Error("Check the color syntax.");
  const slash = body.split("/");
  if (slash.length > 2) throw new Error("Use a single alpha channel.");
  const parts = slash[0].trim().split(/[\s,]+/);
  const count = format === "CMYK" ? 4 : 3;
  let alpha = slash.length === 2 ? ranged(slash[1].trim(), 1) : 1;
  if (
    parts.length === count + 1 &&
    slash.length === 1 &&
    ["RGBA", "RGB", "HSL"].includes(format)
  )
    alpha = ranged(parts.pop()!, 1);
  if (parts.length !== count)
    throw new Error(`Expected ${count} color channels.`);
  const [a, b, c, d] = parts;
  switch (format) {
    case "RGB":
    case "RGBA":
      return {
        mode: "rgb",
        r: ranged(a, 255) / 255,
        g: ranged(b, 255) / 255,
        b: ranged(c, 255) / 255,
        alpha,
      };
    case "HSL":
      return {
        mode: "hsl",
        h: hue(a),
        s: ranged(b, 100) / 100,
        l: ranged(c, 100) / 100,
        alpha,
      };
    case "HSB":
      return {
        mode: "hsv",
        h: hue(a),
        s: ranged(b, 100) / 100,
        v: ranged(c, 100) / 100,
        alpha,
      };
    case "OKLCH":
    case "LCH": {
      const lightness = ranged(a, format === "OKLCH" ? 1 : 100);
      if (/(deg|turn|rad|grad)$/i.test(b))
        throw new Error("Chroma must be numeric.");
      const chroma = channel(b, format === "OKLCH" ? 0.4 : 150);
      if (chroma < 0) throw new Error("Chroma cannot be negative.");
      return {
        mode: format === "OKLCH" ? "oklch" : "lch",
        l: lightness,
        c: chroma,
        h: hue(c),
        alpha,
      };
    }
    case "CMYK": {
      const cyan = ranged(a, 100) / 100,
        magenta = ranged(b, 100) / 100,
        yellow = ranged(c, 100) / 100,
        black = ranged(d, 100) / 100;
      return {
        mode: "rgb",
        r: (1 - cyan) * (1 - black),
        g: (1 - magenta) * (1 - black),
        b: (1 - yellow) * (1 - black),
        alpha,
      };
    }
  }
}

export function parseColor(input: string, format: ColorFormat): Color {
  const color = parseColorValue(input, format);
  const converted = rgb(color);
  if (
    ![converted.r, converted.g, converted.b, converted.alpha ?? 1].every(
      Number.isFinite,
    )
  ) {
    throw new Error("This color exceeds the supported numeric range.");
  }
  return color;
}

/** Only device-bound formats clip to sRGB. The source stays in its original space. */
export function srgb(color: Color) {
  const result = rgb(color);
  return {
    ...result,
    r: clamp(result.r),
    g: clamp(result.g),
    b: clamp(result.b),
  };
}
export function isOutsideSrgb(color: Color): boolean {
  const { r, g, b } = rgb(color);
  return [r, g, b].some((n) => n < -0.00001 || n > 1.00001);
}
export function serializeColor(color: Color, format: ColorFormat): string {
  const clipped = srgb(color);
  const alpha = color.alpha ?? 1;
  const suffix = alpha < 1 ? ` / ${round(alpha, 4)}` : "";
  const channels = [clipped.r, clipped.g, clipped.b].map((n) => round(n * 255));
  switch (format) {
    case "HEX":
      return (
        alpha < 1 ? formatHex8(clipped) : formatHex(clipped)
      ).toUpperCase();
    case "RGB":
      return alpha < 1
        ? `rgb(${channels.join(" ")}${suffix})`
        : `rgb(${channels.join(", ")})`;
    case "RGBA":
      return `rgba(${channels.join(", ")}, ${round(alpha, 4)})`;
    case "HSL": {
      const value = hsl(clipped);
      return `hsl(${round(value.h ?? 0)} ${round(value.s * 100)}% ${round(value.l * 100)}%${suffix})`;
    }
    case "HSB": {
      const value = hsv(clipped);
      return `hsb(${round(value.h ?? 0)} ${round(value.s * 100)}% ${round(value.v * 100)}%${suffix})`;
    }
    case "OKLCH":
    case "LCH": {
      const value = format === "OKLCH" ? oklch(color) : lch(color);
      const digits = format === "OKLCH" ? 4 : 2;
      return `${format.toLowerCase()}(${round(value.l, digits)} ${round(value.c, digits)} ${round(value.h ?? 0, 2)}${suffix})`;
    }
    case "CMYK": {
      const max = Math.max(clipped.r, clipped.g, clipped.b);
      const cmy =
        max === 0
          ? [0, 0, 0]
          : [clipped.r, clipped.g, clipped.b].map((n) => (max - n) / max);
      return `cmyk(${[...cmy, 1 - max].map((n) => `${round(n * 100)}%`).join(" ")}${suffix})`;
    }
  }
}

export function cssColor(color: Color, format: ColorFormat): string {
  return serializeColor(
    color,
    format === "HSB" || format === "CMYK" ? "RGB" : format,
  );
}
