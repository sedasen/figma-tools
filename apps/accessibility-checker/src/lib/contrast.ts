export type RGB = { r: number; g: number; b: number };

export function toHex(color: RGB): string {
  return (
    "#" +
    [color.r, color.g, color.b]
      .map((n) =>
        Math.round(n * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
      .toUpperCase()
  );
}

// Search quantized colors so the actual applied HEX value meets the threshold.
export function recommendColor(
  foreground: RGB,
  background: RGB,
  required: number,
  alpha = 1,
): string | undefined {
  const candidates: { hex: string; distance: number }[] = [];
  for (const end of [0, 1]) {
    for (let step = 0; step <= 255; step++) {
      const t = step / 255;
      const hex = toHex({
        r: foreground.r + (end - foreground.r) * t,
        g: foreground.g + (end - foreground.g) * t,
        b: foreground.b + (end - foreground.b) * t,
      });
      const color = parseHex(hex)!;
      if (
        contrast(composite(color, background, alpha), background) >= required
      ) {
        candidates.push({
          hex,
          distance:
            (color.r - foreground.r) ** 2 +
            (color.g - foreground.g) ** 2 +
            (color.b - foreground.b) ** 2,
        });
        break;
      }
    }
  }
  return candidates.sort((a, b) => a.distance - b.distance)[0]?.hex;
}

export function parseHex(value: string): RGB | null {
  const hex = value.trim().replace(/^#/, "");
  if (!/^(?:[\da-f]{3}|[\da-f]{6})$/i.test(hex)) return null;
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
  return {
    r: parseInt(full.slice(0, 2), 16) / 255,
    g: parseInt(full.slice(2, 4), 16) / 255,
    b: parseInt(full.slice(4, 6), 16) / 255,
  };
}

export function contrast(a: RGB, b: RGB): number {
  const luminance = (c: RGB) => {
    const linear = (n: number) =>
      n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
    return 0.2126 * linear(c.r) + 0.7152 * linear(c.g) + 0.0722 * linear(c.b);
  };
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

export function composite(
  foreground: RGB,
  background: RGB,
  alpha: number,
): RGB {
  return {
    r: foreground.r * alpha + background.r * (1 - alpha),
    g: foreground.g * alpha + background.g * (1 - alpha),
    b: foreground.b * alpha + background.b * (1 - alpha),
  };
}

export function threshold(
  size: number,
  bold: boolean,
  level: "AA" | "AAA",
): number {
  const large = size >= 24 || (bold && size >= 56 / 3);
  return level === "AAA" ? (large ? 4.5 : 7) : large ? 3 : 4.5;
}
