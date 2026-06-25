# themain.quest

A single-screen, mobile-first life dashboard. Every time you open it, it shows the ONE move that matters most right now and refuses to let motion masquerade as progress.

## The four views

1. **Life-left** clock (sticky header): days left, percent of life spent, progress bar.
2. **Today**: live day-score plus the five rungs.
3. **The board**: quests, priority-sorted, with exactly ONE binding goal on top.
4. **The three lenses**: WHO (people), WHAT (goals), WHERE (place), deep-linked out.

## Core mechanics

- **One clear goal.** The binding-goal slot holds exactly one quest. Crowning a new one demotes the old.
- **Immediate feedback.** Checking a rung or closing a quest updates the score instantly, no save button.
- **Challenge/skill balance.** The app nudges you toward the hardest open close, never the cozy busywork.
- **Motion Test.** Does this leave something in the world, make money, or lock in progress? If no, it is flagged MOTION, earns zero points, and is parked below the fold. The binding-goal slot rejects motion.

## The day system

Boots at 5/10. Five rungs climb to a perfect day:

- 🧹 6 Loaded in
- 🥇 7 Goal hit (keystone: without it the day caps at a wobble of 7)
- 💚 8 Body taxed
- ❤️ 9 Love logged
- 🌅 10 Clean close

Score = 5 + rungs completed. Three rungs = 8 (a winning day). All five = 10.

## Priority order

`Life > Health.fun > Visa > Taxes > Leverage-maxxing > Marketplace-maxxing > Loops`

Loops (tools, systems, meta-work) sorts dead last by design. This dashboard is itself a Loops-tier build.

## Quest input (Obsidian bridge)

Paste raw outbox lines (one per line). The app parses them into quests, auto-suggests a priority from keywords, and auto-flags obvious motion. Every auto-tag is editable with one tap. Bracket tags like `[im5 ef2]` are stripped.

## Stack

Next.js (App Router) + TypeScript + React + Tailwind. State in localStorage. No auth, no backend. Deploy target: Vercel.

## Run locally

```bash
npm install
npm run dev
```

## Data

All state lives in your browser's localStorage:

- `tmq.quests` the board
- `tmq.day` today's date and rungs (resets daily)
- `tmq.aff` affirmation rotation index
