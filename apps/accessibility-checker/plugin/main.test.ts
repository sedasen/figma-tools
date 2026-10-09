import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

it("reports initial selection on ready and subsequent selection changes", async () => {
  const handlers = new Map<string, () => void>();
  const postMessage = vi.fn();
  const page = { selection: [{ id: "1:2", name: "Checkout", type: "FRAME" }] };
  const ui = {
    postMessage,
    onmessage: undefined as undefined | ((message: unknown) => Promise<void>),
  };
  vi.stubGlobal("__html__", "");
  vi.stubGlobal("figma", {
    showUI: vi.fn(),
    ui,
    currentPage: page,
    on: (event: string, callback: () => void) => handlers.set(event, callback),
  });
  await import("./main");
  await ui.onmessage!({ type: "ready" });
  expect(postMessage).toHaveBeenLastCalledWith({
    type: "selection",
    count: 1,
    nodes: [{ id: "1:2", name: "Checkout", type: "FRAME" }],
  });
  page.selection = [{ id: "1:3", name: "Title", type: "TEXT" }];
  handlers.get("selectionchange")!();
  expect(postMessage).toHaveBeenLastCalledWith({
    type: "selection",
    count: 1,
    nodes: [{ id: "1:3", name: "Title", type: "TEXT" }],
  });
  page.selection = [];
  handlers.get("currentpagechange")!();
  expect(postMessage).toHaveBeenLastCalledWith({
    type: "selection",
    count: 0,
    nodes: [],
  });
});
