/// <reference types="@figma/plugin-typings" />
import { expect, it } from "vitest";
import { inspectHeadings, inspectTarget, inspectTypography } from "./checks";

it("offers only applicable typography fixes with an available uniform font", () => {
  const fontName = { family: "Inter", style: "Regular" };
  expect(
    inspectTypography(
      text("Small", { fontSize: 12, fontName, hasMissingFont: false }),
    )[0].fixAction,
  ).toBe("font-size");
  expect(
    inspectTypography(
      text("Small", { fontSize: 12, fontName, hasMissingFont: true }),
    )[0].fixAction,
  ).toBeUndefined();
  expect(
    inspectTypography(
      text("Paragraph", {
        fontName,
        characters: "Long paragraph. ".repeat(10),
        lineHeight: { unit: "PERCENT", value: 120 },
      }),
    )[0].fixAction,
  ).toBe("line-height");
  expect(
    inspectTypography(
      text("Uppercase", {
        fontName,
        characters: "THIS IS A LONG UPPERCASE SENTENCE",
      }),
    )[0].fixAction,
  ).toBeUndefined();
});
import {
  contrast,
  composite,
  parseHex,
  recommendColor,
} from "../src/lib/contrast";
const text = (name: string, extra = {}) =>
  ({
    id: name,
    name,
    type: "TEXT",
    fontSize: 16,
    characters: "Ordinary text",
    parent: { id: "page", type: "PAGE" },
    ...extra,
  }) as unknown as TextNode;
it("recommends quantized colors that meet AA and AAA", () => {
  for (const required of [4.5, 7]) {
    const background = parseHex("fff")!;
    const result = recommendColor(parseHex("a3a3a3")!, background, required)!;
    expect(contrast(parseHex(result)!, background)).toBeGreaterThanOrEqual(
      required,
    );
  }
});
it("does not offer an impossible transparent fix", () => {
  expect(
    recommendColor(parseHex("000")!, parseHex("fff")!, 4.5, 0.1),
  ).toBeUndefined();
  const result = recommendColor(parseHex("aaa")!, parseHex("fff")!, 4.5, 0.9)!;
  expect(
    contrast(
      composite(parseHex(result)!, parseHex("fff")!, 0.9),
      parseHex("fff")!,
    ),
  ).toBeGreaterThanOrEqual(4.5);
});
it("labels small text and dense paragraphs as advice", () => {
  expect(inspectTypography(text("Body", { fontSize: 12 }))[0]).toMatchObject({
    category: "font-size",
    status: "review",
  });
  expect(
    inspectTypography(
      text("Body", {
        characters: "A long paragraph. ".repeat(10),
        lineHeight: { unit: "PERCENT", value: 120 },
      }),
    )[0].category,
  ).toBe("readability");
  expect(inspectTypography(text("Body"))).toEqual([]);
});
it("checks only inferred interactive targets, with 24px boundary", () => {
  expect(
    inspectTarget(text("Button", { width: 23, height: 24 })).some(
      (f) => f.category === "touch-target",
    ),
  ).toBe(true);
  expect(
    inspectTarget(text("Button", { width: 24, height: 24 })).some(
      (f) => f.category === "touch-target",
    ),
  ).toBe(false);
  expect(inspectTarget(text("Decoration", { width: 10, height: 10 }))).toEqual(
    [],
  );
});
it("flags downward heading skips but allows returning to H2", () => {
  expect(inspectHeadings([text("H1"), text("H3")])).toHaveLength(1);
  expect(
    inspectHeadings([text("H1"), text("H2"), text("H3"), text("H2")]),
  ).toHaveLength(0);
  expect(inspectHeadings([text("Headline")])).toHaveLength(0);
});
