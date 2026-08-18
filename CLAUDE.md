# CLAUDE.md - themain.quest

Context for Claude Code, Codex, and humans working in this folder.

**See `CLAUDE_PROJECT_CONTEXT.md` first.** It mirrors the "🌱 themain.quest" Claude
Project (mission statement, chat instructions, and source-book themes) into this
codebase — the "why" behind everything below. Synced 2026-08-15.

**This session owns Adam's calendar (live checkpoint: 2026-08-07 09:18 MYT).**
`CALENDAR_HANDOFF_2026-07-29.md` is historical context; run `/start day` and trust the
live calendar for current state. Added four power-law money blocks into genuine open
gaps, nothing moved or deleted: Fri 8/7 18:30-19:45 Discover APR call + Vercel domain
kill + subs cleanup (~$160/mo, hard-stops before the existing 19:45 Stripe block); Sat
8/8 08:30-08:50 send the Quantus month-1 invoice ($1,000, before the fb-marketplace
block); Sat 8/8 11:30-12:30 apply for a 0% balance-transfer card (up to $230/mo, inside
the open window before 16:00 pickleball); Sun 8/9 14:00-14:45 Schwab switch + registrar
consolidation (~$37/mo, low-urgency, explicitly skippable). Source data: deathmoney.fyi
private/ASAP-CHECKLIST.md and the Chase-statement reconciliation in that session.
Discover card is already frozen (Adam did this himself, 2026-08-06/07).

**Calendar retention rule from Adam, 2026-08-03: never delete, always save.** Preserve
captures verbatim in a dated `parked-captures-YYYY-MM-DD.md` file, then keep the source
event as a transparent Basil `SAVED` note. Resolve duplicates by saving and marking
them, never by deletion. Move or merge task blocks without destroying the source.

Tue 2026-08-04 is processed. Nine captures are saved in
`C:\Users\adamp\ObsidianVault\parked-captures-2026-08-04.md` and remain as transparent
Basil events. Real blocks are coffee/easy question 05:30, first high-impact send +
next six 06:00, song afterglow 06:30, gym 07:00, music flow rep 07:30, Claude-mobile
gravel 08:30, move-out gravel 14:30, OPEN 13:30 and 15:30, and sleep 22:00. The
Granola event moved intact to Monday; no event was deleted.

Flow is now baked into the event descriptions from Adam's Desktop checklist at
`C:\Users\adamp\Desktop\win\Unsorted\Folders\tags\flow-triggers.md` (renamed from
flow.md 2026-08-18; "flow" now names only the Rían Doris One-Month Day checklist
pair in Library/Books/Philosophy & Science/): activation lever -> ONE
stone -> visible feedback -> rewarding afterglow/life stone -> hard-stopped gravel.
Every key block states a clear goal, immediate feedback, and a 6-8/10 challenge-skill
target. Optional boring work stays SAVED; necessary boring work is shrunk, batched,
delegated, automated, gamified, or time-boxed.

## What this is

This handoff was generated on 2026-07-07 so every top-level Codex project under
`C:\Users\adamp\OneDrive\Aether` has both `CLAUDE.md` and `AGENTS.md`.

No richer Claude handoff was found here during the workspace sync. Treat this file
as a starting point, then inspect the actual code and docs before making changes.

## Detected project facts

- Workspace folder: `themain.quest`
- Git repository: yes
- `package.json`: yes
- Detected stack: Next.js, React, Tailwind, TypeScript, package "themain-quest"
- Existing context-like files: README.md, readme.md
- Notable top-level files: .env.example, .gitignore, next-env.d.ts, next.config.mjs, package-lock.json, package.json, postcss.config.mjs, README.md, tailwind.config.ts, tsconfig.json

## How to keep this useful

- If you learn the product purpose, stack, run commands, deployment target, or open
  tasks, update this file.
- Keep `AGENTS.md` synchronized with this file so Codex sessions have the same
  context inline.
- Prefer concrete project facts over generic instructions.

## Imported existing context

Source: `README.md`

```markdown
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

## Finn AI agent

Finn is the in-app chatbot. He reads your live board (boss, rungs, quests, problems, KPIs) and helps you understand why your problems happen and beat them in the right order. He calls Claude (Sonnet 4.6) from a server route, so your API key never reaches the browser.

To turn Finn on, set `ANTHROPIC_API_KEY`:

- Local: copy `.env.example` to `.env.local` and paste your key.
- Production: add `ANTHROPIC_API_KEY` in Vercel > Project > Settings > Environment Variables, then redeploy.

Without a key, the rest of the app works and Finn politely says he is asleep.

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
```
