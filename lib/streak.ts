// The win streak: consecutive days Adam struck the boss (closed the income move).
// Hearthstone's star bonus, the chain you do not break. Positive, never nags.

export type Streak = { current: number; best: number; lastWinDate: string };

export function freshStreak(): Streak {
  return { current: 0, best: 0, lastWinDate: "" };
}

// Record today's win. Extends the chain if yesterday was a win, else starts fresh.
export function recordWin(s: Streak, today: string, yesterday: string): Streak {
  if (s.lastWinDate === today) return s; // already counted today
  const current = s.lastWinDate === yesterday ? s.current + 1 : 1;
  return { current, best: Math.max(s.best, current), lastWinDate: today };
}

// The chain breaks only when a full day was missed (last win is older than yesterday).
export function refreshStreak(s: Streak, today: string, yesterday: string): Streak {
  if (s.current > 0 && s.lastWinDate !== today && s.lastWinDate !== yesterday) {
    return { ...s, current: 0 };
  }
  return s;
}
