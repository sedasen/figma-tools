/// <reference types="@figma/plugin-typings" />

import { PUBLIC_LINKS, type PublicLink } from "../src/lib/links";

figma.showUI(__html__, { width: 512, height: 576, title: "ChromaKit" });
figma.ui.onmessage = (message: unknown) => {
  if (typeof message !== "object" || message === null || !("type" in message))
    return;
  if (message.type === "resize") {
    if (
      "height" in message &&
      typeof message.height === "number" &&
      Number.isFinite(message.height) &&
      message.height > 0
    ) {
      figma.ui.resize(512, Math.ceil(message.height));
    }
    return;
  }
  if (
    message.type !== "open-link" ||
    !("key" in message) ||
    typeof message.key !== "string"
  )
    return;
  if (!Object.prototype.hasOwnProperty.call(PUBLIC_LINKS, message.key)) return;
  const url = PUBLIC_LINKS[message.key as PublicLink];
  if (url.startsWith("https://")) figma.openExternal(url);
};
