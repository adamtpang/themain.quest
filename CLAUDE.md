# CLAUDE.md - themain.quest

**Hard writing rule from Adam:** Never use the em dash character in responses, UI copy, or newly written project documentation. Use a period, comma, colon, parentheses, or a short hyphen instead.

## 2026-09-05 life context to summon.guide (the council of past lives)

This repo now exports Adam's life context so the guides in summon.guide read the real quest, the way Aang's past lives sat around his actual problem. `lib/life-context.ts` is a pure builder that turns `questbook.md` (repo copy first, vault `0. 🗺️ QUESTBOOK.md` as fallback), `deathguide.md`, the vault `🧙 CHARACTER.md`, and the live outbox (`getLifeCommandData`) into the exact `# Personal context` Markdown summon.guide's context import expects: situation, problems, goals, priorities, constraints, patterns, guidance, open questions. Only bold quest titles and fork headers survive from the questbook, the one move is cut to its first clause, and money amounts are replaced with `[amount]`, so other people's names and figures stay out of the brief by construction. `lib/life-context-sources.ts` gathers the files; `app/api/life-context/route.ts` is the owner-only GET.

`npm run life:context` prints the brief for review. `npm run life:context -- --send` mails it to summon.guide as a repos.chat `notice` (subject `life-context`) through `repos.chat/repos.mjs send`, never by writing into `.repo-connect` directly. summon.guide reads the newest notice on `/council`, seats three guides against it, and attaches the brief to the chosen guide's chat for that browser session only. Re-send whenever the questbook or outbox changes; the brief is a snapshot, not a live link. `repos.yaml` declares the `life-context-brief`, `life-context-export`, and `life-context-api` capabilities and the `life-context` exchange with summon.guide.

Verification on 2026-09-05: 54 tests pass (6 new in `tests/life-context.test.ts`), `tsc --noEmit` is clean, the real brief is 638 words from all four sources, notice `20260905T061115475Z-8b047d60` landed in summon.guide's mailbox, and `repos verify` confirms both manifests. Note that the globally installed older `repos` CLI does not list `notice` messages; use `node ../repos.chat/repos.mjs inbox` to see them.

## 2026-08-31 Shapeable-informed Quest Clock focus pass

The private `/life` runner now keeps the real Quest Clock start inside the initial 390 by 844 mobile viewport. Mobile hides secondary diagnostics and the four-stage explainer, the five checkpoint targets no longer overlap and meet the 44 px touch target, generic `The task is complete.` goal filler is suppressed, and the physical action appears first. Starting the clock enters a focused game state that locks checkpoint switching, emphasizes the live timer, hides planning distractions, keeps Done available, and restores recovery controls when paused. This cure follows Shapeable's measured task-success, interaction, responsive, hierarchy, coherence, and accessibility pillars while preserving the playful warm Adventure Time direction.

## 2026-08-30 atomic outbox contract

The canonical outbox is a simple numbered checklist with one honest completion result per line and one compact estimate such as `(~10m)`. Do not bundle multiple people, locations, payments, decisions, errands, or deliverables into one quest. When clarity is the blocker, make `Brainstorm` a real quest, then keep `Choose` and `Act` as separate later quests. Parent outcomes such as clearing one apartment belong in the outbox. Optional physical substeps are generated inside the life runner only when Adam asks for them. The Process skill now enforces this atomicity rule. The life parser removes the estimate suffix from the displayed title and uses the stated minutes for the Quest Clock.

## 2026-08-30 estimated subquests and Windows AI bridge

Every private life quest now displays one practical time estimate. Existing outbox substeps appear as playable one-line subquests, and `Make clear steps` asks the local AI for two to six ordered subtasks with a minute estimate on each line. Subquest completion is durable and advances the `Do this now` action without completing the parent quest. `Too hard? Make it smaller` remains a separate two-minute intervention. The Windows local agent bridge now resolves the installed `C:\Users\adamp\.local\bin\claude.exe` directly instead of relying on `spawn("claude")`, which failed with `ENOENT`. A real AI plan was generated and persisted for the current Aug 31 housing quest. Verification passed with 48 tests, TypeScript lint, the optimized production build, and a direct tool-free Claude CLI smoke test.

## 2026-08-30 adaptive Quest Clock research

