import { afterEach, expect, it, vi } from "vitest";
import { connectBridge, readPluginMessage } from "./bridge";
afterEach(() => vi.useRealTimers());
it("accepts Figma relayed messages without relying on event.source", () => {
  const message = {
    type: "selection",
    count: 1,
    nodes: [{ id: "1", name: "Wallet", type: "FRAME" }],
  };
  let listener: EventListener | undefined;
  const host = {
    addEventListener: (_: string, cb: EventListener) => {
      listener = cb;
    },
    removeEventListener: vi.fn(),
    setInterval: vi.fn(() => 1),
    clearInterval: vi.fn(),
  };
  const receive = vi.fn();
  const stop = connectBridge(host as unknown as Window, vi.fn(), receive);
  listener!(
    new MessageEvent("message", {
      data: { pluginMessage: message },
      source: null,
    }),
  );
  expect(receive).toHaveBeenCalledWith(message);
  expect(host.clearInterval).toHaveBeenCalledWith(1);
  stop();
  expect(host.removeEventListener).toHaveBeenCalled();
});
it("rejects unrelated and malformed envelopes", () => {
  for (const data of [
    null,
    {},
    { pluginMessage: { type: "selection", count: 2, nodes: [{}] } },
    { pluginMessage: { type: "selection", count: -1, nodes: [] } },
  ])
    expect(readPluginMessage(data)).toBeNull();
});
it("retries a lost ready message and stops after the selection reply", () => {
  vi.useFakeTimers();
  let listener: EventListener | undefined;
  const host = {
    addEventListener: (_: string, cb: EventListener) => {
      listener = cb;
    },
    removeEventListener: vi.fn(),
    setInterval,
    clearInterval,
  };
  const ready = vi.fn();
  const stop = connectBridge(host as unknown as Window, ready, vi.fn());
  vi.advanceTimersByTime(2000);
  expect(ready).toHaveBeenCalledTimes(3);
  listener!(
    new MessageEvent("message", {
      data: { pluginMessage: { type: "selection", count: 0, nodes: [] } },
    }),
  );
  vi.advanceTimersByTime(5000);
  expect(ready).toHaveBeenCalledTimes(3);
  stop();
});
