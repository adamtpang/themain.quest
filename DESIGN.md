# Life quest runner design

Updated: 2026-08-28

## Product idea

The command center is a decision surface, not a generic dashboard. It answers three questions in order:

1. What matters most now?
2. What small proof can I create next?
3. How does that proof compound into the larger life?

Planning and motion do not earn XP. Real completed outcomes do. The execution surface shows exactly one open quest so the interface never becomes another source of overwhelm.

The public landing page is the welcoming map of that system. It shows the real one-quest loop instead of an invented analytics dashboard, explains the three flow signals, connects the century horizon to the next two minutes, and routes people to every live product surface.

## Visual reference

The visual language is playful, warm, consumer-facing, and inspired by the emotional clarity of Adventure Time without copying protected characters or art. The page uses one dominant quest card, chunky tactile controls, rounded landscape shapes, and The Main Quest's meadow-green, warm-cream, sky, gold, and ink palette.

The landing-page information architecture takes one structural cue from Tailark: compact navigation, a direct oversized promise, immediate product proof, and a small number of strong sections. The visual identity remains The Main Quest's own meadow world.

## Public navigation

- Desktop exposes Home through the brand mark, plus Life, Board, Money OS, Sign in, and a primary Open Life action.
- Mobile keeps Open Life visible and moves the complete route map into a labeled navigation sheet.
- The landing page repeats the four destination cards with plain-language descriptions so private and public surfaces are never ambiguous.
- Life and Money OS remain protected routes even though their navigation links are public.

## Visual system

- Canvas: warm cream in light mode and moonlit green-black in dark mode.
- Primary action: deep meadow green with white text, or gold on dark surfaces.
- Feedback: green for verified progress, gold for XP, sky for information, violet for life-map continuity.
- Typography: Space Grotesk for reading, Space Mono for compact data, and Press Start 2P as a small brand accent.
- Shape: 12 to 16 px controls and cards, with larger 32 px product framing on the public page.
- Density: the current quest and feedback signals are above the fold. The remaining outbox is counted, never exposed as a competing queue.

## Responsive behavior

- Desktop centers one readable quest card with generous negative space.
- Mobile stacks the goal, action, stopwatch, and controls into one thumb-friendly column.
- The header keeps Process, theme, and account controls available without competing with the quest.
- No breakpoint produces page-level horizontal overflow.

## Interaction and feedback

- Completing a quest writes a durable completion timestamp and XP ledger entry.
- XP survives outbox edits and quest removal.
- Level, total XP, and the current Day score stay visible without exposing a competing quest queue.
- The quest stopwatch provides 2, 5, 10, and 25-minute timeboxes without changing task state.
- `Too hard? Make it smaller` asks the local AI agent for one physical action that can start in under two minutes.
- The agent receives the quest goal, route, current action, and recent challenge history. It never receives an arbitrary command from the browser.
- If the local agent is unavailable, a deterministic built-in reducer provides a safe smaller step.
- Pressing `Too hard` selects the two-minute stopwatch and records the adjustment for later learning.
- `Skip and explain why` requires a reason, preserves the source quest, records the event, and moves to the next open quest.
- When every open quest has been skipped, the runner offers Process instead of silently cycling back.
- `Process vault` runs the vault-only portion of the local `process` skill through the authenticated Claude CLI subscription against an isolated vault copy. It intentionally skips live-calendar ingestion and external Aether repository routing. The full `$process` workflow remains available through Codex for those wider operations.
- The host validates task preservation, Markdown-only changes, a playable day queue, and concurrent live edits before applying files. Durable local journals and original-file backups make interrupted multi-file runs recoverable. A pending journal retries snapshot synchronization on the next vault Process run. Successful synchronization then clears only the temporary skipped set.
- Process preserves every capture and follows the outbox's day-only contract. It never sends, posts, publishes, buys, or communicates externally.
- The three flow signals stay visible: clear goal, immediate feedback, and challenge ready or rebalanced.
- Failed durable writes show a visible error. Completion and skip writes leave the prior durable state intact. A built-in smaller move may remain temporarily even when its learning event could not be saved.

## Flow research basis

The interface implements the recurring antecedents found across flow research and practice:

