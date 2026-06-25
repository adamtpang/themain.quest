export const BIRTH_DATE = "2002-07-31";
export const LIFE_EXPECTANCY_YEARS = 75;

export type LifeLeft = {
  daysLived: number;
  daysLeft: number;
  totalDays: number;
  percentElapsed: number; // 0..100
  yearsLeft: number;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Days are XP. This computes how much of the one game is spent vs left.
export function computeLifeLeft(now: Date = new Date()): LifeLeft {
  const birth = new Date(BIRTH_DATE + "T00:00:00");
  const death = new Date(birth);
  death.setFullYear(death.getFullYear() + LIFE_EXPECTANCY_YEARS);

  const totalDays = Math.max(1, Math.round((death.getTime() - birth.getTime()) / MS_PER_DAY));
  const daysLived = Math.max(0, Math.floor((now.getTime() - birth.getTime()) / MS_PER_DAY));
  const daysLeft = Math.max(0, Math.round((death.getTime() - now.getTime()) / MS_PER_DAY));
  const percentElapsed = Math.min(100, Math.max(0, (daysLived / totalDays) * 100));

  return {
    daysLived,
    daysLeft,
    totalDays,
    percentElapsed,
    yearsLeft: daysLeft / 365.25,
  };
}
