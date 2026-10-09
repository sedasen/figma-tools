/// <reference types="@figma/plugin-typings" />
import { describe, expect, it } from "vitest";
import { inspectText, scanSelection } from "./scan";
function fixture() {
  const page = { type: "PAGE", parent: null };
  const frame = {
    id: "frame",
    type: "FRAME",
    parent: page,
    visible: true,
    opacity: 1,
    blendMode: "PASS_THROUGH",
    effects: [],
    cornerRadius: 0,
    fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
    absoluteBoundingBox: { x: 0, y: 0, width: 200, height: 100 },
    children: [] as unknown[],
  };
  const text = {
    id: "text",
    name: "Label",
    type: "TEXT",
    parent: frame,
    visible: true,
    characters: "Hello",
    fontSize: 16,
    fontWeight: 400,
    opacity: 1,
    blendMode: "NORMAL",
    effects: [],
    fills: [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 1 }],
    absoluteBoundingBox: { x: 20, y: 20, width: 80, height: 20 },
  };
  frame.children = [text];
  return { frame, text, node: text as unknown as TextNode };
}
describe("selection scanner", () => {
  it("checks solid text backgrounds", () => {
    expect(inspectText(fixture().node, "AA")).toMatchObject({
      status: "pass",
      ratio: 21,
      required: 4.5,
    });
  });
  it("composites transparent text", () => {
    const { node, text } = fixture();
    text.fills[0].opacity = 0.2;
    expect(inspectText(node, "AA").status).toBe("fail");
  });
  it("measures text in the safe interior of rounded cards", () => {
    const { frame, node, text } = fixture();
    frame.cornerRadius = 16;
    expect(inspectText(node, "AA").status).toBe("pass");
    text.fills[0].color = { r: 163 / 255, g: 163 / 255, b: 163 / 255 };
    expect(inspectText(node, "AA")).toMatchObject({
      status: "fail",
      required: 4.5,
    });
    text.absoluteBoundingBox.x = 0;
    text.absoluteBoundingBox.y = 0;
    expect(inspectText(node, "AA").status).toBe("review");
  });
  it("allows a drop shadow behind an opaque card but not an inner shadow", () => {
    const { frame, node } = fixture();
    Object.assign(frame, { effects: [{ type: "DROP_SHADOW", visible: true }] });
    expect(inspectText(node, "AA").status).toBe("pass");
    Object.assign(frame, {
      effects: [{ type: "INNER_SHADOW", visible: true }],
    });
    expect(inspectText(node, "AA").status).toBe("review");
  });
  it("does not certify unknown backgrounds", () => {
    const { frame, node } = fixture();
    frame.fills = [];
    expect(inspectText(node, "AA").status).toBe("review");
    expect(inspectText(node, "AA").suggestion).toContain("Contrast Checker");
  });
  it("flags overlapping layers and ancestor opacity", () => {
    const { frame, node, text } = fixture();
    frame.children.push({ ...text, id: "overlap" });
    expect(inspectText(node, "AA").status).toBe("review");
    frame.children = [text];
    frame.opacity = 0.5;
    expect(inspectText(node, "AA").status).toBe("review");
  });
  it("deduplicates selections and skips hidden ancestors", () => {
    const { frame, node } = fixture();
    expect(
      scanSelection([node, frame as unknown as SceneNode], "AA").findings,
    ).toHaveLength(1);
    frame.visible = false;
    expect(scanSelection([node], "AA").findings).toHaveLength(0);
  });
});
