import { Priority, Quest } from "./types";

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
// These leave nothing in the world, so they fail the Motion Test.
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

// Ordered most-specific first so "pay taxes" lands on Taxes, not Leverage.
const PRIORITY_PATTERNS: Array<{ p: Priority; re: RegExp }> = [
  { p: "Taxes", re: /\b(tax|taxes|irs|lhdn|accountant|filing|deduction|w-?9|1099)\b/i },
  { p: "Visa", re: /\b(visa|mdec|sdec|otavio|immigration|permit|passport|embassy|residen)/i },
  { p: "Health", re: /\b(gym|run|running|lift|workout|exercise|train|training|swim|hike|walk|sleep|body|health|stretch|sauna|cardio)\b/i },
  { p: "Life", re: /\b(call|text|message|reply|love|maanasa|mom|dad|mum|family|friend|dinner|date|visit|hug|connect|partner|girlfriend|wife|sister|brother)\b/i },
  { p: "Leverage", re: /\b(income|pay|paid|invoice|cash|close|deal|client|revenue|contract|proposal|charge|stripe|salary|raise|negotiat|pitch|earn|sell\s+to)\b/i },
  { p: "Marketplace", re: /\b(marketplace|listing|list|launch|product|ship|sale|sales|store|onboard|customer|user|signup|sign-?up|waitlist|landing)\b/i },
  { p: "Loops", re: /\b(tool|system|meta|dashboard|rename|domain|vault|refactor|setup|automation)\b/i },
];

export function detectMotion(text: string): boolean {
  return MOTION_PATTERNS.some((re) => re.test(text));
}

export function suggestPriority(text: string, isMotion: boolean): Priority {
  if (isMotion) return "Loops"; // motion is meta-work; it sorts dead last
  for (const { p, re } of PRIORITY_PATTERNS) {
    if (re.test(text)) return p;
  }
  // Unmatched real action defaults to the income lane; one tap to re-tag.
  return "Leverage";
}

// Strips list markers, checkboxes, and bracket tags like [im5 ef2].
export function cleanTitle(raw: string): string {
  let t = raw.trim();
  t = t.replace(/^[-*+]\s+/, "");
  t = t.replace(/^\d+[.)]\s+/, "");
  t = t.replace(/^\[[ xX]\]\s*/, ""); // markdown checkbox
  t = t.replace(/\[[^\]]*\]/g, ""); // [im5 ef2] style tags
  t = t.replace(/\s{2,}/g, " ");
  return t.trim();
}

export function parseOutbox(raw: string): Quest[] {
  const lines = raw.split(/\r?\n/);
  const out: Quest[] = [];
  const now = new Date().toISOString();

  for (const line of lines) {
    const title = cleanTitle(line);
    if (!title) continue;
    const isMotion = detectMotion(line);
    out.push({
      id: makeId(),
      title,
      priority: suggestPriority(line, isMotion),
      passesMotionTest: !isMotion,
      done: false,
      isBinding: false,
      createdAt: now,
    });
  }

  return out;
}
