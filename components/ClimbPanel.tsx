"use client";

import { useEffect, useRef, useState } from "react";
import { LadderRecord, winRate } from "@/lib/ladder";
import { lastCompletedSeason, seasonRecord, SeasonState } from "@/lib/season";
import {
  levelInfo,
  levelInfoByPillar,
  overallLevelFromPillars,
  PillarProgress,
  RANKS,
  rankForLevel,
  weakestPillar,
} from "@/lib/progress";
import { PILLAR_BG, PILLAR_ORDER, PILLAR_TEXT } from "@/lib/types";

export function ClimbPanel({
  pillars,
  ready,
  streak = 0,
  bestStreak = 0,
  ladder,
  season,
}: {
  pillars: PillarProgress;
  ready: boolean;
  streak?: number;
  bestStreak?: number;
  ladder?: LadderRecord;
  season?: SeasonState;
}) {
  // Overall level is the LOWEST of the three pillars, not the sum or average
  // (LIFE_GAME.md, decided 2026-08-07) — so the main bar shows progress on
  // whichever pillar is currently gating you, not a flattened number.
  const overallLvl = overallLevelFromPillars(pillars);
  const weak = weakestPillar(pillars);
  const info = levelInfo(pillars[weak]);
  const perPillar = levelInfoByPillar(pillars);
  const totalXp = pillars.Health + pillars.Wealth + pillars.Wisdom;
  const { current, next, levelsToNext } = rankForLevel(overallLvl);

  // Juice: flash +XP on a real close, and a banner on rank up.
  const prevXp = useRef<number | null>(null);
  const prevRank = useRef<string | null>(null);
  const [gain, setGain] = useState(0);
  const [rankUp, setRankUp] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (prevXp.current === null) {
      prevXp.current = totalXp;
      prevRank.current = current.name;
      return;
    }
    const delta = totalXp - prevXp.current;
    prevXp.current = totalXp;
    if (delta > 0) {
      setGain(delta);
      const t = setTimeout(() => setGain(0), 1600);
      if (prevRank.current && prevRank.current !== current.name) {
        setRankUp(current.name);
        const r = setTimeout(() => setRankUp(null), 2800);
        prevRank.current = current.name;
        return () => {
          clearTimeout(t);
          clearTimeout(r);
        };
      }
      prevRank.current = current.name;
      return () => clearTimeout(t);
    }
  }, [totalXp, ready, current.name]);

  // A season just rolled over the instant history gains an entry. Show that
  // just-archived season's final record once, the way Overwatch recaps the
  // season you just left before dropping you into the new one's placements.
  const prevSeasonCount = useRef<number | null>(null);
  const [recap, setRecap] = useState<ReturnType<typeof seasonRecord> | null>(null);
  const justEnded = season ? lastCompletedSeason(season) : null;

  useEffect(() => {
    if (!ready || !season) return;
    const count = season.history.length;
    if (prevSeasonCount.current === null) {
      prevSeasonCount.current = count;
      return;
    }
    if (count > prevSeasonCount.current && justEnded) {
      prevSeasonCount.current = count;
      setRecap(seasonRecord(justEnded));
      const t = setTimeout(() => setRecap(null), 4000);
      return () => clearTimeout(t);
    }
    prevSeasonCount.current = count;
  }, [ready, season, justEnded]);

  return (
    <section className="mx-auto max-w-md px-3 pt-3">
      <div className="panel relative overflow-hidden bg-paper p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-pixel text-[8px] uppercase text-ink">
            🏆 the climb{season ? ` · season ${season.current.number}` : ""}
          </span>
          {streak > 0 ? (
            <span className="tag bg-taxes px-1.5 py-px font-pixel text-[7px] uppercase leading-none text-ink">
              🔥 {streak} day{streak === 1 ? "" : "s"}
              {bestStreak > streak ? ` · best ${bestStreak}` : ""}
            </span>
          ) : (
            <span className="font-pixel text-[6px] uppercase text-ink/50">strike the boss to start a streak</span>
          )}
        </div>

        {/* the ladder record: a real match history, not just a number that only
            ever climbs — a day can genuinely be a loss, same as Hearthstone/OW */}
        {ladder && (ladder.wins > 0 || ladder.losses > 0) && (
          <div className="mb-2 flex items-center justify-between">
            <span className="font-pixel text-[7px] uppercase text-ink/60">record</span>
            <span className="font-pixel text-[8px] text-ink">
              <span className="text-health">{ladder.wins}W</span>
              {" - "}
              <span className="text-life">{ladder.losses}L</span>
              <span className="ml-1 text-ink/50">({winRate(ladder)}%)</span>
            </span>
          </div>
        )}

        {/* this season only — resets each calendar month, lifetime record above
            never does. Chapter breaks, not a wipe: nothing here is destroyed. */}
        {season && (season.current.wins > 0 || season.current.losses > 0) && (
          <div className="mb-2 flex items-center justify-between">
            <span className="font-pixel text-[7px] uppercase text-ink/60">this season</span>
            <span className="font-pixel text-[8px] text-ink">
              <span className="text-health">{season.current.wins}W</span>
              {" - "}
              <span className="text-life">{season.current.losses}L</span>
              {justEnded && (
                <span className="ml-1 text-ink/50">
                  (last: {justEnded.wins}W-{justEnded.losses}L)
                </span>
              )}
            </span>
          </div>
        )}

        <div className="flex items-end justify-between">
          <div>
            <span key={current.name} className="animate-pop block font-pixel text-base text-gold drop-shadow-[2px_2px_0_#07150a]">
              {current.name}
            </span>
            <span className="text-sm text-ink/70">rank</span>
          </div>
          <div className="text-right">
            <span key={overallLvl} className="animate-pop block font-pixel text-base text-ink">
              lvl {overallLvl}
            </span>
            <span className="text-sm text-ink/70">{totalXp.toLocaleString()} xp</span>
          </div>
        </div>

        {/* the gate: this bar is always the WEAKEST pillar, not a flattened average */}
        <div className="bar mt-2 h-3 w-full overflow-hidden">
          <div
            className={`h-full ${PILLAR_BG[weak]} transition-[width] duration-500`}
            style={{ width: `${info.pct}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm text-ink/60">
            {info.intoLevel} / {info.neededForNext} to lvl {info.level + 1} ({weak}, your gate)
          </span>
          {gain > 0 && (
            <span className="animate-flash font-pixel text-[9px] text-health">+{gain} xp</span>
          )}
        </div>

        {/* the three tracks, so a big Wealth week can't hide a starved pillar */}
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {PILLAR_ORDER.map((p) => (
            <div
              key={p}
              className={`rounded border px-1.5 py-1 ${
                p === weak ? "border-ink" : "border-ink/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-pixel text-[6px] uppercase ${PILLAR_TEXT[p]}`}>{p}</span>
                <span className="font-pixel text-[7px] text-ink">{perPillar[p].level}</span>
              </div>
              <div className="bar mt-1 h-1.5 w-full overflow-hidden">
                <div
                  className={`h-full ${PILLAR_BG[p]} transition-[width] duration-500`}
                  style={{ width: `${perPillar[p].pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* the ladder to Elon */}
        <div className="mt-3 flex flex-wrap items-center gap-1">
          {RANKS.map((r) => {
            const reached = info.level >= r.minLevel;
            const isCurrent = r.name === current.name;
            const isChampion = r.name === "CHAMPION";
            return (
              <span
                key={r.name}
                className={`tag px-1.5 py-px text-[9px] uppercase leading-none ${
                  isCurrent
                    ? "bg-gold text-ink"
                    : reached
                    ? "bg-health/40 text-ink"
                    : "bg-paper2 text-ink/50"
                }`}
              >
                {isChampion ? "👑 elon" : r.name}
              </span>
            );
          })}
        </div>
        <p className="mt-2 text-sm leading-snug text-ink/70">
          {next
            ? `${levelsToNext} ${levelsToNext === 1 ? "level" : "levels"} to ${
                next.name === "CHAMPION" ? "dethrone Elon" : next.name
              }. Real closes only, motion earns nothing.`
            : "You dethroned Elon. You are the champion. Keep closing."}
        </p>

        {rankUp && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/85">
            <span className="animate-pop text-center font-pixel text-sm uppercase text-gold">
              rank up
              <br />
              {rankUp === "CHAMPION" ? "👑 you beat elon" : rankUp}
            </span>
          </div>
        )}

        {recap && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/85">
            <span className="animate-pop text-center font-pixel text-sm uppercase text-gold">
              season over
              <br />
              <span className="text-health">{recap.wins}W</span>
              {" - "}
              <span className="text-life">{recap.losses}L</span>
              <br />
              <span className="text-[8px] normal-case text-paper/70">new season starting now</span>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
