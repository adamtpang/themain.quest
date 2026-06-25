import { makeId } from "./parse";

export type KpiColor =
  | "life"
  | "health"
  | "visa"
  | "taxes"
  | "leverage"
  | "marketplace"
  | "gold";

export type Kpi = {
  id: string;
  emoji: string;
  label: string;
  value: number; // 0..max, a self-rating
  max: number;
  color: KpiColor;
};

// Seeded with the dimensions Adam named. Every tile is editable; add/remove freely.
// Time is shown separately as a derived tile from the life-left clock.
export function defaultKpis(): Kpi[] {
  return [
    { id: makeId(), emoji: "💰", label: "Money", value: 5, max: 10, color: "gold" },
    { id: makeId(), emoji: "💚", label: "Health", value: 5, max: 10, color: "health" },
    { id: makeId(), emoji: "💎", label: "Wealth", value: 5, max: 10, color: "visa" },
    { id: makeId(), emoji: "🧠", label: "Wisdom", value: 5, max: 10, color: "leverage" },
    { id: makeId(), emoji: "❤️", label: "Relationships", value: 5, max: 10, color: "life" },
    { id: makeId(), emoji: "🛠️", label: "Craft", value: 5, max: 10, color: "marketplace" },
  ];
}

export const KPI_COLOR_CLASS: Record<KpiColor, { text: string; bar: string; ring: string }> = {
  life: { text: "text-life", bar: "bg-life", ring: "border-life/40" },
  health: { text: "text-health", bar: "bg-health", ring: "border-health/40" },
  visa: { text: "text-visa", bar: "bg-visa", ring: "border-visa/40" },
  taxes: { text: "text-taxes", bar: "bg-taxes", ring: "border-taxes/40" },
  leverage: { text: "text-leverage", bar: "bg-leverage", ring: "border-leverage/40" },
  marketplace: { text: "text-marketplace", bar: "bg-marketplace", ring: "border-marketplace/40" },
  gold: { text: "text-hud-gold", bar: "bg-hud-gold", ring: "border-hud-gold/40" },
};

export const KPI_COLOR_CYCLE: KpiColor[] = [
  "gold",
  "health",
  "visa",
  "leverage",
  "life",
  "marketplace",
  "taxes",
];
