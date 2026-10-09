import { scanSelection, inspectText } from "./scan";
import { parseHex } from "../src/lib/contrast";
import { inspectTypography } from "./checks";
import type { PluginResponse } from "../src/lib/messages";
import { PUBLIC_LINKS, type PublicLink } from "../src/lib/links";
const send = (message: PluginResponse) => figma.ui.postMessage(message);
const selection = () => {
  const nodes = figma.currentPage.selection;
  allowedIds.clear();
  send({
    type: "selection",
    count: nodes.length,
    nodes: nodes
      .slice(0, 50)
      .map((node) => ({ id: node.id, name: node.name, type: node.type })),
  });
};

figma.on("selectionchange", selection);
figma.on("currentpagechange", selection);
let allowedIds = new Set<string>();
let scanRoots: readonly SceneNode[] = [];
let scanLevel: "AA" | "AAA" = "AA";
figma.ui.onmessage = async (message: unknown) => {
  if (!message || typeof message !== "object" || !("type" in message)) return;
  try {
    if (
      message.type === "open-link" &&
      "key" in message &&
      typeof message.key === "string" &&
      Object.prototype.hasOwnProperty.call(PUBLIC_LINKS, message.key)
    ) {
      const url = PUBLIC_LINKS[message.key as PublicLink];
      if (url.startsWith("https://")) figma.openExternal(url);
      return;
    }
    if (message.type === "ready") selection();
    if (
      message.type === "scan" &&
      "level" in message &&
      (message.level === "AA" || message.level === "AAA")
    ) {
      if (figma.currentPage.selection.length !== 1) {
        send({
          type: "error",
          message: "Select exactly one frame or layer to check.",
        });
        return;
      }
      const result = scanSelection(figma.currentPage.selection, message.level);
      scanRoots = [...figma.currentPage.selection];
      scanLevel = message.level;
      allowedIds = new Set(result.findings.map((finding) => finding.id));
      send({ type: "results", ...result });
    }
    if (
      message.type === "fix-typography" &&
      "id" in message &&
      typeof message.id === "string" &&
      allowedIds.has(message.id) &&
      "action" in message &&
      (message.action === "font-size" || message.action === "line-height")
    ) {
      const node = await figma.getNodeByIdAsync(message.id);
      if (
        !node ||
        node.type !== "TEXT" ||
        node.removed ||
        node.locked ||
        node.hasMissingFont ||
        typeof node.fontName === "symbol"
      )
        throw new Error("Unavailable text");
      const font = node.fontName;
      await figma.loadFontAsync(font);
      if (
        node.removed ||
        node.locked ||
        !allowedIds.has(node.id) ||
        typeof node.fontName === "symbol" ||
        node.fontName.family !== font.family ||
        node.fontName.style !== font.style ||
        !inspectTypography(node).some(
          (finding) => finding.fixAction === message.action,
        )
      ) {
        send({
          type: "error",
          message:
            "This text changed or cannot be fixed automatically. Check the selection again.",
        });
        return;
      }
      if (message.action === "font-size") node.fontSize = 16;
      else node.lineHeight = { unit: "PERCENT", value: 150 };
      figma.commitUndo();
      const result = scanSelection(
        scanRoots.filter((root) => !root.removed),
        scanLevel,
      );
      allowedIds = new Set(result.findings.map((finding) => finding.id));
      send({ type: "results", ...result });
      figma.notify(
        "Text updated. Review wrapping and layout; Undo is available in Figma.",
      );
    }
    if (
      message.type === "fix-color" &&
      "id" in message &&
      typeof message.id === "string" &&
      allowedIds.has(message.id)
    ) {
      const node = await figma.getNodeByIdAsync(message.id);
      if (!node || node.type !== "TEXT" || node.removed || node.locked)
        throw new Error("Unavailable layer");
      // Recalculate from live paints, never trust a color sent by the UI.
      const finding = inspectText(node, scanLevel);
      if (!finding.fixColor || typeof node.fills === "symbol") {
        send({
          type: "error",
          message:
            "This layer changed or cannot be fixed automatically. Scan again.",
        });
        return;
      }
      const color = parseHex(finding.fixColor)!;
      node.fills = node.fills.map((paint) =>
        paint.type === "SOLID" && paint.visible !== false
          ? { ...paint, color }
          : paint,
      );
      figma.commitUndo();
      const result = scanSelection(
        scanRoots.filter((root) => !root.removed),
        scanLevel,
      );
      allowedIds = new Set(result.findings.map((item) => item.id));
      send({ type: "results", ...result });
      figma.notify("Text color updated. Undo is available in Figma.");
    }
    if (
      message.type === "focus" &&
      "id" in message &&
      typeof message.id === "string" &&
      allowedIds.has(message.id)
    ) {
      const node = await figma.getNodeByIdAsync(message.id);
      if (node && "visible" in node && !node.removed) {
        figma.viewport.scrollAndZoomIntoView([node]);
      } else
        send({
          type: "error",
          message: "This layer no longer exists. Scan again.",
        });
    }
  } catch {
    send({
      type: "error",
      message:
        "Unable to inspect this selection. Select a frame or text layer and try again.",
    });
  }
};

figma.showUI(__html__, { width: 512, height: 720, themeColors: true });
selection();
