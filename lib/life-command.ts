import "server-only";

import { createHash } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { computeLifeLeft } from "@/lib/life";
import { levelInfo } from "@/lib/progress";
import type {
  LifeCommandData,
  LifeHorizon,
  LifeQuest,
  LifeSharedState,
  PillarSignal,
  TrendPoint,
} from "@/lib/life-command-types";

const STATE_KEY = "life_command_center";
const TIME_ZONE = "Asia/Singapore";

export const EMPTY_SHARED_STATE: LifeSharedState = {
  version: 1,
  completedQuestIds: [],
  completedAtById: {},
  completedXpById: {},
  daily: {},
};

function dateKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function stableId(title: string): string {
  return createHash("sha1").update(title.trim().toLowerCase()).digest("hex").slice(0, 12);
}

function cleanMarkdown(value: string): string {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function categoryFor(title: string): LifeQuest["category"] {
  const text = title.toLowerCase();
  if (/home|housing|apartment|move-out|lodging/.test(text)) return "Stability";
  if (/body|eat|food|protein|sleep|pool|shower|pickleball|health/.test(text)) return "Body";
  if (/money|income|invoice|sell|listing|wise|job|paid|client/.test(text)) return "Money";
  if (/love|message|repair|apology|friend|family|intimacy|partner|relationship/.test(text)) return "Love";
  if (/publish|song|music|write|post|podcast|creative|guitar/.test(text)) return "Create";
  return "General";
}

function routeFor(block: string): string | null {
  const route = block.match(/Route:\s*`?([^`\n;]+)`?/i)?.[1]?.trim();
  if (!route || /^no session/i.test(route)) return null;
  const normalized = route.replace(/[\\/]+$/, "");
  return normalized.split(/[\\/]/).pop() ?? normalized;
}

function parseDoNow(outbox: string): LifeQuest[] {
  const beforeLater = outbox.split(/^#\s+🟡\s+LATER/im)[0];
  const headings = [...beforeLater.matchAll(/^##\s+([^\n]+Tier\s+(\d+):\s*([^\n]+))$/gim)];
  const quests: LifeQuest[] = [];

  const warmup = cleanMarkdown(beforeLater.slice(0, headings[0]?.index ?? 0));
  if (warmup) {
    quests.push({
      id: stableId(warmup),
      title: warmup,
      tier: 5,
      category: categoryFor(warmup),
      emoji: "⚡",
      steps: [warmup],
      doneWhen: "The activation step is complete.",
      route: null,
      xp: 40,
      inactionCost: 7,
      completed: false,
    });
  }

  headings.forEach((heading, index) => {
    const start = heading.index ?? 0;
    const end = headings[index + 1]?.index ?? beforeLater.length;
    const block = beforeLater.slice(start, end);
    const tier = Number(heading[2]);
    const title = cleanMarkdown(heading[3]);
    const emoji = heading[1].trim().split(/\s+/)[0] || "✦";
    const steps = [...block.matchAll(/^\d+\.\s+(.+)$/gm)].map((match) => cleanMarkdown(match[1]));
    const doneWhen = cleanMarkdown(block.match(/^Done when:\s*(.+)$/im)?.[1] ?? "The outcome exists in the world.");

    quests.push({
      id: stableId(title),
      title,
      tier,
      category: categoryFor(title),
      emoji,
      steps,
      doneWhen,
      route: routeFor(block),
      xp: tier * 20,
      inactionCost: Math.min(10, tier + Math.max(1, 6 - index)),
      completed: false,
    });
  });

  return quests.sort((left, right) =>
    right.inactionCost - left.inactionCost || right.tier - left.tier
  );
}

function countLater(outbox: string): number {
  const later = outbox.split(/^#\s+🟡\s+LATER/im)[1] ?? "";
  return [...later.matchAll(/^- \[[ x]\]\s+/gim)].length;
}

function extractNorthStar(sTierLife: string): string {
  const section = sTierLife.match(/## The perfect ordinary day[^\n]*\n([\s\S]*?)(?=\n##\s|$)/i)?.[1] ?? "";
  const firstParagraph = section
    .split(/\n\s*\n/)
    .map(cleanMarkdown)
    .find((value) => value && !value.startsWith("<!--"));
  return firstParagraph?.slice(0, 260) || "Build a life that feels worth playing.";
}

function progressBetween(now: number, start: number, end: number): number {
  if (end <= start) return 0;
  return Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
}

function makeHorizons(now: Date, topQuest: string): LifeHorizon[] {
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const monday = new Date(now);
  const weekday = (now.getDay() + 6) % 7;
  monday.setDate(day - weekday);
  monday.setHours(0, 0, 0, 0);

  const life = computeLifeLeft(now);
  const currentAge = 100 - life.yearsLeft;
  const decadeStartAge = Math.floor(currentAge / 10) * 10;
  const todayStart = new Date(year, month, day).getTime();

  return [
    { label: "100 years", detail: "Whole life", progress: life.percentElapsed, focus: "Live the vision" },
    { label: "10 decades", detail: `Decade ${Math.floor(currentAge / 10) + 1}`, progress: ((currentAge - decadeStartAge) / 10) * 100, focus: "Build the current age" },
    { label: "10 years", detail: `Age ${decadeStartAge} to ${decadeStartAge + 10}`, progress: ((currentAge - decadeStartAge) / 10) * 100, focus: "Compound the pillars" },
    { label: "1 year", detail: String(year), progress: progressBetween(now.getTime(), new Date(year, 0, 1).getTime(), new Date(year + 1, 0, 1).getTime()), focus: "Turn intent into proof" },
    { label: "12 months", detail: now.toLocaleString("en", { month: "long", timeZone: TIME_ZONE }), progress: progressBetween(now.getTime(), new Date(year, month, 1).getTime(), new Date(year, month + 1, 1).getTime()), focus: "Close the live bottleneck" },
    { label: "4 weeks", detail: "Current month", progress: progressBetween(now.getTime(), new Date(year, month, 1).getTime(), new Date(year, month + 1, 1).getTime()), focus: "Ship visible outcomes" },
    { label: "1 week", detail: "Monday to Sunday", progress: progressBetween(now.getTime(), monday.getTime(), monday.getTime() + 7 * 86400000), focus: topQuest },
    { label: "7 days", detail: "Rolling window", progress: Math.min(100, ((weekday + 1) / 7) * 100), focus: "Win the next day" },
    { label: "Today", detail: dateKey(now), progress: progressBetween(now.getTime(), todayStart, todayStart + 86400000), focus: topQuest },
  ];
}

function makeTrend(shared: LifeSharedState, todayScore: number, todayXp: number, completedToday: number): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(Date.now() - offset * 86400000);
    const key = dateKey(date);
    const saved = shared.daily[key];
    const isToday = offset === 0;
    points.push({
      date: key,
      label: new Intl.DateTimeFormat("en", { weekday: "short", timeZone: TIME_ZONE }).format(date),
      score: isToday ? todayScore : saved?.score ?? 5,
      xp: isToday ? todayXp : saved?.xp ?? 0,
      quests: isToday ? completedToday : saved?.quests ?? 0,
    });
  }
  return points;
}

function makePillars(quests: LifeQuest[]): PillarSignal[] {
  const names: PillarSignal["name"][] = ["Stability", "Body", "Money", "Love", "Create"];
  return names.map((name) => {
    const matching = quests.filter((quest) => quest.category === name);
    const completed = matching.filter((quest) => quest.completed).length;
    return {
      name,
      open: matching.length - completed,
      completed,
      score: matching.length ? Math.round((completed / matching.length) * 100) : 0,
    };
  });
}

function mergeState(base: Omit<LifeCommandData, "trend" | "pillars" | "todayScore" | "completedToday" | "level" | "levelProgress" | "xp" | "xpToNext">, shared: LifeSharedState): LifeCommandData {
  const completed = new Set(shared.completedQuestIds);
  const quests = base.quests.map((quest) => ({ ...quest, completed: quest.completed || completed.has(quest.id) }));
  const today = dateKey();
  const completedToday = quests.filter((quest) =>
    quest.completed && dateKey(new Date(shared.completedAtById?.[quest.id] ?? 0)) === today
  ).length;
  const ledgerXp = Object.values(shared.completedXpById ?? {}).reduce((total, value) => total + value, 0);
  const xp = ledgerXp || quests.filter((quest) => quest.completed).reduce((total, quest) => total + quest.xp, 0);
  const todayScore = Math.min(10, 5 + completedToday);
  const level = levelInfo(xp);

  return {
    ...base,
    quests,
    completedToday,
    todayScore,
    xp,
    level: level.level,
    levelProgress: level.pct,
    xpToNext: Math.max(0, level.neededForNext - level.intoLevel),
    pillars: makePillars(quests),
    trend: makeTrend(shared, todayScore, xp, completedToday),
  };
}

async function readVaultData(shared: LifeSharedState): Promise<LifeCommandData | null> {
  const configured = process.env.OBSIDIAN_VAULT_PATH?.trim();
  const vault = configured || (process.env.NODE_ENV !== "production" && process.env.USERPROFILE
    ? path.join(process.env.USERPROFILE, "ObsidianVault")
    : "");
  if (!vault) return null;

  try {
    const [outbox, sTierLife] = await Promise.all([
      readFile(path.join(vault, "🐆 outbox.md"), "utf8"),
      readFile(path.join(vault, "🌟 S-TIER LIFE.md"), "utf8"),
    ]);
    const quests = parseDoNow(outbox);
    const now = new Date();
    const life = computeLifeLeft(now);
    const base = {
      generatedAt: now.toISOString(),
      source: "vault" as const,
      northStar: extractNorthStar(sTierLife),
      laterCount: countLater(outbox),
      life: {
        daysLeft: life.daysLeft,
        percentElapsed: life.percentElapsed,
        yearsLeft: life.yearsLeft,
      },
      quests,
      horizons: makeHorizons(now, quests[0]?.title ?? "Choose one clear win"),
    };
    return mergeState(base, shared);
  } catch {
    return null;
  }
}

function starterData(shared: LifeSharedState): LifeCommandData {
  const now = new Date();
  const life = computeLifeLeft(now);
  const titles = ["Name the one outcome that wins today", "Move your body for twenty minutes", "Make one person feel loved"];
  const quests: LifeQuest[] = titles.map((title, index) => ({
    id: stableId(title),
    title,
    tier: 5,
    category: (["General", "Body", "Love"] as const)[index],
    emoji: ["🎯", "💚", "❤️"][index],
    steps: [title],
    doneWhen: "There is visible proof that the action happened.",
    route: null,
    xp: 100,
    inactionCost: 8 - index,
    completed: false,
  }));
  return mergeState({
    generatedAt: now.toISOString(),
    source: "starter",
    northStar: "Build a life that feels worth playing.",
    laterCount: 0,
    life: { daysLeft: life.daysLeft, percentElapsed: life.percentElapsed, yearsLeft: life.yearsLeft },
    quests,
    horizons: makeHorizons(now, quests[0].title),
  }, shared);
}

export async function readSharedState(): Promise<LifeSharedState> {
  if (!process.env.DATABASE_URL) return EMPTY_SHARED_STATE;
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT value FROM money_os_state WHERE key = ${STATE_KEY} LIMIT 1`;
    const value = rows[0]?.value as LifeSharedState | undefined;
    return value?.version === 1 ? {
      ...EMPTY_SHARED_STATE,
      ...value,
      completedQuestIds: value.completedQuestIds ?? [],
      completedAtById: value.completedAtById ?? {},
      completedXpById: value.completedXpById ?? {},
      daily: value.daily ?? {},
    } : EMPTY_SHARED_STATE;
  } catch {
    return EMPTY_SHARED_STATE;
  }
}

export async function saveSharedState(state: LifeSharedState): Promise<void> {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  const sql = neon(process.env.DATABASE_URL);
  await sql`
    INSERT INTO money_os_state (key, value, updated_at)
    VALUES (${STATE_KEY}, ${JSON.stringify(state)}::jsonb, now())
    ON CONFLICT (key) DO UPDATE
    SET value = ${JSON.stringify(state)}::jsonb, updated_at = now()
  `;
}

export async function getLifeCommandData(shared?: LifeSharedState): Promise<LifeCommandData> {
  const resolved = shared ?? await readSharedState();
  const vault = await readVaultData(resolved);
  if (vault) return vault;
  if (resolved.snapshot) {
    return mergeState({ ...resolved.snapshot, source: "neon" }, resolved);
  }
  return starterData(resolved);
}

export function todayKey(): string {
  return dateKey();
}
