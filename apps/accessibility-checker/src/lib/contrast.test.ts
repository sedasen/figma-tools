import { describe, expect, it } from "vitest";
import { composite, contrast, parseHex, threshold } from "./contrast";
describe("WCAG contrast", () => {
  it("has 21:1 and 1:1 endpoints and is symmetric", () => {
    const black = parseHex("#000")!,
      white = parseHex("fff")!;
    expect(contrast(black, white)).toBe(21);
    expect(contrast(white, black)).toBe(21);
    expect(contrast(white, white)).toBe(1);
  });
  it("rejects malformed and unsupported alpha inputs", () => {
    for (const input of ["", "#12", "gggggg", "#000000ff", "red"])
      expect(parseHex(input)).toBeNull();
    expect(parseHex(" #abc ")).toEqual(parseHex("#aabbcc"));
  });
  it("does not round a failing ratio up to a pass", () => {
    expect(contrast(parseHex("#777")!, parseHex("#fff")!)).toBeLessThan(4.5);
    expect(contrast(parseHex("#767676")!, parseHex("#fff")!)).toBeGreaterThan(
      4.5,
    );
  });
  it("uses point-to-pixel large text boundaries", () => {
    expect(threshold(23.99, false, "AA")).toBe(4.5);
    expect(threshold(24, false, "AA")).toBe(3);
    expect(threshold(18.66, true, "AA")).toBe(4.5);
    expect(threshold(56 / 3, true, "AAA")).toBe(4.5);
    expect(threshold(16, false, "AAA")).toBe(7);
  });
  it("composites transparent text", () => {
    expect(composite(parseHex("000")!, parseHex("fff")!, 0.5)).toEqual({
      r: 0.5,
      g: 0.5,
      b: 0.5,
    });
  });
});
