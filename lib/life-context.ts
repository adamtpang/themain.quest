// The life-context brief: what themain.quest tells summon.guide about Adam's
// life so the guides there can speak to the actual quest instead of giving
// generic advice. Aang consulted his past lives with the real problem in
// front of him; this is the real problem, written down.
//
// The output uses the exact Markdown structure summon.guide's context import
// expects ("# Personal context" plus eight fixed sections), so the same brief
// works whether it arrives through the repos.chat mailbox or gets pasted by
// hand. This module is pure: it parses text it is given and never touches the
// filesystem, so it can be tested without a vault.

export type QuestState = "done" | "open" | "locked" | "boss";

export type QuestLine = {
  state: QuestState;
  title: string;
};

export type QuestSection = {
  heading: string;
  quests: QuestLine[];
  paths: string[];
};

export type LifeContextSources = {
  generatedAt: string;
  questbook?: string | null;
  deathguide?: string | null;
  character?: string | null;
  oneMove?: {
    title: string;
    category: string;
    estimatedMinutes: number;
    openCount: number;
  } | null;
  recentSkipReasons?: string[];
};

export const LIFE_CONTEXT_HEADING = "# Personal context";

const STATE_BY_MARK: Record<string, QuestState> = {
  "✅": "done",
  "🔓": "open",
  "⬛": "locked",
};

const MAX_SECTIONS = 6;
const MAX_QUESTS_PER_SECTION = 8;
const MAX_ITEMS = 8;

/** Money amounts stay out of the brief; the deadline is what matters. */
export function redactAmounts(text: string): string {
  return text
    .replace(/[-–]?\s?(?:RM|MYR|USD|US\$|\$)\s?[\d,]+(?:\.\d+)?(?:\s?[kKmM]\b)?/g, "[amount]")
    .replace(/\[amount\]\s*\(debt\)/g, "[amount] (debt)");
}

/** The one move is a full outbox line; the guides only need its first clause. */
export function shortenMove(title: string): string {
  const cleaned = redactAmounts(cleanInline(title));
  const firstClause = cleaned.split(/(?<=[.!?])\s|:\s|\s\(/)[0] ?? cleaned;
  return firstClause.length > 120 ? `${firstClause.slice(0, 117).trimEnd()}...` : firstClause;
}

export function cleanInline(value: string): string {
  return value
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSections(markdown: string): Array<{ heading: string; body: string }> {
  const lines = markdown.split(/\r?\n/);
  const sections: Array<{ heading: string; body: string[] }> = [];
  let current: { heading: string; body: string[] } | null = null;
  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      current = { heading: cleanInline(heading[1]), body: [] };
      sections.push(current);
      continue;
    }
    if (current) current.body.push(line);
  }
  return sections.map((section) => ({ heading: section.heading, body: section.body.join("\n") }));
}

/**
 * Reads quest lines of the form `- ✅ **Q1. Title** : details` and fork
 * headers of the form `**Path A: ...**`. Only the bold title survives, which
 * keeps other people's names and day-level details out of the brief.
 */
export function parseQuestbook(markdown: string): QuestSection[] {
  const sections: QuestSection[] = [];
  for (const section of splitSections(markdown)) {
    const quests: QuestLine[] = [];
    const paths: string[] = [];
    for (const rawLine of section.body.split("\n")) {
      const line = rawLine.trim();
      const quest = line.match(/^-\s*(✅|🔓|⬛)\s*\*\*(.+?)\*\*/u);
      if (quest) {
        const title = cleanInline(quest[2]);
        const isBoss = /👑|\bBOSS\b/u.test(title);
        quests.push({ state: isBoss ? "boss" : STATE_BY_MARK[quest[1]], title });
        continue;
      }
      const path = line.match(/^\*\*(Path\s+[A-Z][^*]*)\*\*/);
      if (path) paths.push(cleanInline(path[1]));
    }
    if (quests.length || paths.length) {
      sections.push({ heading: section.heading, quests: quests.slice(0, MAX_QUESTS_PER_SECTION), paths });
    }
  }
  return sections.slice(0, MAX_SECTIONS);
}