The private `/life` runner now uses an adaptive Quest Clock instead of treating Pomodoro as a universal schedule. The five checkpoints are Ignite 2 minutes, Start 5 minutes, Sprint 25 minutes, Flow 50 minutes, and Deep 90 minutes. Reaching a checkpoint gives feedback but does not stop the count-up clock, so healthy concentration can continue. The outbox remains the day-scoped priority truth. The calendar is reserved for external commitments and hard anchors rather than duplicating the task list. Local reads and staged Process validation now recognize the canonical `5. 🐆 outbox.md` plus the older filename for migration. The source-checked historical and scientific rationale is in `GOAT-RESEARCH-time-operating-system.md`, with focused unit coverage in `tests/quest-clock.test.ts`.

Verification passed on 2026-08-30: all 45 tests, TypeScript lint, and the optimized Next.js production build.

## 2026-08-28 public landing and route navigation

The public `/` page now tells the truth about the current product: Process produces one next quest, the runner shows one physical action and a bounded stopwatch, and Adam can finish, shrink, or skip with a reason. The old analytics-heavy mockup was replaced by this live product loop. A sticky responsive navbar exposes every user-facing route: Home, Life, Board, Money OS, and Sign in, with Open Life kept as the primary action. Mobile uses a full labeled navigation sheet. The page also explains the three flow signals, the century-to-two-minute horizon, the privacy boundary, and each product doorway. TypeScript, the production build, route checks, 1440 px light and dark rendering, 390 px mobile rendering, navigation-sheet behavior, overflow, and console checks passed. The production preview remains available locally at `http://127.0.0.1:3100` while its server process is running.

Local preview auth must run through `next dev` with `AUTH_DEV_BYPASS=true`, not `next start`. In that development-only state, `/signin` shows `Open local preview` and routes directly to the safe local callback. Production never honors the bypass and continues to require `NEXTAUTH_SECRET`, Google OAuth credentials, and `AUTH_ALLOWED_EMAIL`.

## 2026-08-28 live one-quest flow runner

The private `/life` route now shows exactly one open outbox quest, its `Done means` goal, one physical next action, and a bounded count-up stopwatch. `Skip and explain why` preserves the quest and records the reason before moving to the next open quest. `Too hard? Make it smaller` uses the local subscription-authenticated Claude CLI to create a sub-two-minute action, records the challenge adjustment, and falls back to a deterministic reducer if the agent is unavailable. `Process` runs the real local `process` skill through a fixed-purpose server bridge, then refreshes the live vault-backed quest state. The bridge is localhost-only, development-only, accepts no arbitrary commands, requires no API key, and is unavailable on Vercel. The execution screen no longer exposes charts, horizon maps, context cards, or a competing quest queue. All source tasks remain preserved in the Obsidian outbox and durable ledger.

## 2026-08-27 adaptive quest runner

The private `/life` command center now runs a single playable-action loop. The main quest exposes one next action, a `Too hard? Make it smaller` control reduces it through four challenge levels, and a bounded count-up stopwatch offers 2, 5, 10, or 25-minute sessions. Pressing `Too hard` also selects the two-minute timebox. The quest queue shows only three open quests until explicitly expanded, while all tasks remain preserved. The vault parser now supports checklist bullets, `Done means`, `[Tier]`, and `[P]` metadata from the current outbox format. TypeScript, the production build, desktop and mobile rendering, and the live shrink and stopwatch interactions passed on 2026-08-27.

## 2026-08-26 private life command center

The public site and private owner experience were overhauled. `/` is the new public product page, `/board` preserves the browser-local public game, and `/life` is the private vault-backed command center. Google OAuth is restricted to `AUTH_ALLOWED_EMAIL`; `/money-os` now uses the same identity boundary. Local development parses `🐆 outbox.md` and `🌟 S-TIER LIFE.md` server-side, while Neon stores a user-triggered parsed snapshot plus durable completion timestamps and XP. Read `README.md`, `DESIGN.md`, and `research/AI-LIFE-COMMAND-CENTER-PEERS-2026.md` before changing this system. The 2026-08-26 TypeScript check, production build, and rendered 1440 px and 390 px UI audit passed. Real production OAuth and deployment still require owner configuration.

Context for Claude Code, Codex, and humans working in this folder.

**Mobile and desktop bridge:** read `MOBILE_DESKTOP_BRIDGE.md`. The ChatGPT
project `🦖 theside.quest` is the mobile voice inbox. This local `🐦‍🔥 themain.quest` project
is the canonical desktop workspace. Route durable life state to the Obsidian vault
and project work to the relevant Aether repository. Do not ask Adam to repeat context
already present in a handed-off conversation or canonical source file.

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