- Clear goal: every quest exposes a concrete done condition.
- Immediate feedback: the stopwatch, progress ring, XP, completion state, and next quest update immediately.
- Challenge-skill balance: AI or built-in reduction lowers the action without abandoning the outcome.
- Autonomy: the owner may finish, shrink, or skip with an explicit reason.
- Low-friction entry: two-minute starts and a bounded count-up timer reduce activation energy.

Sources include [FlowState's pillars](https://www.flowstate.com/flow/pillars), the [Flow Research Collective](https://www.flowresearchcollective.com/), [Fong et al.'s challenge-skill balance meta-analysis](https://www.tandfonline.com/doi/full/10.1080/17439760.2014.967799), a [neurophysiological framework for flow](https://pmc.ncbi.nlm.nih.gov/articles/PMC11332228/), and a [systematic review of workplace flow interventions](https://pmc.ncbi.nlm.nih.gov/articles/PMC10360049/). The research supports these as useful antecedents, not a guarantee that any single formula will create flow.

## Privacy model

- `/life`, `/money-os`, and their state APIs require a signed Auth.js session.
- Only the email in `AUTH_ALLOWED_EMAIL` may sign in.
- Raw Obsidian Markdown is read only on the server in local development.
- The browser receives only parsed day-scoped quest and game-state fields, never raw Markdown, broader life notes, or absolute vault paths.
- Production reads a parsed Neon snapshot, not the local filesystem.
- The local Claude CLI bridge is disabled in production and rejects non-local, cross-origin, non-JSON, and capability-free mutation requests.
- The development server binds to `127.0.0.1`, and the local agent receives a minimal child-process environment.
- The bridge uses fixed Process and shrink operations. There is no arbitrary prompt or shell endpoint.
- The Process agent receives file-only tools, safe mode, no browser integration, and an empty strict MCP configuration.
- Every mutation requires same-origin JSON. Local agent mutations also require the ephemeral agent capability.
- Neon progress writes use optimistic revisions with conflict retries. Invalid or unavailable reads fail closed.
- No API key is required. The bridge uses the local subscription-authenticated CLI.
- `/life` and `/signin` are marked `noindex`.
- The former Money OS password endpoint is retired with HTTP 410.

## Verification

Verified on 2026-08-28 with a production build, rendered browser audits at 1440 px desktop and 390 px mobile, and a Playwright interaction pass.

- TypeScript check: pass
- Next.js production build: pass
- page-level horizontal overflow: none
- console errors: none after a clean dev-server restart
- one current quest visible: pass
- stopwatch start and progress: pass
- skip reason sheet without data mutation: pass
- adaptive shrink response and two-minute selection with a mocked AI response: pass
- Process vault control, local capability handshake, polling, and refresh with mocked completion: pass
- light and dark body contrast: AA
- card descriptions, labels, values, and primary buttons: AA
- unauthenticated `/life` and `/money-os`: redirect to sign-in
- unauthenticated private state APIs: HTTP 401

Screenshots are stored outside the repository in the local Codex visualizations directory.

The real Google OAuth handshake, production environment variables, Neon production access, and Vercel deployment still require owner configuration and were not claimed as verified. A full Process pass was intentionally not triggered during UI verification because it can legitimately reorganize the live outbox. The Claude CLI subscription handshake and fixed-purpose bridge were verified separately.

The public landing overhaul was also verified on 2026-08-28 against the optimized production server:

- 1440 px light rendering: pass
- 1440 px dark rendering: pass
- 390 px mobile rendering and navigation sheet: pass
- Home, Life, Board, Money OS, and Sign in routes: HTTP 200 in the local owner preview
- page-level horizontal overflow: none
- console errors and failed network responses: none
- TypeScript and Next.js production build: pass

Landing screenshots are stored outside the repository in the local Codex visualizations directory.

## Browser verification environment

- `UI_BASE_URL` selects the server under test and defaults to `http://127.0.0.1:3100` or `http://localhost:3100`, depending on the script.
- `BROWSER_EXECUTABLE` overrides the Playwright Chromium executable.
- `BEAUTIFY_VERIFY_SCRIPT` overrides the rendered-page audit helper.
- `UI_OUTPUT_DIR` selects the screenshot output directory.
- `npm run verify:life` runs unit tests, the mocked quest-loop interaction check, and the rendered landing check.
