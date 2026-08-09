// Party synergy: a quest done WITH a real person earns bonus XP, Overwatch-
// style team comp beating solo play. Targets the gap Bartle's framework
// flagged earlier this session — this whole system is Achiever-coded and
// would otherwise starve the Socializer need — and the same gap
// life-plan-2026.md's own Bezos-regret pass named directly: time with people
// that cannot be earned back. Connection becomes mechanically rewarded, not
// just morally correct.

export const SYNERGY_BONUS_RATE = 0.25; // +25% XP on a quest tagged with a real person

export function synergyBonus(baseXp: number): number {
  return Math.round(baseXp * SYNERGY_BONUS_RATE);
}
