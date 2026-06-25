export type Priority =
  | "Life"
  | "Health"
  | "Visa"
  | "Taxes"
  | "Leverage"
  | "Marketplace"
  | "Loops";

export type Quest = {
  id: string;
  title: string;
  priority: Priority;
  passesMotionTest: boolean; // false => grey "MOTION" tag, 0 points, parked
  done: boolean;
  isBinding: boolean; // only ONE quest can be true; must pass Motion Test
  createdAt: string;
};

export type RungN = 6 | 7 | 8 | 9 | 10;

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
