# themain.quest

A private, century-scale life command center with a public playable demo.

The product keeps the long-range life vision connected to one clear move today. It converts the current Obsidian outbox into prioritized quests, gives XP only for completed real-world outcomes, visualizes momentum and life domains, and preserves lower-priority work below the fold.

## Routes

- `/` is the public product site.
- `/board` is the original public, browser-local life game.
- `/signin` is the single-user Google sign-in.
- `/life` is the OAuth-protected life command center.
- `/money-os` is also protected by the same approved Google identity.

## Private command center

The authenticated dashboard includes:

- one main quest selected by tier and inaction cost
- a 25-minute focus strike
- durable XP and completion history
- seven-day momentum
- progress across Stability, Body, Money, Love, and Create
- quick quests with steps and explicit done conditions
- a linked horizon map from 100 years to today
- light and dark modes

In local development, the server reads `🐆 outbox.md` and `🌟 S-TIER LIFE.md` from the configured Obsidian vault. The browser never receives the raw files. A user-triggered sync stores the parsed private snapshot and progress ledger in the existing Neon key/value table so the production dashboard can use it without direct filesystem access.

## Authentication setup

1. Create a Google OAuth web application.
2. Add these authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://themain.quest/api/auth/callback/google`
3. Copy `.env.example` to `.env.local`.
4. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `AUTH_ALLOWED_EMAIL`.
5. Set `DATABASE_URL` to the Neon database used by the app.
6. Optionally set `OBSIDIAN_VAULT_PATH`. Local development otherwise uses `%USERPROFILE%\ObsidianVault`.

`AUTH_DEV_BYPASS=true` is only for local visual verification. The code ignores it in production.

## Run and verify

```bash
npm install
npm run dev
npm run lint
npm run build
```

The rendered UI verifier is available as `npm run verify:ui`. It expects Playwright and a browser executable through the environment described in `DESIGN.md`.

## Architecture

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS and shadcn/ui primitives
- Auth.js through `next-auth` Google OAuth
- Neon Postgres for cross-device state
- Recharts for momentum visualization
- Vercel Analytics

No private vault content is committed to the repository.
