import type { PluginResponse } from "./messages";

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

// Figma relays sandbox messages; MessageEvent.source is not a reliable
// parent-window identity. Validate the documented pluginMessage envelope.
export function readPluginMessage(data: unknown): PluginResponse | null {
  if (!record(data) || !record(data.pluginMessage)) return null;
  const message = data.pluginMessage;
  if (
    message.type === "selection" &&
    Number.isSafeInteger(message.count) &&
    (message.count as number) >= 0 &&
    Array.isArray(message.nodes) &&
    message.nodes.every(
      (node) =>
        record(node) &&
        typeof node.id === "string" &&
        typeof node.name === "string" &&
        typeof node.type === "string",
    )
  )
    return message as PluginResponse;
  if (message.type === "error" && typeof message.message === "string")
    return message as PluginResponse;
  if (
    message.type === "results" &&
    typeof message.truncated === "boolean" &&
    Array.isArray(message.findings) &&
    message.findings.every(
      (item) =>
        record(item) &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.detail === "string" &&
        ["pass", "fail", "review"].includes(item.status as string),
    )
  )
    return message as PluginResponse;
  return null;
}

export function connectBridge(
  host: Pick<
    Window,
    "addEventListener" | "removeEventListener" | "setInterval" | "clearInterval"
  >,
  sendReady: () => void,
  receive: (message: PluginResponse) => void,
) {
  let attempts = 0;
  let timer: number | undefined;
  const listener = (event: MessageEvent) => {
    const message = readPluginMessage(event.data);
    if (!message) return;
    if (message.type === "selection" && timer !== undefined)
      host.clearInterval(timer);
    receive(message);
  };
  host.addEventListener("message", listener as EventListener);
  timer = host.setInterval(() => {
    if (++attempts >= 10) {
      host.clearInterval(timer);
      return;
    }
    sendReady();
  }, 1000);
  sendReady();
  return () => {
    host.removeEventListener("message", listener as EventListener);
    host.clearInterval(timer);
  };
}
