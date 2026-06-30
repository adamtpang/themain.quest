import { Priority } from "./types";

// Schools (Wizard101): you LEVEL a discipline by closing real quests in it.
// No self-rating. The level is earned, mapped from each quest's priority lane.

export type SchoolId = "money" | "wealth" | "body" | "love" | "mind" | "craft";
export type Schools = Record<SchoolId, number>; // lifetime XP per school

export const SCHOOL_IDS: SchoolId[] = ["money", "wealth", "body", "love", "mind", "craft"];

export const SCHOOL_OF: Record<Priority, SchoolId> = {
  Leverage: "money",
  Marketplace: "wealth",
  Health: "body",
  Life: "love",
  Visa: "mind",
  Taxes: "mind",
  Loops: "craft",
};

export const SCHOOL_META: Record<
  SchoolId,
  { name: string; emoji: string; bar: string; text: string }
> = {
  money: { name: "Money", emoji: "💰", bar: "bg-gold", text: "text-gold" },
  wealth: { name: "Wealth", emoji: "💎", bar: "bg-marketplace", text: "text-marketplace" },
  body: { name: "Body", emoji: "💪", bar: "bg-health", text: "text-health" },
  love: { name: "Love", emoji: "❤️", bar: "bg-life", text: "text-life" },
  mind: { name: "Mind", emoji: "🧠", bar: "bg-visa", text: "text-visa" },
  craft: { name: "Craft", emoji: "🎨", bar: "bg-leverage", text: "text-leverage" },
};

export function freshSchools(): Schools {
  return { money: 0, wealth: 0, body: 0, love: 0, mind: 0, craft: 0 };
}

// Faster than the global climb so each domain shows visible progress.
function xpForSchoolLevel(level: number): number {
  return 40 * level * (level - 1);
}

export function schoolLevel(xp: number): number {
  let level = 1;
  while (xpForSchoolLevel(level + 1) <= xp) level++;
  return level;
}

export function schoolProgress(xp: number): {
  level: number;
  intoLevel: number;
  span: number;
  pct: number;
} {
  const level = schoolLevel(xp);
  const base = xpForSchoolLevel(level);
  const next = xpForSchoolLevel(level + 1);
  const intoLevel = xp - base;
  const span = next - base;
  return { level, intoLevel, span, pct: span > 0 ? Math.min(100, (intoLevel / span) * 100) : 0 };
}
