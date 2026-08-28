import assert from "node:assert/strict";
import test from "node:test";
import { SFX_RECIPES } from "../lib/sfx";

test("every quest-loop event has a short local sound recipe", () => {
  for (const event of ["attack", "complete", "level-up", "shrink", "skip", "timebox"] as const) {
    const recipe = SFX_RECIPES[event];
    assert.ok(recipe.length > 0, `${event} needs at least one tone`);
    assert.ok(recipe.every(([, duration, , gain, delay]) => duration > 0 && duration <= 0.5 && gain <= 0.06 && delay <= 0.5));
  }
});

test("a level-up is richer than an ordinary completion", () => {
  assert.ok(SFX_RECIPES["level-up"].length > SFX_RECIPES.complete.length);
});
