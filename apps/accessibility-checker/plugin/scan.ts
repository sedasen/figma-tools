import {
  composite,
  contrast,
  threshold,
  toHex,
  recommendColor,
  type RGB,
} from "../src/lib/contrast";
import { inspectTypography, inspectTarget, inspectHeadings } from "./checks";
import type { Finding } from "../src/lib/messages";

function solid(
  paints: readonly Paint[] | PluginAPI["mixed"],
): SolidPaint | null {
  if (typeof paints === "symbol") return null;
  const visible = paints.filter((paint) => paint.visible !== false);
  return visible.length === 1 &&
    visible[0].type === "SOLID" &&
    (!visible[0].blendMode || visible[0].blendMode === "NORMAL")
    ? visible[0]
    : null;
}

function overlaps(a: SceneNode, b: SceneNode): boolean {
  const x = a.absoluteBoundingBox,
    y = b.absoluteBoundingBox;
  return (
    !x ||
    !y ||
    (x.x < y.x + y.width &&
      x.x + x.width > y.x &&
      x.y < y.y + y.height &&
      x.y + x.height > y.y)
  );
}

// Conservatively use the rectangle's inner cross, outside all rounded corners.
function coversText(parent: SceneNode, node: TextNode): boolean {
  const bounds = parent.absoluteBoundingBox,
    text = node.absoluteBoundingBox;
  if (!bounds || !text) return false;
  if ("rotation" in parent && parent.rotation !== 0) return false;
  const left = text.x - bounds.x,
    top = text.y - bounds.y;
  const right = bounds.x + bounds.width - text.x - text.width;
  const bottom = bounds.y + bounds.height - text.y - text.height;
  if (Math.min(left, top, right, bottom) < 0) return false;
  if (!("cornerRadius" in parent)) return true;
  let radius: number;
  if (typeof parent.cornerRadius === "number") radius = parent.cornerRadius;
  else if ("topLeftRadius" in parent)
    radius = Math.max(
      parent.topLeftRadius,
      parent.topRightRadius,
      parent.bottomLeftRadius,
      parent.bottomRightRadius,
    );
  else return false;
  return (
    (left >= radius && right >= radius) || (top >= radius && bottom >= radius)
  );
}

export function inspectText(node: TextNode, level: "AA" | "AAA"): Finding {
  const base = { id: node.id, name: node.name, category: "contrast" as const };
  const review = (detail: string, suggestion: string): Finding => ({
    ...base,
    status: "review",
    detail,
    suggestion,
  });
  if (typeof node.fontSize !== "number" || typeof node.fontWeight !== "number")
    return review(
      "Mixed text styles need manual review.",
      "Check each text style separately using its size and weight.",
    );
  const foreground = solid(node.fills);
  if (!foreground)
    return review(
      "Mixed, image or gradient text fills need manual review.",
      "Test the lowest-contrast color pair in Contrast Checker.",
    );
  let background: RGB | null = null;
  let current: SceneNode = node;
  while (true) {
    if (
      ("opacity" in current && current.opacity !== 1) ||
      ("blendMode" in current &&
        !["NORMAL", "PASS_THROUGH"].includes(current.blendMode)) ||
      ("effects" in current &&
        current.effects.some(
          (effect) =>
            effect.visible !== false &&
            !(
              background &&
              current.id !== node.id &&
              effect.type === "DROP_SHADOW"
            ),
        )) ||
      ("isMask" in current && current.isMask)
    )
      return review(
        "Opacity, effects, masks or blending need manual review.",
        "Sample colors after effects and blending. Test them in Contrast Checker.",
      );
    const parent: BaseNode | null = current.parent;
    if (!parent || parent.type === "DOCUMENT") break;
    if (parent.type === "PAGE") break;
    if (!("children" in parent))
      return review(
        "Unsupported background container.",
        "Test the visible text and background colors in Contrast Checker.",
      );
    if (
      parent.children.some(
        (sibling) =>
          sibling.id !== current.id &&
          sibling.visible &&
          (("isMask" in sibling && sibling.isMask) || overlaps(sibling, node)),
      )
    )
      return review(
        "Overlapping layers need manual background review.",
        "Check overlapping layers, then test the visible colors in Contrast Checker.",
      );
    if (!background && "fills" in parent) {
      const fills = parent.fills;
      if (typeof fills === "symbol")
        return review(
          "Mixed background fills need manual review.",
          "Check each background region and use the lowest ratio.",
        );
      if (fills.some((paint) => paint.visible !== false)) {
        const paint = solid(fills);
        if (!paint || (paint.opacity ?? 1) !== 1)
          return review(
            "Use manual contrast for transparent, image or gradient backgrounds.",
            "Test text against the lightest and darkest background areas.",
          );
        if (!coversText(parent, node))
          return review(
            "Text near or outside background edges needs manual review.",
            "Check each surface behind the text, or move it onto a uniform background.",
          );
        background = paint.color;
      }
    }
    current = parent;
  }
  if (!background)
    return review(
      "No explicit solid background found. Check the color pair manually.",
      "Add a solid background or test the intended colors in Contrast Checker.",
    );
  const ratio = contrast(
    composite(foreground.color, background, foreground.opacity ?? 1),
    background,
  );
  const required = threshold(node.fontSize, node.fontWeight >= 700, level);
  return {
    ...base,
    ratio,
    required,
    foreground: toHex(foreground.color),
    background: toHex(background),
    fixColor:
      ratio < required
        ? recommendColor(
            foreground.color,
            background,
            required,
            foreground.opacity ?? 1,
          )
        : undefined,
    suggestion:
      ratio < required
        ? "Increase the text contrast against its background."
        : undefined,
    status: ratio >= required ? "pass" : "fail",
    detail: `${level} text contrast · minimum ${required}:1`,
  };
}

export function scanSelection(
  selection: readonly SceneNode[],
  level: "AA" | "AAA",
) {
  const findings: Finding[] = [],
    visited = new Set<string>();
  const stack = [...selection].reverse();
  const headings: TextNode[] = [];
  let count = 0;
  while (stack.length && count < 5000 && findings.length < 500) {
    const node = stack.pop()!;
    if (visited.has(node.id)) continue;
    visited.add(node.id);
    count++;
    let ancestor: BaseNode | null = node;
    let hidden = false;
    while (ancestor) {
      if ("visible" in ancestor && !ancestor.visible) {
        hidden = true;
        break;
      }
      ancestor = ancestor.parent;
    }
    if (hidden) continue;
    if (node.type === "TEXT" && node.characters.trim()) {
      findings.push(inspectText(node, level), ...inspectTypography(node));
      headings.push(node);
    }
    findings.push(...inspectTarget(node));
    if ("children" in node) stack.push(...[...node.children].reverse());
  }
  findings.push(...inspectHeadings(headings));
  return {
    findings: findings.slice(0, 500),
    truncated: stack.length > 0 || findings.length > 500,
  };
}
