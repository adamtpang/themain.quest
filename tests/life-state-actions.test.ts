import assert from "node:assert/strict";
import test from "node:test";
import { EMPTY_SHARED_STATE, parseDoNow } from "../lib/life-command";
import {
  cloneLifeSharedState,
  recordChallengeAdjustment,
  recordQuestSkip,
  resetSkippedQuests,
  toggleQuestCompletion,
} from "../lib/life-state-actions";
import type { LifeSharedState } from "../lib/life-command-types";

function quest() {
  return parseDoNow(`### 09:00-09:20 · ⚓ [Tier 5] [P10] Close one money loop

- [ ] Open the invoice.

**Done means:** The invoice is ready.
`)[0];
}

function freshState(overrides: Partial<LifeSharedState> = {}): LifeSharedState {
  return {
    ...EMPTY_SHARED_STATE,
    completedQuestIds: [],
    completedAtById: {},
    completedXpById: {},
    skippedQuestIds: [],
    skipHistory: [],
    challengeHistory: [],
    daily: {},
    ...overrides,
  };
}

test("state cloning protects nested challenge and skip events", () => {
  const original = freshState({
    skipHistory: [{ questId: "a", questTitle: "A", reason: "Later", createdAt: "2026-08-28T00:00:00.000Z" }],
    challengeHistory: [{ questId: "a", questTitle: "A", action: "Open it", source: "built-in", createdAt: "2026-08-28T00:00:00.000Z" }],
  });
  const cloned = cloneLifeSharedState(original);

  cloned.skipHistory![0].reason = "Changed";
  cloned.challengeHistory![0].completed = true;

  assert.equal(original.skipHistory![0].reason, "Later");
  assert.equal(original.challengeHistory![0].completed, undefined);
});

test("skip recording trims input, deduplicates the quest, and preserves history", () => {
  const item = quest();
  const now = new Date("2026-08-28T01:00:00.000Z");
  const state = recordQuestSkip(freshState({ skippedQuestIds: [item.id] }), item, "  Wrong energy window  ", now);

  assert.deepEqual(state.skippedQuestIds, [item.id]);
  assert.equal(state.skipHistory?.[0].reason, "Wrong energy window");
  assert.equal(state.skipHistory?.[0].createdAt, now.toISOString());
});

test("skip recording rejects an empty reason", () => {
  assert.throws(() => recordQuestSkip(freshState(), quest(), "   "), /required/);
});

test("challenge adjustment records the bounded action and source", () => {
  const item = quest();
  const action = `${"x".repeat(600)}  `;
  const state = recordChallengeAdjustment(freshState(), item, action, "ai", 2, new Date("2026-08-28T02:00:00.000Z"));

  assert.equal(state.challengeHistory?.[0].action.length, 500);
  assert.equal(state.challengeHistory?.[0].source, "ai");
  assert.equal(state.challengeHistory?.[0].timeboxMinutes, 2);
});

test("challenge adjustment rejects an empty action", () => {
  assert.throws(() => recordChallengeAdjustment(freshState(), quest(), "", "built-in"), /required/);
});

test("completion records XP and completes the latest matching adjustment without mutating prior state", () => {
  const item = quest();
  const original = freshState({
    challengeHistory: [
      { questId: item.id, questTitle: item.title, action: "First", source: "built-in", createdAt: "2026-08-28T01:00:00.000Z" },
      { questId: item.id, questTitle: item.title, action: "Latest", source: "ai", createdAt: "2026-08-28T02:00:00.000Z" },
    ],
  });
  const completed = toggleQuestCompletion(original, item, true, {
    elapsedSeconds: 42,
    timeboxMinutes: 2,
    now: new Date("2026-08-28T03:00:00.000Z"),
  });

  assert.deepEqual(completed.completedQuestIds, [item.id]);
  assert.equal(completed.completedXpById?.[item.id], item.xp);
  assert.equal(completed.completedAtById?.[item.id], "2026-08-28T03:00:00.000Z");
  assert.equal(completed.challengeHistory?.[1].completed, true);
  assert.equal(completed.challengeHistory?.[1].elapsedSeconds, 42);
  assert.equal(completed.challengeHistory?.[0].completed, undefined);
  assert.equal(original.challengeHistory?.[1].completed, undefined);
});

test("undo removes completion timestamps and XP", () => {
  const item = quest();
  const completed = toggleQuestCompletion(freshState(), item, true);
  const undone = toggleQuestCompletion(completed, item, false);

  assert.deepEqual(undone.completedQuestIds, []);
  assert.equal(undone.completedAtById?.[item.id], undefined);
  assert.equal(undone.completedXpById?.[item.id], undefined);
});

test("reset clears only the current skip rotation", () => {
  const item = quest();
  const original = freshState({
    skippedQuestIds: [item.id],
    skipHistory: [{ questId: item.id, questTitle: item.title, reason: "Later", createdAt: "2026-08-28T00:00:00.000Z" }],
  });
  const reset = resetSkippedQuests(original);

  assert.deepEqual(reset.skippedQuestIds, []);
  assert.equal(reset.skipHistory?.length, 1);
});
