import { makeId } from "./parse";
import { Pillar } from "./types";

export type Problem = {
  id: string;
  title: string;
  importance: number; // 1..5
  urgency: number; // 1..5
  why: string; // why this is happening / what it really is
  beaten: boolean;
  pillar?: Pillar; // which XP track this problem is really about, if any
};

// Whichever pillar is the stated speedrun focus right now (visakanv's
// "consider the speedrunners" framing: clear the actual bottleneck, don't
// split attention across stats that are already fine). Health and Wisdom
// are considered handled as of 2026-08-09 — Wealth is the gate. Flip this
// by hand when the real-world focus shifts; it is a stated priority, not
// something derivable from in-app XP (which starts every pillar at 0).
export const FOCUS_PILLAR: Pillar = "Wealth";
export const FOCUS_BONUS = 3; // added to score so focus-pillar problems float above same-tier rivals

// Priority score: importance carries more weight, urgency breaks ties / surfaces fires.
export function problemScore(p: Problem): number {
  return p.importance * 2 + p.urgency + (p.pillar === FOCUS_PILLAR ? FOCUS_BONUS : 0);
}

export function sortProblems(problems: Problem[]): Problem[] {
  return [...problems].sort((a, b) => {
    if (a.beaten !== b.beaten) return a.beaten ? 1 : -1;
    return problemScore(b) - problemScore(a);
  });
}

// Seeded from Adam's life lanes. Every field is editable; Finn can rewrite the "why".
export function defaultProblems(): Problem[] {
  return [
    {
      id: makeId(),
      title: "No reliable new income source",
      importance: 5,
      urgency: 5,
      why: "Cash runway is the whole game right now. Without a teed-up income source, every other quest is decoration. The root cause is substituting motion (tools, systems) for the hard close.",
      beaten: false,
      pillar: "Wealth",
    },
    {
      id: makeId(),
      title: "Visa / immigration paperwork open",
      importance: 5,
      urgency: 4,
      why: "An unresolved visa is a hard deadline with legal teeth. It blocks location freedom and compounds if ignored. Mostly a few decisive document sends, not a research project.",
      beaten: false,
    },
    {
      id: makeId(),
      title: "Motion masquerading as progress",
      importance: 4,
      urgency: 3,
      why: "The documented failure mode: renaming things, buying domains, building dashboards instead of closing income, shipping, and sending the hard message. Feels productive, moves nothing in the world.",
      beaten: false,
    },
  ];
}
