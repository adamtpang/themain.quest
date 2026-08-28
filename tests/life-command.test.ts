import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  EMPTY_SHARED_STATE,
  getLifeCommandData,
  mergeState,
  parseDoNow,
} from "../lib/life-command";
import type { LifeCommandData, LifeSharedState } from "../lib/life-command-types";

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

function timedOutbox(): string {
  return `# ASAP SUCCESS CHECKLIST

### 08:00-08:25 · ⚓ [Tier 5] [P10] Close one money loop · ↪ project

- [ ] Open the invoice.
- [ ] Verify the amount.

**Done means:** The invoice is ready for owner review.

Route: \`C:\\Projects\\money.project\`

### 08:25-08:35 · 💚 [Tier 4] [P7] Eat breakfast

- [ ] Put food on a plate.

**Done means:** Breakfast is eaten.

# 🟡 LATER

- [ ] A future task
- [x] A preserved completed capture
`;
}

test("timed outbox parsing keeps only today, removes metadata, and sorts by inaction cost", () => {
  const quests = parseDoNow(timedOutbox());

  assert.equal(quests.length, 2);
  assert.equal(quests[0].title, "Close one money loop");
  assert.equal(quests[0].tier, 5);
  assert.equal(quests[0].inactionCost, 10);
  assert.equal(quests[0].category, "Money");
  assert.equal(quests[0].emoji, "⚓");
  assert.equal(quests[0].route, "money.project");
  assert.deepEqual(quests[0].steps, ["Open the invoice.", "Verify the amount."]);
  assert.equal(quests[0].doneWhen, "The invoice is ready for owner review.");
  assert.ok(quests.every((quest) => !quest.title.includes("future")));
});

test("legacy tier headings and a warmup remain playable", () => {
  const quests = parseDoNow(`Touch the toothbrush.

## 🏆 Tier 1: Finish the flagship

1. Open the file.
2. Make one edit.

Outcome: One visible edit exists.
`);

  assert.equal(quests.length, 2);
  assert.equal(quests[0].title, "Finish the flagship");
  assert.equal(quests[1].title, "Touch the toothbrush.");
  assert.equal(quests[1].doneWhen, "The activation step is complete.");
});

test("Tier 1 outranks Tier 5 when urgency is equal and earns more XP", () => {
  const quests = parseDoNow(`### 09:00-09:10 · ✦ [Tier 5] [P8] Low tier task

- [ ] Open it.

### 09:10-09:20 · ✦ [Tier 1] [P8] Top tier task

- [ ] Open it.
`);

  assert.equal(quests[0].title, "Top tier task");
  assert.equal(quests[0].tier, 1);
  assert.ok(quests[0].xp > quests[1].xp);
});

test("duplicate task titles receive independent stable IDs", () => {
  const quests = parseDoNow(`### 09:00-09:10 · ✦ [Tier 5] [P9] Check the document

- [ ] Open the first copy.

### 10:00-10:10 · ✦ [Tier 5] [P8] Check the document

- [ ] Open the second copy.
`);

  assert.equal(quests.length, 2);
  assert.equal(quests[0].title, quests[1].title);
  assert.notEqual(quests[0].id, quests[1].id);
  const state = freshState({
    completedQuestIds: [quests[0].id],
    completedAtById: { [quests[0].id]: new Date().toISOString() },
  });
  const merged = mergeState({
    generatedAt: new Date().toISOString(),
    source: "vault",
    quests,
  }, state);
  assert.equal(merged.quests[0].completed, true);
  assert.equal(merged.quests[1].completed, false);
});

test("the same recurring title receives a new instance ID on a new day", () => {
  const outbox = `### 09:00-09:10 · ✦ [Tier 1] [P8] Daily practice

- [ ] Begin.
`;
  const firstDay = parseDoNow(outbox, "2026-08-28")[0];
  const nextDay = parseDoNow(outbox, "2026-08-29")[0];

  assert.notEqual(firstDay.id, nextDay.id);
});

