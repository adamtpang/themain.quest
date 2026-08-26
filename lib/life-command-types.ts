export type LifeQuest = {
  id: string;
  title: string;
  tier: number;
  category: "Stability" | "Body" | "Money" | "Love" | "Create" | "General";
  emoji: string;
  steps: string[];
  doneWhen: string;
  route: string | null;
  xp: number;
  inactionCost: number;
  completed: boolean;
};

export type TrendPoint = {
  date: string;
  label: string;
  score: number;
  xp: number;
  quests: number;
};

export type LifeHorizon = {
  label: string;
  detail: string;
  progress: number;
  focus: string;
};

export type PillarSignal = {
  name: LifeQuest["category"];
  open: number;
  completed: number;
  score: number;
};

export type LifeCommandData = {
  generatedAt: string;
  source: "vault" | "neon" | "starter";
  northStar: string;
  level: number;
  levelProgress: number;
  xp: number;
  xpToNext: number;
  todayScore: number;
  completedToday: number;
  laterCount: number;
  life: {
    daysLeft: number;
    percentElapsed: number;
    yearsLeft: number;
  };
  quests: LifeQuest[];
  horizons: LifeHorizon[];
  pillars: PillarSignal[];
  trend: TrendPoint[];
};

export type LifeSharedState = {
  version: 1;
  completedQuestIds: string[];
  completedAtById?: Record<string, string>;
  completedXpById?: Record<string, number>;
  daily: Record<string, { score: number; xp: number; quests: number }>;
  snapshot?: LifeCommandData;
};
