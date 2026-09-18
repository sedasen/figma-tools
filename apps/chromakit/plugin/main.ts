/// <reference types="@figma/plugin-typings" />

import { PUBLIC_LINKS, type PublicLink } from "../src/lib/links";

figma.showUI(__html__, { width: 512, height: 656, title: "ChromaKit" });
figma.ui.onmessage = (message: unknown) => {
  if (
    typeof message !== "object" ||
    message === null ||
    !("type" in message) ||
    message.type !== "open-link" ||
    !("key" in message) ||
    typeof message.key !== "string"
  )
    return;
  if (!Object.prototype.hasOwnProperty.call(PUBLIC_LINKS, message.key)) return;
  const url = PUBLIC_LINKS[message.key as PublicLink];
  if (url.startsWith("https://")) figma.openExternal(url);
};
