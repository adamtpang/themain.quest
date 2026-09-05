import assert from "node:assert/strict";
import test from "node:test";
import {
  LIFE_CONTEXT_HEADING,
  briefWordCount,
  buildLifeContextBrief,
  parseQuestbook,
  parseTable,
  redactAmounts,
  shortenMove,
} from "../lib/life-context";

const QUESTBOOK = `# 🗺️ QUESTBOOK: From knot to income before the cliff

Intro paragraph with **bold** words that is not a quest.

## ⚔️ MAIN QUESTLINE: the income arc

- ✅ **Q1. Name the knot** : Two runs on 2026-08-23 with Somebody Private.
- 🔓 **Q5. Ship the three sites** : due before Sep 9.
- ⬛ **Q6. Show what you've been cooking** : locked until Q5.
- ⬛ **👑 BOSS: Income landed before Nov 10** : a first dollar, confirmed.

## 🔀 THE FORK: three paths, none chosen yet

Open question captured 2026-09-03: does the other event land the same week?

**Path A: help the company raise, then get hired.** Adam's own line.

- 🔓 **A1. The talent search** : ready to run.
- ⬛ **A2. One real intro made** : locked until A1.

**Path C: a job.** The oldest path.

## 🏠 WHERE CHAIN

Plain prose, no quests.
`;

const CHARACTER = `# 🧙 CHARACTER SHEET

## 📊 ABILITY SCORES

| Ability | Score | Notes |
| --- | --- | --- |
| 💰 WEALTH | **30** | lowest ability |
| ⚔️ LEVEL | **1** | = lowest ability |

## 🩸 HIT POINTS AND VITALS

| Vital | Value |
| --- | --- |
| 🪙 Gold | **-$13,000** (debt) |
| 🩸 BLEED (debuff) | -$2,000/month, activates ~Thanksgiving 2026 |
| ⏳ Countdown | ~3 months |

## 🧿 CONDITIONS (curses lift by REMOVAL)

| Condition | Effect | Status |
| --- | --- | --- |
| 🌀 Conjecture Loop | ideas multiply, none face a buyer | **LIFTED 2026-08-19** |
| 🛠️ Toolsmith's Trance | builds systems about the work instead of the work | ACTIVE · lifts at Q7 |
`;

const DEATHGUIDE = `# Death Guide

## North star

- Live deliberately, not performatively.
- Love people visibly while they are here.

## Core truths

1. You will die.
`;

test("parseQuestbook keeps only bold titles and states, grouped by section", () => {
  const sections = parseQuestbook(QUESTBOOK);
  assert.equal(sections.length, 2, "the prose-only WHERE chain is dropped");
  assert.equal(sections[0].heading, "⚔️ MAIN QUESTLINE: the income arc");
  assert.deepEqual(
    sections[0].quests.map((quest) => [quest.state, quest.title]),
    [
      ["done", "Q1. Name the knot"],
      ["open", "Q5. Ship the three sites"],
      ["locked", "Q6. Show what you've been cooking"],
      ["boss", "👑 BOSS: Income landed before Nov 10"],
    ],
  );
  assert.deepEqual(sections[1].paths, [
    "Path A: help the company raise, then get hired.",
    "Path C: a job.",
  ]);
  assert.ok(!JSON.stringify(sections).includes("Somebody Private"), "details after the title never leak");
});

test("parseTable reads a Markdown table without its header or divider", () => {
  const vitals = parseTable(CHARACTER, "VITALS");
  assert.equal(vitals.length, 3);
  assert.deepEqual(vitals[2], ["⏳ Countdown", "~3 months"]);
});

test("redactAmounts removes money figures but keeps the qualitative fact", () => {
  assert.equal(redactAmounts("-$13,000 (debt)"), "[amount] (debt)");
  assert.equal(redactAmounts("-$2,000/month, activates ~Thanksgiving 2026"), "[amount]/month, activates ~Thanksgiving 2026");
  assert.equal(redactAmounts("RM3,990 of listings"), "[amount] of listings");
  assert.equal(redactAmounts("Level 2 at the first verified dollar"), "Level 2 at the first verified dollar");
});

test("buildLifeContextBrief emits every section summon.guide expects", () => {
  const brief = buildLifeContextBrief({
    generatedAt: "2026-09-05T00:00:00.000Z",
    questbook: QUESTBOOK,
    deathguide: DEATHGUIDE,
    character: CHARACTER,
    oneMove: { title: "Send the ten replies", category: "Money", estimatedMinutes: 15, openCount: 12 },
    recentSkipReasons: ["Waiting on a buyer"],
  });

  assert.ok(brief.startsWith(LIFE_CONTEXT_HEADING));
  for (const heading of [
    "## Current situation",
    "## Problems I want to solve",
    "## Goals",
    "## Priorities",
    "## Constraints",
    "## Patterns",
    "## Guidance that works for me",
    "## Open questions",
  ]) {
    assert.ok(brief.includes(`\n${heading}\n`), `missing ${heading}`);
  }

  assert.match(brief, /Today's one move: Send the ten replies \(Money, about 15 min\)\. 12 open quests/);
  assert.match(brief, /Boss: 👑 BOSS: Income landed before Nov 10\./);
  assert.match(brief, /THE FORK: three paths, none chosen yet: Path A: help the company raise, then get hired\. \/ Path C: a job\./);
  assert.match(brief, /Active condition 🛠️ Toolsmith's Trance/);
  assert.ok(!brief.includes("Conjecture Loop:"), "lifted conditions are not listed as problems");
  assert.match(brief, /Conjecture Loop \(LIFTED 2026-08-19\)/, "but they still appear as patterns");
  assert.match(brief, /🪙 Gold: \[amount\] \(debt\)\./);
  assert.ok(!brief.includes("$13,000"), "amounts are redacted");
  assert.match(brief, /Deadline named in the questbook: Sep 9\./);
  assert.match(brief, /Standing value: Live deliberately, not performatively\./);
  assert.match(brief, /Open question: does the other event land the same week\?/);
  assert.match(brief, /Recent skip reason: Waiting on a buyer\./);
  assert.ok(briefWordCount(brief) < 700, `brief is ${briefWordCount(brief)} words, should stay under 700`);
});

test("buildLifeContextBrief degrades honestly when sources are missing", () => {
  const brief = buildLifeContextBrief({ generatedAt: "2026-09-05T00:00:00.000Z" });
  assert.match(brief, /No questbook was available/);
  assert.match(brief, /No boss quest is recorded/);
  assert.match(brief, /No vitals or deadlines are recorded/);
});

test("shortenMove keeps the first clause of an outbox line and drops amounts", () => {
  const move = shortenMove(
    "💰 Send the 10 Marketplace replies drafted in the ledger (Someone amp, Other bass). RM3,990 of listings, all waiting on you. You send.",
  );
  assert.equal(move, "💰 Send the 10 Marketplace replies drafted in the ledger");
  assert.equal(shortenMove("Clothes zone: every item to KEEP, GIVE, or TRASH"), "Clothes zone");
  assert.ok(shortenMove("x".repeat(200)).length <= 120);
});
