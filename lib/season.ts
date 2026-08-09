// Seasons: a bounded monthly window with its own win/loss record, FIFA/
// Overwatch/Hearthstone-style. Deliberately does NOT reset lifetime XP or the
// lifetime ladder record (lib/progress.ts, lib/ladder.ts) — this app's own
// stated philosophy is "lifetime XP that never resets," and wiping real
// progress every month would undo the thing that actually motivates, not
// recreate it. What a season borrows instead is the part of ranked seasons
// that IS purely additive: a fresh record every month, and a recap of the
// one that just ended, so the grind has real chapter breaks instead of being
// one undifferentiated climb.

export type Season = {
  number: number;
  startMonth: string; // "YYYY-MM"
  wins: number;
  losses: number;
};

export type SeasonState = {
  current: Season;
  history: Season[]; // archived, most recent last
};

function monthOf(dateStr: string): string {
  return dateStr.slice(0, 7);
}

export function freshSeasonState(today: string): SeasonState {
  return {
    current: { number: 1, startMonth: monthOf(today), wins: 0, losses: 0 },
    history: [],
  };
}

export function seasonRecord(s: Season): { wins: number; losses: number; total: number } {
  return { wins: s.wins, losses: s.losses, total: s.wins + s.losses };
}

// Judges a day into the current season. If the day belongs to a later month
// than the current season covers, the old season is archived first (its
// final record frozen) and a fresh one starts at that day's month — jumping
// straight there rather than backfilling any skipped months, same
// simplification the day-rollover itself already makes.
export function recordSeasonResult(
  state: SeasonState,
  dateBeingClosed: string,
  isWinning: boolean
): SeasonState {
  const dayMonth = monthOf(dateBeingClosed);
  let { current, history } = state;
  if (dayMonth !== current.startMonth) {
    history = [...history, current];
    current = { number: current.number + 1, startMonth: dayMonth, wins: 0, losses: 0 };
  }
  return {
    current: {
      ...current,
      wins: current.wins + (isWinning ? 1 : 0),
      losses: current.losses + (isWinning ? 0 : 1),
    },
    history,
  };
}

export function lastCompletedSeason(state: SeasonState): Season | null {
  return state.history.length ? state.history[state.history.length - 1] : null;
}
