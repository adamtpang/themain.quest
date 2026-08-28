import "server-only";

import { createHash } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { levelInfo } from "@/lib/progress";
import type {
  LifeCommandData,
  FlowLearningProfile,
  LifeQuest,
  LifeSharedState,
} from "@/lib/life-command-types";

const STATE_KEY = "life_command_center";
const TIME_ZONE = "Asia/Singapore";

export const EMPTY_SHARED_STATE: LifeSharedState = {
  version: 1,
  revision: 0,
  completedQuestIds: [],
  completedAtById: {},
  completedXpById: {},
  skippedQuestIds: [],
  skipHistory: [],
  challengeHistory: [],
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

function stableId(value: string): string {
  return createHash("sha1").update(value.trim().toLowerCase()).digest("hex").slice(0, 12);
}

function uniqueQuestId(title: string, occurrences: Map<string, number>, day = dateKey()): string {
  const key = title.trim().toLowerCase();
  const occurrence = (occurrences.get(key) ?? 0) + 1;
  occurrences.set(key, occurrence);
  return stableId(`${day}::${title}::${occurrence}`);
}

function cleanMarkdown(value: string): string {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
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

function questSteps(block: string): string[] {
  const checklist = [...block.matchAll(/^\s*-\s+\[[ x]\]\s+(.+)$/gim)]
    .map((match) => cleanMarkdown(match[1]));
  if (checklist.length > 0) return checklist;
  return [...block.matchAll(/^\d+\.\s+(.+)$/gm)]
    .map((match) => cleanMarkdown(match[1]));
}

function questDoneWhen(block: string): string {
  const explicit = block.match(/^\*{0,2}(?:Done means|Done when|Outcome)\s*:\*{0,2}\s*(.+)$/im)?.[1];
  return cleanMarkdown(explicit ?? "The outcome exists in the world.");
}

export function parseDoNow(outbox: string, questDay = dateKey()): LifeQuest[] {
  const beforeLater = outbox.split(/^#\s+🟡\s+LATER/im)[0];
  const timedHeadings = [...beforeLater.matchAll(/^###\s+([^\n]+)$/gim)];
  const occurrences = new Map<string, number>();

  if (timedHeadings.length > 0) {
    const quests = timedHeadings.map((heading, index): LifeQuest => {
      const start = heading.index ?? 0;
      const end = timedHeadings[index + 1]?.index ?? beforeLater.length;
      const block = beforeLater.slice(start, end);
      const preceding = beforeLater.slice(0, start);
      const tierHeadings = [...preceding.matchAll(/^##\s+[^\n]*Tier\s+(\d+)[^\n]*$/gim)];
      const tier = Number(heading[1].match(/\[Tier\s+(\d+)\]/i)?.[1] ?? tierHeadings.at(-1)?.[1] ?? 5);
      const displayTitle = cleanMarkdown(heading[1])
        .replace(/^\d{1,2}:\d{2}(?:[-\u2013\u2014]\d{1,2}:\d{2})?\s*·\s*/, "")
        .replace(/\[Tier\s+\d+\]\s*/gi, "")
        .replace(/\[P\d+\]\s*/gi, "")
        .replace(/\s*·\s*↪[\s\S]*$/i, "")
        .replace(/\s+/g, " ")
        .trim();
      const [emojiCandidate, ...titleParts] = displayTitle.split(/\s+/);
      const title = titleParts.length ? titleParts.join(" ") : displayTitle;
      const inactionTen = Number(heading[1].match(/\[P(\d+)\]/i)?.[1] ?? block.match(/\bIC\s+(\d+)\/10\b/i)?.[1] ?? 0);
      const inactionFive = Number(block.match(/\bIC\s+(\d+)\/5\b/i)?.[1] ?? 0);
      const steps = questSteps(block);
      const doneWhen = questDoneWhen(block);

      return {
        id: uniqueQuestId(title, occurrences, questDay),
        title,
        tier,
        category: categoryFor(title),
        emoji: titleParts.length ? emojiCandidate : "✦",
        steps,
        doneWhen,
        route: routeFor(block),
        xp: Math.max(20, (6 - tier) * 20),
        inactionCost: inactionTen || (inactionFive ? inactionFive * 2 : Math.min(10, (6 - tier) + Math.max(1, 6 - index))),
        completed: false,
        skipped: false,
      };
    });

    return quests.sort((left, right) =>
      right.inactionCost - left.inactionCost || left.tier - right.tier
    );
  }

  const headings = [...beforeLater.matchAll(/^##\s+([^\n]+Tier\s+(\d+):\s*([^\n]+))$/gim)];
  const quests: LifeQuest[] = [];

  const warmup = cleanMarkdown(beforeLater.slice(0, headings[0]?.index ?? 0));
  if (warmup) {
    quests.push({
      id: uniqueQuestId(warmup, occurrences, questDay),
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
      skipped: false,
    });
  }

  headings.forEach((heading, index) => {
    const start = heading.index ?? 0;
    const end = headings[index + 1]?.index ?? beforeLater.length;
    const block = beforeLater.slice(start, end);
    const tier = Number(heading[2]);
    const title = cleanMarkdown(heading[3]);
    const emoji = heading[1].trim().split(/\s+/)[0] || "✦";
    const steps = questSteps(block);
    const doneWhen = questDoneWhen(block);

    quests.push({
      id: uniqueQuestId(title, occurrences, questDay),
      title,
      tier,
      category: categoryFor(title),
      emoji,
      steps,
      doneWhen,
      route: routeFor(block),
      xp: Math.max(20, (6 - tier) * 20),
      inactionCost: Math.min(10, (6 - tier) + Math.max(1, 6 - index)),
      completed: false,
      skipped: false,
    });
  });

  return quests.sort((left, right) =>
    right.inactionCost - left.inactionCost || left.tier - right.tier
  );
}

function makeFlowLearning(shared: LifeSharedState): FlowLearningProfile {
  const skipHistory = shared.skipHistory ?? [];
  const challengeHistory = shared.challengeHistory ?? [];
  const recentSkipReasons = [...new Set(skipHistory.slice(-5).map((event) => event.reason))];
  const completedAdjusted = challengeHistory.filter((event) => event.completed).length;
  const note = completedAdjusted > 0
    ? `${completedAdjusted} adjusted quest${completedAdjusted === 1 ? "" : "s"} later became a win.`
    : skipHistory.length || challengeHistory.length
      ? "Each reason and adjustment improves the next recommendation."
      : "The coach starts learning after the first skip or difficulty adjustment.";

  return {
    skipsRecorded: skipHistory.length,
    adjustmentsRecorded: challengeHistory.length,
    recentSkipReasons,
    note,
  };
}

export function mergeState(base: Omit<LifeCommandData, "todayScore" | "completedToday" | "level" | "levelProgress" | "xp" | "xpToNext" | "flowLearning">, shared: LifeSharedState): LifeCommandData {
  const completed = new Set(shared.completedQuestIds);
  const skipped = new Set(shared.skippedQuestIds ?? []);
  const quests = base.quests.map((quest) => ({
    ...quest,
    completed: quest.completed || completed.has(quest.id),
    skipped: skipped.has(quest.id),
  }));
  const today = dateKey();
  const completedToday = Object.values(shared.completedAtById ?? {}).filter((completedAt) => {
    const parsed = new Date(completedAt);
    return Number.isFinite(parsed.getTime()) && dateKey(parsed) === today;
  }).length;
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
    flowLearning: makeFlowLearning(shared),
  };
}

async function readVaultData(shared: LifeSharedState): Promise<LifeCommandData | null> {
  const configured = process.env.OBSIDIAN_VAULT_PATH?.trim();
  const vault = configured || (process.env.NODE_ENV !== "production" && process.env.USERPROFILE
    ? path.join(process.env.USERPROFILE, "ObsidianVault")
    : "");
  if (!vault) return null;

  try {
    const outbox = await readFile(path.join(vault, "🐆 outbox.md"), "utf8");
    const quests = parseDoNow(outbox);
    const now = new Date();
    const base = {
      generatedAt: now.toISOString(),
      source: "vault" as const,
      quests,
    };
    return mergeState(base, shared);
  } catch {
    throw new Error("The live outbox could not be read.");
  }
}

function starterData(shared: LifeSharedState): LifeCommandData {
  const now = new Date();
  const titles = ["Name the one outcome that wins today", "Move your body for twenty minutes", "Make one person feel loved"];
  const quests: LifeQuest[] = titles.map((title, index) => ({
    id: stableId(`${dateKey()}::${title}::1`),
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
    skipped: false,
  }));
  return mergeState({
    generatedAt: now.toISOString(),
    source: "starter",
    quests,
  }, shared);
}

export class LifeStateUnavailableError extends Error {
  constructor(message = "Life progress storage is temporarily unavailable") {
    super(message);
    this.name = "LifeStateUnavailableError";
  }
}

export class LifeStateConflictError extends Error {
  constructor() {
    super("Life progress changed in another request");
    this.name = "LifeStateConflictError";
  }
}

function stringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function parseSharedState(value: unknown): LifeSharedState {
  if (!value || typeof value !== "object") {
    throw new LifeStateUnavailableError("Stored life progress is malformed");
  }
  const candidate = value as Partial<LifeSharedState>;
  if (candidate.version !== 1
    || !stringArray(candidate.completedQuestIds)
    || !candidate.daily
    || typeof candidate.daily !== "object"
    || (candidate.skippedQuestIds !== undefined && !stringArray(candidate.skippedQuestIds))) {
    throw new LifeStateUnavailableError("Stored life progress has an unsupported shape");
  }
  return {
    ...EMPTY_SHARED_STATE,
    ...candidate,
    revision: Number.isInteger(candidate.revision) && (candidate.revision ?? 0) >= 0 ? candidate.revision : 0,
    completedQuestIds: [...candidate.completedQuestIds],
    completedAtById: { ...(candidate.completedAtById ?? {}) },
    completedXpById: { ...(candidate.completedXpById ?? {}) },
    skippedQuestIds: [...(candidate.skippedQuestIds ?? [])],
    skipHistory: [...(candidate.skipHistory ?? [])],
    challengeHistory: [...(candidate.challengeHistory ?? [])],
    daily: { ...candidate.daily },
  };
}

export async function readSharedState(): Promise<LifeSharedState> {
  if (!process.env.DATABASE_URL) return parseSharedState(EMPTY_SHARED_STATE);
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT value FROM money_os_state WHERE key = ${STATE_KEY} LIMIT 1`;
    if (!rows[0]) return parseSharedState(EMPTY_SHARED_STATE);
    return parseSharedState(rows[0].value);
  } catch (cause) {
    if (cause instanceof LifeStateUnavailableError) throw cause;
    throw new LifeStateUnavailableError(cause instanceof Error ? cause.message : undefined);
  }
}

export async function saveSharedState(
  state: LifeSharedState,
  expectedRevision = state.revision ?? 0,
): Promise<LifeSharedState> {
  if (!process.env.DATABASE_URL) throw new LifeStateUnavailableError("DATABASE_URL is not configured");
  const next = { ...state, revision: expectedRevision + 1 };
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      INSERT INTO money_os_state (key, value, updated_at)
      VALUES (${STATE_KEY}, ${JSON.stringify(next)}::jsonb, now())
      ON CONFLICT (key) DO UPDATE
      SET value = ${JSON.stringify(next)}::jsonb, updated_at = now()
      WHERE COALESCE((money_os_state.value ->> 'revision')::integer, 0) = ${expectedRevision}
      RETURNING value
    `;
    if (!rows[0]) throw new LifeStateConflictError();
    return parseSharedState(rows[0].value);
  } catch (cause) {
    if (cause instanceof LifeStateConflictError || cause instanceof LifeStateUnavailableError) throw cause;
    throw new LifeStateUnavailableError(cause instanceof Error ? cause.message : undefined);
  }
}

export async function updateSharedState(
  transition: (current: LifeSharedState) => LifeSharedState | Promise<LifeSharedState>,
): Promise<LifeSharedState> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const current = await readSharedState();
    const next = await transition(current);
    try {
      return await saveSharedState(next, current.revision ?? 0);
    } catch (cause) {
      if (!(cause instanceof LifeStateConflictError) || attempt === 4) throw cause;
    }
  }
  throw new LifeStateConflictError();
}

export async function getLifeCommandData(shared?: LifeSharedState): Promise<LifeCommandData> {
  const resolved = shared ?? await readSharedState();
  try {
    const vault = await readVaultData(resolved);
    if (vault) return vault;
  } catch (cause) {
    const statusMessage = cause instanceof Error ? cause.message : "The live outbox could not be read.";
    if (resolved.snapshot) {
      return mergeState({
        ...resolved.snapshot,
        source: "neon",
        statusMessage: `${statusMessage} Showing the last synced snapshot.`,
      }, resolved);
    }
    return {
      ...starterData(resolved),
      statusMessage: `${statusMessage} Showing starter quests.`,
    };
  }
  if (resolved.snapshot) {
    return mergeState({
      ...resolved.snapshot,
      source: "neon",
    }, resolved);
  }
  return starterData(resolved);
}

export function todayKey(): string {
  return dateKey();
}
