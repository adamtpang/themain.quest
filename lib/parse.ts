import { Priority, Quest, RungN } from "./types";

export function makeId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `q_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`;
}

// Motion = renaming, buying domains, building tools, reorganizing systems, planning.
const MOTION_PATTERNS: RegExp[] = [
  /\brename\b/i,
  /\bre-?organi[sz]e\b/i,
  /\brestructur/i,
  /\brefactor\b/i,
  /\bbuy(ing)?\s+(a\s+)?domain\b/i,
  /\bdomain(s)?\b/i,
  /\bset[\s-]?up\b/i,
  /\bconfigur/i,
  /\bbuild(ing)?\s+(a\s+)?(tool|dashboard|app|system|script|bot|site|website)\b/i,
  /\bdashboard\b/i,
  /\bvault\b/i,
  /\bmigrat/i,
  /\bplan(ning)?\b/i,
  /\bresearch\b/i,
  /\borgani[sz]e\b/i,
  /\btweak\b/i,
  /\bpolish\b/i,
  /\btemplate\b/i,
  /\bworkflow\b/i,
  /\bautomation\b/i,
];

const PRIORITY_PATTERNS: Array<{ p: Priority; re: RegExp }> = [
  { p: "Taxes", re: /\b(tax|taxes|irs|lhdn|accountant|filing|deduction|w-?9|1099)\b/i },
  { p: "Visa", re: /\b(visa|mdec|sdec|idi|otavio|immigration|permit|passport|embassy|residen)/i },
  { p: "Health", re: /\b(gym|run|running|lift|workout|exercise|train|training|swim|hike|walk|football|sleep|body|health|stretch|sauna|cardio|sweat)\b/i },
  { p: "Life", re: /\b(call|text|message|reply|love|maanasa|mom|dad|mum|family|friend|dinner|date|visit|hug|connect|partner|girlfriend|wife|sister|brother)\b/i },
  { p: "Leverage", re: /\b(income|pay|paid|invoice|cash|close|deal|client|revenue|contract|proposal|charge|stripe|salary|raise|negotiat|pitch|earn|investor|ask|arc)\b/i },
  { p: "Marketplace", re: /\b(marketplace|listing|list|launch|product|ship|sale|sales|store|onboard|customer|user|signup|sign-?up|waitlist|landing)\b/i },
  { p: "Loops", re: /\b(tool|system|meta|dashboard|rename|domain|vault|refactor|setup|automation|inbox|sweep|email)\b/i },
];

// Rung tags from the processed format: emoji immediately followed by its number.
const RUNG_TAGS: Array<{ re: RegExp; n: RungN }> = [
  { re: /🧹\s?6/u, n: 6 },
  { re: /🥇\s?7/u, n: 7 },
  { re: /💚\s?8/u, n: 8 },
  { re: /❤️?\s?9/u, n: 9 },
  { re: /🌅\s?10/u, n: 10 },
];

// Leading priority emoji used in the processed format.
const EMOJI_PRIORITY: Array<{ re: RegExp; p: Priority }> = [
  { re: /🛂/u, p: "Visa" },
  { re: /💸/u, p: "Leverage" },
  { re: /⚽/u, p: "Health" },
  { re: /🥇/u, p: "Leverage" },
  { re: /❤️|❤/u, p: "Life" },
  { re: /🌅/u, p: "Life" },
  { re: /💚/u, p: "Health" },
  { re: /🧹/u, p: "Loops" },
];

const TIME_RE = /⏰\s?(\d{1,2}:\d{2})/u;
const EXPLAINER_RE =
  /the game|house[\s-]?money|if only one thing|=\s?\d+\/10|cards\s?=|🏆|🃏|📈|that's the whole game|gravy/i;
const HAS_RUNG_RE = /🧹\s?6|🥇\s?7|💚\s?8|❤️?\s?9|🌅\s?10/u;

export function detectMotion(text: string): boolean {
  return MOTION_PATTERNS.some((re) => re.test(text));
}

function detectRung(text: string): RungN | undefined {
  for (const { re, n } of RUNG_TAGS) if (re.test(text)) return n;
  return undefined;
}

function detectTime(text: string): string | undefined {
  const m = text.match(TIME_RE);
  return m ? m[1] : undefined;
}

export function suggestPriority(text: string, isMotion: boolean): Priority {
  if (isMotion) return "Loops";
  for (const { re, p } of EMOJI_PRIORITY) if (re.test(text)) return p;
  for (const { p, re } of PRIORITY_PATTERNS) if (re.test(text)) return p;
  return "Leverage";
}

// Strips list markers, checkboxes, rung tags, times, section labels, and leading emoji.
export function cleanTitle(raw: string): string {
  let t = raw;
  t = t.replace(/[→➡]?\s?(🧹\s?6|🥇\s?7|💚\s?8|❤️?\s?9|🌅\s?10)/gu, "");
  t = t.replace(/⏰\s?\d{1,2}:\d{2}/gu, "");
  t = t.replace(/^[\s>*+\-]*\[[ xX]\]\s*/, "");
  t = t.replace(/^\s*\d+[.)]\s+/, "");
  t = t.replace(/^[\s>*+\-]+/, "");
  t = t.replace(/^\s*🥇?\s*(the goal|first move)\s*[:：]?\s*/i, "");
  // strip leading emoji / section markers
  t = t.replace(/^(?:[\p{Extended_Pictographic}️‍\s]+)/u, "");
  t = t.replace(/\[[^\]]*\]/g, "");
  t = t.replace(/[\s→➡·•]+$/u, "");
  t = t.replace(/\s{2,}/g, " ");
  return t.trim();
}

export function parseOutbox(raw: string): Quest[] {
  const now = new Date().toISOString();
  const out: Quest[] = [];
  let bestBindingIdx = -1;
  let bestBindingScore = 0;

  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;

    const structured = HAS_RUNG_RE.test(line) || /\s[—–]\s/u.test(line);
    const segments = structured ? line.split(/\s[—–]\s/u) : [line];

    for (const seg of segments) {
      if (!seg.trim() || EXPLAINER_RE.test(seg)) continue;

      const rung = detectRung(seg);
      const isGoal = /the goal/i.test(seg);
      const isFirstMove = /first move/i.test(seg);
      const isCheckbox = /^[\s>*+\-]*\[[ xX]\]/.test(seg);

      // For structured lines, drop pure-context fragments (no rung, no goal, not a checkbox).
      if (structured && !rung && !isGoal && !isFirstMove && !isCheckbox) continue;

      const title = cleanTitle(seg);
      if (title.length < 3 || EXPLAINER_RE.test(title)) continue;

      const isMotion = detectMotion(seg);
      const quest: Quest = {
        id: makeId(),
        title,
        priority: suggestPriority(seg, isMotion),
        passesMotionTest: !isMotion,
        done: false,
        isBinding: false,
        createdAt: now,
      };
      const time = detectTime(seg);
      if (time) quest.scheduledTime = time;
      if (rung) quest.rungHint = rung;
      out.push(quest);

      // The boss is the hardest income/life close: THE GOAL > FIRST MOVE > any rung-7 line.
      const score = isGoal ? 3 : isFirstMove ? 2 : rung === 7 ? 1 : 0;
      if (score > bestBindingScore && quest.passesMotionTest) {
        bestBindingScore = score;
        bestBindingIdx = out.length - 1;
      }
    }
  }

  if (bestBindingIdx >= 0) out[bestBindingIdx].isBinding = true;
  return out;
}
