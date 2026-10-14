import "fake-indexeddb/auto";
import { it, expect } from "vitest";
import { createGame, command } from "../domain/game.js";
import { load, save } from "./local.js";
it("IndexedDB preserva propriedade, recursos, relógio e ledger sem duplicar campanha", async () => {
  let s = createGame(123);
  s = command(s, { type: "buyFeed", id: "farm-ze", quantity: 10 });
  await save(s);
  await save(s);
  const restored = await load();
  expect(restored).toEqual(s);
  expect(restored.campaignId).toBe("rural-123");
});
