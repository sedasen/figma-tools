import type { Finding } from "../src/lib/messages";

function advisory(
  node: SceneNode,
  category: Finding["category"],
  detail: string,
  suggestion: string,
  current: string,
  recommended: string,
): Finding {
  return {
    id: node.id,
    name: node.name,
    category,
    status: "review",
    detail,
    suggestion,
    current,
    recommended,
  };
}

export function inspectTypography(node: TextNode): Finding[] {
  const result: Finding[] = [];
  if (typeof node.fontSize === "number" && node.fontSize < 16)
    result.push(
      advisory(
        node,
        "font-size",
        "Small text may be difficult to read.",
        "Try 16 px for body text; this is guidance, not a WCAG minimum.",
        `${node.fontSize} px`,
        "16 px body text (guidance)",
      ),
    );
  const lineHeight = node.lineHeight;
  if (
    typeof node.fontSize === "number" &&
    lineHeight &&
    typeof lineHeight !== "symbol" &&
    lineHeight.unit !== "AUTO"
  ) {
    const ratio =
      lineHeight.unit === "PERCENT"
        ? lineHeight.value / 100
        : lineHeight.value / node.fontSize;
    if (node.characters.length > 80 && ratio < 1.5)
      result.push(
        advisory(
          node,
          "readability",
          "Dense paragraph spacing may make reading harder.",
          "Try 1.5× line height for easier reading.",
          `${ratio.toFixed(2)}× line height`,
          "1.5× line height (guidance)",
        ),
      );
  }
  const letters = node.characters.replace(/[^\p{L}]/gu, "");
  if (
    letters.length >= 20 &&
    letters === letters.toLocaleUpperCase() &&
    letters !== letters.toLocaleLowerCase()
  )
    result.push(
      advisory(
        node,
        "readability",
        "Long uppercase text can be harder to scan.",
        "Use sentence case, except for acronyms or brand names.",
        "All uppercase",
        "Sentence case (guidance)",
      ),
    );
  return result.map((finding) => ({
    ...finding,
    fixAction:
      typeof node.fontName === "object" && !node.hasMissingFont
        ? finding.category === "font-size"
          ? ("font-size" as const)
          : finding.current?.endsWith("line height")
            ? ("line-height" as const)
            : undefined
        : undefined,
  }));
}

export function inspectTarget(node: SceneNode): Finding[] {
  const namedControl =
    /(?:^|[\s/_-])(button|btn|link|checkbox|radio|switch|tab)(?:$|[\s/_-])/i.test(
      node.name,
    );
  const hasInteraction =
    "reactions" in node && (node.reactions?.length ?? 0) > 0;
  if (!namedControl && !hasInteraction) return [];
  const result: Finding[] = [];
  if (node.width < 24 || node.height < 24)
    result.push(
      advisory(
        node,
        "touch-target",
        "This possible control may be difficult to tap.",
        "Aim for a 24 × 24 px hit area. Verify spacing and exceptions.",
        `${Math.round(node.width)} × ${Math.round(node.height)} px`,
        "24 × 24 px (AA, exceptions apply)",
      ),
    );
  result.push(
    advisory(
      node,
      "contrast",
      "Control boundary contrast has not been measured automatically.",
      "Check adjacent colors. Increase contrast or add a visible border if needed.",
      "Control inferred from name or prototype",
      "3:1 boundary contrast where required",
    ),
  );
  return result;
}

export function inspectHeadings(nodes: readonly TextNode[]): Finding[] {
  const groups = new Map<string, TextNode[]>();
  for (const node of nodes) {
    let root: BaseNode = node;
    while (root.parent && root.parent.type !== "PAGE") root = root.parent;
    const key = root.type === "TEXT" ? (root.parent?.id ?? root.id) : root.id;
    const group = groups.get(key) ?? [];
    group.push(node);
    groups.set(key, group);
  }
  const result: Finding[] = [];
  for (const group of groups.values()) {
    let previous = 0;
    for (const node of group) {
      const match = /(?:^|[\s/_-])(?:h|heading\s*)([1-6])(?:$|[\s/_-])/i.exec(
        node.name,
      );
      if (!match) continue;
      const level = Number(match[1]);
      if (level > previous + 1)
        result.push(
          advisory(
            node,
            "heading",
            previous
              ? "A heading level may have been skipped."
              : "The selected heading sequence starts below H1.",
            "Avoid skipped heading levels. Verify the full page’s reading order and markup.",
            previous ? `H${previous} → H${level}` : `Starts at H${level}`,
            previous
              ? `H${previous + 1} before H${level}`
              : "Review full-page heading structure",
          ),
        );
      previous = level;
    }
  }
  return result;
}
