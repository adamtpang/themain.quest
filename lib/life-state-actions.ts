import type { LifeQuest, LifeSharedState } from "@/lib/life-command-types";

export function cloneLifeSharedState(current: LifeSharedState): LifeSharedState {
  return {
    ...current,
    completedQuestIds: [...current.completedQuestIds],
    completedAtById: { ...current.completedAtById },
    completedXpById: { ...current.completedXpById },
    skippedQuestIds: [...(current.skippedQuestIds ?? [])],
    skipHistory: (current.skipHistory ?? []).map((event) => ({ ...event })),
    challengeHistory: (current.challengeHistory ?? []).map((event) => ({ ...event })),
    daily: { ...current.daily },
  };
}

export function resetSkippedQuests(current: LifeSharedState): LifeSharedState {
  const state = cloneLifeSharedState(current);
  state.skippedQuestIds = [];
  return state;
}

export function recordQuestSkip(
  current: LifeSharedState,
  quest: LifeQuest,
  reason: string,
  now = new Date(),
): LifeSharedState {
  const cleanedReason = reason.trim().slice(0, 500);
  if (!cleanedReason) throw new Error("Skip reason is required");

  const state = cloneLifeSharedState(current);
  state.skippedQuestIds = [...new Set([...(state.skippedQuestIds ?? []), quest.id])];
  state.skipHistory = [
    ...(state.skipHistory ?? []),
    {
      questId: quest.id,
      questTitle: quest.title,
      reason: cleanedReason,
      createdAt: now.toISOString(),
    },
  ].slice(-100);
  return state;
}

export function recordChallengeAdjustment(
  current: LifeSharedState,
  quest: LifeQuest,
  action: string,
  source: "built-in" | "ai",
  timeboxMinutes?: number,
  now = new Date(),
): LifeSharedState {
  const cleanedAction = action.trim().slice(0, 500);
  if (!cleanedAction) throw new Error("Adjusted action is required");

  const state = cloneLifeSharedState(current);
  state.challengeHistory = [
    ...(state.challengeHistory ?? []),
    {
      questId: quest.id,
      questTitle: quest.title,
      action: cleanedAction,
      source,
      timeboxMinutes,
      createdAt: now.toISOString(),
    },
  ].slice(-100);
  return state;
}

export function toggleQuestCompletion(
  current: LifeSharedState,
  quest: LifeQuest,
  completed?: boolean,
  options: { elapsedSeconds?: number; timeboxMinutes?: number; now?: Date } = {},
): LifeSharedState {
  const state = cloneLifeSharedState(current);
  const completedIds = new Set(state.completedQuestIds);
  const nextCompleted = completed ?? !completedIds.has(quest.id);

  if (nextCompleted) {
    completedIds.add(quest.id);
    state.completedAtById = state.completedAtById ?? {};
    state.completedXpById = state.completedXpById ?? {};
    state.completedAtById[quest.id] = (options.now ?? new Date()).toISOString();
    state.completedXpById[quest.id] = quest.xp;
    const latestAdjustment = [...(state.challengeHistory ?? [])]
      .reverse()
      .find((event) => event.questId === quest.id && !event.completed);
    if (latestAdjustment) {
      latestAdjustment.completed = true;
      latestAdjustment.elapsedSeconds = options.elapsedSeconds;
      latestAdjustment.timeboxMinutes = options.timeboxMinutes ?? latestAdjustment.timeboxMinutes;
    }
  } else {
    completedIds.delete(quest.id);
    delete state.completedAtById?.[quest.id];
    delete state.completedXpById?.[quest.id];
  }

  state.completedQuestIds = [...completedIds];
  return state;
}
