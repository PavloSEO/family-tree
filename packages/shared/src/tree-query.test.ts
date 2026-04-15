import { describe, expect, it } from "vitest";
import { treeQuerySchema } from "./validation/tree.js";

describe("treeQuerySchema", () => {
  it("подставляет значения по умолчанию", () => {
    const q = treeQuerySchema.parse({});
    expect(q.mode).toBe("full");
    expect(q.depthUp).toBe(3);
    expect(q.depthDown).toBe(3);
    expect(q.showExternal).toBe(false);
    expect(q.externalDepth).toBe(2);
    expect(q.aliveOnly).toBe(false);
    expect(q.country).toBeUndefined();
  });

  it("разбирает query-параметры", () => {
    const q = treeQuerySchema.parse({
      mode: "ancestors",
      depthUp: "5",
      depthDown: "1",
      showExternal: "true",
      aliveOnly: "1",
      country: "de",
    });
    expect(q.mode).toBe("ancestors");
    expect(q.depthUp).toBe(5);
    expect(q.showExternal).toBe(true);
    expect(q.aliveOnly).toBe(true);
    expect(q.country).toBe("DE");
  });
});
