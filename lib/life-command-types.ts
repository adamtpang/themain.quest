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
  skipped: boolean;
};

export type LifeSkipEvent = {
  questId: string;
  questTitle: string;
  reason: string;
  createdAt: string;
};

export type LifeChallengeEvent = {
  questId: string;
  questTitle: string;
  action: string;
  source: "built-in" | "ai";
  timeboxMinutes?: number;
  elapsedSeconds?: number;
  completed?: boolean;
  createdAt: string;
};

export type FlowLearningProfile = {
  skipsRecorded: number;
  adjustmentsRecorded: number;
  recentSkipReasons: string[];
  note: string;
};

export type LifeCommandData = {
  generatedAt: string;
  source: "vault" | "neon" | "starter";
  statusMessage?: string;
  level: number;
  levelProgress: number;
  xp: number;
  xpToNext: number;
  todayScore: number;
  completedToday: number;
  quests: LifeQuest[];
  flowLearning: FlowLearningProfile;
};

export type LifeSharedState = {
  version: 1;
  revision?: number;
  completedQuestIds: string[];
  completedAtById?: Record<string, string>;
  completedXpById?: Record<string, number>;
  skippedQuestIds?: string[];
  skipHistory?: LifeSkipEvent[];
  challengeHistory?: LifeChallengeEvent[];
  daily: Record<string, { score: number; xp: number; quests: number }>;
  snapshot?: LifeCommandData;
};
