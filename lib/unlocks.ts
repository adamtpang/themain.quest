// Real unlocks per pillar level, Wizard101-style: hit the level, get the
// thing, not just a bigger number. Two kinds, and both are shown honestly as
// what they are:
//
// - `mechanical: true`  — this repo actually enforces it (checked against
//   code you can read, same discipline as repo-protocol's own verifier: a
//   claim that isn't backed by a real path is worse than no claim).
// - `mechanical: false` — a self-granted real-world permission. The app
//   cannot enforce "approve the bigger spend," only track whether you've
//   earned the right to stop re-litigating it. Faking a code gate on a
//   real-world action would be theater, so this is labeled plainly instead.

import { Pillar } from "./types";

export type Unlock = {
  pillar: Pillar;
  level: number;
  title: string;
  description: string;
  mechanical: boolean;
};

export const UNLOCKS: Unlock[] = [
  {
    pillar: "Health",
    level: 2,
    title: "One more turn a day",
    description: "+1 crystal/day in The Match — built enough real stamina to carry one more focused pomodoro.",
    mechanical: true,
  },
  {
    pillar: "Health",
    level: 4,
    title: "A full extra pomodoro",
    description: "+1 crystal/day again (2 total over baseline) — your body can carry a genuinely full day now.",
    mechanical: true,
  },
  {
    pillar: "Wealth",
    level: 2,
    title: "Approve the bigger spend",
    description: "Permission to greenlight a real discretionary purchase without re-litigating it every time.",
    mechanical: false,
  },
  {
    pillar: "Wealth",
    level: 4,
    title: "A real second bet",
    description: "Permission to run two income experiments in parallel instead of forcing strict single-threading.",
    mechanical: false,
  },
  {
    pillar: "Wisdom",
    level: 2,
    title: "A new artifact format",
    description: "Permission to post a new format on pangaea.blog beyond the current songs/essays rotation.",
    mechanical: false,
  },
  {
    pillar: "Wisdom",
    level: 4,
    title: "Teach it",
    description: "Permission to run a real session teaching someone else what you've actually learned.",
    mechanical: false,
  },
];

export type UnlockStatus = Unlock & { earned: boolean };

export function unlocksWithStatus(levelFor: (p: Pillar) => number): UnlockStatus[] {
  return UNLOCKS.map((u) => ({ ...u, earned: levelFor(u.pillar) >= u.level }));
}

// The one real code-enforced effect: extra Match crystals per day, earned
// from Health level alone. Counts only `mechanical: true` Health unlocks
// already reached, so this function and the table above can never disagree.
export function bonusCrystals(healthLevel: number): number {
  return UNLOCKS.filter((u) => u.pillar === "Health" && u.mechanical && healthLevel >= u.level).length;
}