export function questbookTitle(markdown: string): string | null {
  const title = markdown.match(/^#\s+(.+)$/m)?.[1];
  return title ? cleanInline(title).replace(/^🗺️\s*/u, "") : null;
}

export function parseBullets(markdown: string, heading: string): string[] {
  const section = splitSections(markdown).find((entry) =>
    entry.heading.toLowerCase().includes(heading.toLowerCase()),
  );
  if (!section) return [];
  return [...section.body.matchAll(/^\s*-\s+(?!\[)(.+)$/gm)]
    .map((match) => cleanInline(match[1]))
    .filter(Boolean)
    .slice(0, MAX_ITEMS);
}

export type TableRow = string[];

export function parseTable(markdown: string, heading: string): TableRow[] {
  const section = splitSections(markdown).find((entry) =>
    entry.heading.toLowerCase().includes(heading.toLowerCase()),
  );
  if (!section) return [];
  const rows = section.body
    .split("\n")
    .filter((line) => line.trim().startsWith("|"))
    .map((line) =>
      line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cleanInline(cell)),
    );
  return rows.filter((row) => row.length > 1 && !row.every((cell) => /^-+$/.test(cell))).slice(1, MAX_ITEMS + 1);
}

function questsByState(section: QuestSection, state: QuestState): string[] {
  return section.quests.filter((quest) => quest.state === state).map((quest) => quest.title);
}

function bullet(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function buildLifeContextBrief(sources: LifeContextSources): string {
  const questbook = sources.questbook ?? "";
  const sections = parseQuestbook(questbook);
  const main = sections[0];
  const fork = sections.find((section) => section.paths.length);
  const boss = sections.flatMap((section) => section.quests).find((quest) => quest.state === "boss");
  const openQuests = sections.flatMap((section) => questsByState(section, "open"));
  const lockedQuests = sections.flatMap((section) => questsByState(section, "locked"));
  const doneQuests = main ? questsByState(main, "done") : [];

  const conditions = sources.character ? parseTable(sources.character, "CONDITIONS") : [];
  const vitals = sources.character ? parseTable(sources.character, "VITALS") : [];
  const abilities = sources.character ? parseTable(sources.character, "ABILITY") : [];
  const northStar = sources.deathguide ? parseBullets(sources.deathguide, "North star") : [];
  const openQuestions = [...questbook.matchAll(/open question[^:]*:\s*([^\n]+(?:\n\s{2,}[^\n]+)*)/gi)]
    .map((match) => cleanInline(match[1]))
    .slice(0, 3);

  const situation: string[] = [];
  const title = questbookTitle(questbook);
  if (title) situation.push(`Current questbook run: ${title}.`);
  if (main) {
    situation.push(
      `${main.heading}: ${doneQuests.length} done, ${questsByState(main, "open").length} open now, ${questsByState(main, "locked").length} locked.`,
    );
  }
  if (sources.oneMove) {
    const move = sources.oneMove;
    situation.push(
      `Today's one move: ${shortenMove(move.title)} (${move.category}, about ${move.estimatedMinutes} min). ${move.openCount} open quests on today's board.`,
    );
  }
  if (abilities.length) {
    situation.push(
      `Character sheet: ${abilities.map((row) => `${row[0]} ${row[1]}`).join(", ")}.`,
    );
  }

  const problems: string[] = [];
  if (fork) {
    problems.push(`${fork.heading}: ${fork.paths.join(" / ")}`);
  }
  for (const row of conditions.filter((entry) => /ACTIVE/i.test(entry[2] ?? ""))) {
    problems.push(`Active condition ${row[0]}: ${row[1]}.`);
  }

  const goals: string[] = [];
  if (boss) goals.push(`Boss: ${boss.title}.`);
  for (const quest of openQuests.slice(0, 4)) goals.push(`Open now: ${quest}.`);

  const priorities: string[] = [];
  if (sources.oneMove) priorities.push(`First, today's one move: ${shortenMove(sources.oneMove.title)}.`);
  openQuests.slice(0, MAX_ITEMS).forEach((quest, index) => priorities.push(`${index + 1 + (sources.oneMove ? 1 : 0)}. ${quest}`));
  for (const quest of lockedQuests.slice(0, 2)) priorities.push(`Later, still locked: ${quest}`);

  const constraints: string[] = [];
  for (const row of vitals) constraints.push(`${row[0]}: ${redactAmounts(row[1])}.`);
  for (const date of [...new Set([...questbook.matchAll(/\b(?:before|by|until)\s+\*{0,2}(\d{4}-\d{2}-\d{2}|[A-Z][a-z]{2,8}\s+\d{1,2})\*{0,2}/g)].map((match) => match[1]))].slice(0, 3)) {
    constraints.push(`Deadline named in the questbook: ${date}.`);
  }

  const patterns: string[] = [];
  for (const row of conditions) patterns.push(`${row[0]} (${row[2]}): ${row[1]}.`);
  for (const reason of (sources.recentSkipReasons ?? []).slice(0, 3)) {
    patterns.push(`Recent skip reason: ${cleanInline(reason)}.`);
  }

  const guidance: string[] = [
    "Direct and specific. Name the one move, then stop. Cite what you actually did in your own life, never generic advice.",
    "Argue with the plan when it deserves it. Sycophancy wastes the session.",
    ...northStar.slice(0, 5).map((line) => `Standing value: ${line}`),
  ];

  const questions: string[] = [
    ...openQuestions.map((question) => `Open question: ${question}`),
    "Names of other people may appear inside quest titles. Do not speculate about them; ask if it matters.",
    "The brief is a compressed snapshot. Ask before assuming anything it does not state.",
  ];

  const brief = [
    LIFE_CONTEXT_HEADING,
    `_Generated ${sources.generatedAt} by themain.quest from the questbook, death guide, character sheet, and live outbox. Review before sending it anywhere._`,
    "",
    "## Current situation",
    bullet(situation.length ? situation : ["No questbook was available when this brief was generated."]),
    "",
    "## Problems I want to solve",
    bullet(problems.length ? problems : ["No fork or active condition is recorded right now."]),
    "",
    "## Goals",
    bullet(goals.length ? goals : ["No boss quest is recorded right now."]),
    "",
    "## Priorities",
    bullet(priorities.length ? priorities : ["No open quests are recorded right now."]),
    "",
    "## Constraints",
    bullet(constraints.length ? constraints : ["No vitals or deadlines are recorded right now."]),
    "",
    "## Patterns",
    bullet(patterns.length ? patterns : ["No conditions are recorded right now."]),
    "",
    "## Guidance that works for me",
    bullet(guidance),
    "",
    "## Open questions",
    bullet(questions),
    "",
  ].join("\n");

  return brief;
}

export function briefWordCount(brief: string): number {
  return wordCount(brief);
}
