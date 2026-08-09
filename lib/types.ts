export type Priority =
  | "Life"
  | "Health"
  | "Visa"
  | "Taxes"
  | "Leverage"
  | "Marketplace"
  | "Loops";

// The three XP tracks (LIFE_GAME.md, decided 2026-08-07). Overall level is the
// LOWEST of the three, not the average or the sum — a pillar cannot be
// starved by a big week in the others. Not every quest has to carry one: Life,
// Visa, and Loops priorities stay untracked infrastructure, same as before.
export type Pillar = "Health" | "Wealth" | "Wisdom";

export const PILLAR_ORDER: Pillar[] = ["Health", "Wealth", "Wisdom"];

// Full, literal Tailwind classes — never build these with template
// interpolation (`` `bg-${x}` ``). Tailwind's compiler scans source for
// literal strings; bg-sky/text-sky in particular appear nowhere else as a
// literal, so a dynamic build would silently generate no CSS for Wisdom.
// Real tokens only, from tailwind.config.ts: "wealth"/"wisdom" classes do not
// exist in the theme. Health reuses its own priority color; Wealth borrows
// gold (already the Climb panel's money color); Wisdom borrows sky.
export const PILLAR_BG: Record<Pillar, string> = {
  Health: "bg-health",
  Wealth: "bg-gold",
  Wisdom: "bg-sky",
};
export const PILLAR_TEXT: Record<Pillar, string> = {
  Health: "text-health",
  Wealth: "text-gold",
  Wisdom: "text-sky",
};

// Deterministic priority -> pillar mapping, per LIFE_GAME.md. Only 3 of 7
// priorities map automatically; Life, Visa, and Loops are intentionally
// absent (they don't fit a single pillar), and nothing currently auto-derives
// Wisdom — it is earned only through its own XP table until a quest is
// explicitly tagged.
export const PRIORITY_TO_PILLAR: Partial<Record<Priority, Pillar>> = {
  Health: "Health",
  Leverage: "Wealth",
  Marketplace: "Wealth",
  Taxes: "Wealth",
};

// The cheap auto-tag path: derive a default pillar from priority alone. Falls
// through to undefined for Life/Visa/Loops and for anything meant to earn
// Wisdom, which always needs an explicit tag (see PRIORITY_TO_PILLAR above).
export function deriveDefaultPillar(priority: Priority): Pillar | undefined {
  return PRIORITY_TO_PILLAR[priority];
}

export type RungN = 6 | 7 | 8 | 9 | 10;

export type Quest = {
  id: string;
  title: string;
  priority: Priority;
  pillar?: Pillar; // which XP track this feeds; undefined = untracked infra
  party?: string; // real person this quest is done WITH; earns synergy XP (lib/party.ts)
  route?: string; // which Aether Claude Code session actually handles this (lib/route.ts); undefined = this session
  passesMotionTest: boolean; // false => grey "MOTION" tag, 0 points, parked
  done: boolean;
  isBinding: boolean; // only ONE quest can be true; must pass Motion Test
  createdAt: string;
  scheduledTime?: string; // "10:30" parsed from an outbox ⏰ marker
  rungHint?: RungN; // which rung this quest feeds, parsed from a 🧹6/🥇7/... tag
  xpAwarded?: boolean; // true once this close has paid lifetime XP (never re-pays)
};

export type Rung = {
  n: RungN;
  label: string;
  emoji: string;
  blurb: string;
  done: boolean;
};

export type DayState = {
  date: string; // YYYY-MM-DD, local
  rungs: Rung[];
};

// Hard-coded priority sort order. Loops always sorts dead last by design.
export const PRIORITY_ORDER: Priority[] = [
  "Life",
  "Health",
  "Visa",
  "Taxes",
  "Leverage",
  "Marketplace",
  "Loops",
];

// Display labels (the type keys stay short; the board shows the full names).
export const PRIORITY_LABEL: Record<Priority, string> = {
  Life: "Life",
  Health: "Health.fun",
  Visa: "Visa",
  Taxes: "Taxes",
  Leverage: "Leverage-maxxing",
  Marketplace: "Marketplace-maxxing",
  Loops: "Loops",
};

// Tailwind text/border/bg color tokens per priority.
export const PRIORITY_COLOR: Record<Priority, string> = {
  Life: "life",
  Health: "health",
  Visa: "visa",
  Taxes: "taxes",
  Leverage: "leverage",
  Marketplace: "marketplace",
  Loops: "loops",
};

export const KEYSTONE_RUNG: RungN = 7;

export function freshRungs(): Rung[] {
  return [
    { n: 6, emoji: "🧹", label: "Loaded in", blurb: "Plan set, inbox and comms cleared", done: false },
    { n: 7, emoji: "🥇", label: "Goal hit", blurb: "The ONE binding goal is done", done: false },
    { n: 8, emoji: "💚", label: "Body taxed", blurb: "Real physical exertion logged", done: false },
    { n: 9, emoji: "❤️", label: "Love logged", blurb: "Meaningful connection with someone who matters", done: false },
    { n: 10, emoji: "🌅", label: "Clean close", blurb: "Outbox updated, tomorrow's #1 set, clean shutdown", done: false },
  ];
}
