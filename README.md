# themain.quest

A private life command center that turns the current Obsidian outbox into one playable next quest.

The private runner is intentionally narrower than a dashboard. It shows one goal, one physical next action, one stopwatch, and three choices: finish it, make it smaller, or skip it with a reason. Everything else stays preserved in the source outbox.

## Routes

- `/` is the public product site.
- `/board` is the original public, browser-local life game.
- `/signin` is the single-user Google sign-in.
- `/life` is the OAuth-protected life command center.
- `/money-os` is also protected by the same approved Google identity.

## Private quest runner

The authenticated `/life` route includes:

- exactly one current quest, selected from the open outbox by inaction cost and then strategic tier
- a clear `Done means` goal and one concrete `Do this now` action
- a 2, 5, 10, or 25-minute count-up stopwatch with immediate progress feedback
- `Too hard? Make it smaller`, which asks the local AI agent for a sub-two-minute physical action while preserving the original goal
- a safe deterministic fallback when the local AI agent is unavailable
- `Skip and explain why`, which preserves the quest, records the reason, and advances to the next open quest
- a visible Level, XP, and Day score strip plus durable completions, skip reasons, challenge adjustments, and a compact learning summary
- a `Process vault` control that runs the vault-only portion of the local `process` skill and refreshes the outbox-backed quest state
- light and dark modes

In local development, the server reads only `🐆 outbox.md` from the configured Obsidian vault. The browser receives only parsed day-scoped quest and game-state fields. Tier 1 is the highest strategic tier. Quest instances are scoped to the current day so a recurring task does not inherit yesterday's completion. The local `Process` and AI shrink actions use the owner's authenticated Claude CLI subscription, not an API key. They are fixed-purpose server actions and cannot execute arbitrary browser-supplied commands.

Process edits an isolated copy of the vault with file-only tools. This dashboard action is deliberately vault-only. It does not fetch a live calendar or route work into external Aether repositories. Run the full `$process` workflow in Codex when calendar ingestion or project routing is required. The server rejects deletions, lost task captures, non-Markdown changes, invalid day queues, concurrent live edits, and disallowed punctuation before it applies validated files to the live vault. Each applied run keeps a durable local recovery journal and the original changed files under `.tmq-process-backups`. Interrupted runs are rolled back before another Process run begins. If vault changes commit before the Neon snapshot succeeds, the journal remains pending and the next vault Process run retries synchronization. Every successful user-triggered run then stores the minimal parsed private snapshot and progress ledger in Neon so the deployed dashboard can display the latest synchronized state without direct filesystem access. Neon writes use optimistic revisions and retries so concurrent actions cannot silently overwrite one another, while read failures stop mutations instead of becoming empty progress. Vercel cannot reach the private vault or local Claude CLI, so `Process vault` and AI shrink are local-desktop capabilities. The deployed experience keeps the protected snapshot, completion, skip, and built-in shrink behavior. Every mutation requires same-origin JSON. Local agent mutations also require an ephemeral high-entropy capability.

When neither a local vault nor a synchronized Neon snapshot is available, `/life` presents three clearly labeled starter quests so the interaction remains understandable without pretending they came from the owner.

## Flow design basis

The runner makes three well-supported flow antecedents visible on every quest: clear goals, immediate feedback, and challenge-skill balance. The implementation also uses autonomy, short timeboxes, a low-friction start, and recovery-friendly scope. These choices align with [FlowState's practical pillars](https://www.flowstate.com/flow/pillars), the [Flow Research Collective](https://www.flowresearchcollective.com/), a [meta-analysis of challenge-skill balance](https://www.tandfonline.com/doi/full/10.1080/17439760.2014.967799), and a [review of workplace flow interventions](https://pmc.ncbi.nlm.nih.gov/articles/PMC10360049/).

Marketing multipliers are not treated as scientific facts. The product uses the recurring design principles, then learns from the owner's actual completions, skips, and challenge adjustments.

## Authentication setup

1. Create a Google OAuth web application.
2. Add these authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://themain.quest/api/auth/callback/google`
3. Copy `.env.example` to `.env.local`.
4. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `AUTH_ALLOWED_EMAIL`.
5. Set `DATABASE_URL` to the Neon database used by the app.
6. Optionally set `OBSIDIAN_VAULT_PATH`. Local development otherwise uses `%USERPROFILE%\ObsidianVault`.
7. Keep `LIFE_LOCAL_AGENT_ENABLED=true` to enable the local Process and AI shrink actions.
8. Optionally set `CLAUDE_CLI_PATH`, `LIFE_LOCAL_AGENT_MODEL`, or `PROCESS_SKILL_PATH`. The defaults use `claude`, `sonnet`, and the Process skill under the current user profile.

`AUTH_DEV_BYPASS=true` is only for local visual verification. The code ignores it in production.

`ANTHROPIC_API_KEY` is not required or supported by the private quest runner.

## Run and verify

```bash
npm install
npm run dev
npm run lint
npm run build
```

Use `npm run verify:ui` for the rendered public and private surfaces. Use `npm run verify:life` for unit tests plus the interaction and landing checks. The interaction check validates the browser loop with mocked AI and Process completions, so it never mutates the live vault. Verification defaults to Playwright Chromium and accepts `UI_BASE_URL`; rendered checks also accept `BROWSER_EXECUTABLE`, `BEAUTIFY_VERIFY_SCRIPT`, and `UI_OUTPUT_DIR`.

## Private HTTP surfaces

- `GET /api/life-state` returns the parsed quest and progress model. `POST` records completion, skips, and built-in adjustments.
- `GET /api/life-agent` reports the local bridge status and capability. `POST` starts vault Process or requests an AI-reduced action on localhost only.
- `/money-os/login` is a compatibility redirect to the shared `/signin` flow.

## Architecture

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS and shadcn/ui primitives
- Auth.js through `next-auth` Google OAuth
- Neon Postgres for cross-device state
- local Claude CLI subscription bridge for Process and adaptive shrinking
- Vercel Analytics

No private vault content is committed to the repository.