test("shared state applies completion, XP, skips, flow learning, and today's score", () => {
  const quests = parseDoNow(timedOutbox());
  const first = quests[0];
  const second = quests[1];
  const state = freshState({
    completedQuestIds: [first.id],
    completedAtById: { [first.id]: new Date().toISOString() },
    completedXpById: { [first.id]: first.xp },
    skippedQuestIds: [second.id],
    skipHistory: [{
      questId: second.id,
      questTitle: second.title,
      reason: "Energy is low",
      createdAt: new Date().toISOString(),
    }],
    challengeHistory: [{
      questId: first.id,
      questTitle: first.title,
      action: "Open the invoice",
      source: "built-in",
      completed: true,
      createdAt: new Date().toISOString(),
    }],
  });

  const merged = mergeState({
    generatedAt: new Date().toISOString(),
    source: "vault",
    quests,
  }, state);

  assert.equal(merged.quests.find((quest) => quest.id === first.id)?.completed, true);
  assert.equal(merged.quests.find((quest) => quest.id === second.id)?.skipped, true);
  assert.equal(merged.completedToday, 1);
  assert.equal(merged.todayScore, 6);
  assert.equal(merged.xp, first.xp);
  assert.equal(merged.flowLearning.skipsRecorded, 1);
  assert.equal(merged.flowLearning.adjustmentsRecorded, 1);
  assert.match(merged.flowLearning.note, /later became a win/);
});

test("today's score keeps completed work after a quest leaves the current outbox", () => {
  const completedId = "completed-and-processed-away";
  const state = freshState({
    completedQuestIds: [completedId],
    completedAtById: { [completedId]: new Date().toISOString() },
    completedXpById: { [completedId]: 100 },
  });
  const merged = mergeState({
    generatedAt: new Date().toISOString(),
    source: "vault",
    quests: [],
  }, state);

  assert.equal(merged.completedToday, 1);
  assert.equal(merged.todayScore, 6);
  assert.equal(merged.xp, 100);
});

test("a configured vault is read server-side and returns a safe parsed model", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "themain-quest-test-"));
  const previousVault = process.env.OBSIDIAN_VAULT_PATH;

  try {
    await writeFile(path.join(root, "🐆 outbox.md"), timedOutbox(), "utf8");
    process.env.OBSIDIAN_VAULT_PATH = root;

    const data = await getLifeCommandData(freshState());
    assert.equal(data.source, "vault");
    assert.equal(data.quests.length, 2);
    assert.equal(JSON.stringify(data).includes(root), false);
  } finally {
    if (previousVault === undefined) delete process.env.OBSIDIAN_VAULT_PATH;
    else process.env.OBSIDIAN_VAULT_PATH = previousVault;
    assert.ok(root.startsWith(path.join(tmpdir(), "themain-quest-test-")));
    await rm(root, { recursive: true, force: true });
  }
});

test("a saved snapshot powers production-style data when the vault is unavailable", async () => {
  const previousVault = process.env.OBSIDIAN_VAULT_PATH;
  process.env.OBSIDIAN_VAULT_PATH = path.join(tmpdir(), "themain-quest-missing-vault");

  const snapshot: LifeCommandData = {
    generatedAt: new Date().toISOString(),
    source: "vault",
    level: 1,
    levelProgress: 0,
    xp: 0,
    xpToNext: 100,
    todayScore: 5,
    completedToday: 0,
    quests: parseDoNow(timedOutbox()),
    flowLearning: {
      skipsRecorded: 0,
      adjustmentsRecorded: 0,
      recentSkipReasons: [],
      note: "Ready",
    },
  };

  try {
    const data = await getLifeCommandData(freshState({ snapshot }));
    assert.equal(data.source, "neon");
    assert.equal(data.quests.length, 2);
  } finally {
    if (previousVault === undefined) delete process.env.OBSIDIAN_VAULT_PATH;
    else process.env.OBSIDIAN_VAULT_PATH = previousVault;
  }
});

test("starter quests keep the page playable when no vault or snapshot exists", async () => {
  const previousVault = process.env.OBSIDIAN_VAULT_PATH;
  process.env.OBSIDIAN_VAULT_PATH = path.join(tmpdir(), "themain-quest-missing-starter-vault");

  try {
    const data = await getLifeCommandData(freshState());
    assert.equal(data.source, "starter");
    assert.equal(data.quests.length, 3);
    assert.equal(data.todayScore, 5);
  } finally {
    if (previousVault === undefined) delete process.env.OBSIDIAN_VAULT_PATH;
    else process.env.OBSIDIAN_VAULT_PATH = previousVault;
  }
});
