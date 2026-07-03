"use client";

import { useEffect, useRef, useState } from "react";
import { Quest } from "@/lib/types";
import {
  bossRemaining,
  crystalsLeft,
  FlowRating,
  FOCUS_MINUTES,
  matchPhase,
  MatchState,
  SHIP_XP,
} from "@/lib/match";
import { SCHOOL_META, SCHOOL_OF } from "@/lib/schools";
import { sfxPlay, sfxAttack, sfxKill, sfxToggleMute, sfxIsMuted } from "@/lib/sfx";

let floatId = 0;

function clock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const COACH: Record<FlowRating, string> = {
  easy: "too easy last turn. raise the stakes, bigger kill.",
  edge: "you were on the edge last turn. same size, that is flow.",
  hard: "last turn ran hot. cut this goal in half.",
};

export function TheBoard({
  boss,
  recommended,
  hand,
  match,
  lethal,
  onCrown,
  onCloseQuest,
  onStartFocus,
  onGiveUpFocus,
  onResolve,
  onSkipBreak,
  onClose,
}: {
  boss: Quest | null;
  recommended: Quest | null;
  hand: Quest[];
  match: MatchState;
  lethal: boolean;
  onCrown: (id: string) => void;
  onCloseQuest: (id: string) => void;
  onStartFocus: (goal: string) => void;
  onGiveUpFocus: () => void;
  onResolve: (shipped: boolean, rating: FlowRating) => void;
  onSkipBreak: () => void;
  onClose: () => void;
}) {
  const [floaters, setFloaters] = useState<{ id: number; text: string; gold?: boolean }[]>([]);
  const [shake, setShake] = useState(0);
  const [now, setNow] = useState(0);
  const [victory, setVictory] = useState(false);
  const [stinger, setStinger] = useState(false);
  const [mutedUi, setMutedUi] = useState(false);
  const [goalDraft, setGoalDraft] = useState("");
  const [died, setDied] = useState<boolean | null>(null);
  const prevDone = useRef(match.bossHpDone);
  const prevRemaining = useRef(bossRemaining(match));

  useEffect(() => {
    setNow(Date.now());
    if (!match.focusEndsAt && !match.breakEndsAt) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [match.focusEndsAt, match.breakEndsAt]);

  // Each new turn, the win condition drafts from the boss. Edit it, then attack.
  useEffect(() => {
    setGoalDraft(boss ? boss.title : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boss?.id, match.spent]);

  // The boss died: ring the bell. The boss dropped to exactly 1 HP with mana
  // left: flash the lethal stinger, the favorite moment. Both require a live
  // boss (a migrated dead save must not ring phantom bells), and any other
  // dep change dismisses the overlays instead of freezing them, since the
  // cleanup cancels the pending hide timer.
  useEffect(() => {
    const rem = bossRemaining(match);
    const killed =
      !!boss &&
      match.bossHpMax > 0 &&
      match.bossHpDone >= match.bossHpMax &&
      prevDone.current < match.bossHpMax;
    const lethalNext = !!boss && rem === 1 && prevRemaining.current > 1 && crystalsLeft(match) > 0;
    prevDone.current = match.bossHpDone;
    prevRemaining.current = rem;
    if (killed) {
      sfxKill();
      setVictory(true);
      const t = setTimeout(() => setVictory(false), 2000);
      return () => clearTimeout(t);
    }
    if (lethalNext) {
      setStinger(true);
      const t = setTimeout(() => setStinger(false), 1600);
      return () => clearTimeout(t);
    }
    setVictory(false);
    setStinger(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.bossHpDone, match.bossHpMax, match.spent, match.crystals]);

  function addFloater(text: string, gold = false) {
    const id = ++floatId;
    setFloaters((f) => [...f, { id, text, gold }]);
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 900);
  }

  function play(q: Quest) {
    sfxPlay();
    addFloater(q.xpAwarded ? "closed" : "+25");
    onCloseQuest(q.id);
  }

  function attack() {
    if (!goalDraft.trim()) return;
    sfxAttack();
    onStartFocus(goalDraft);
  }

  // The check-in: damage lands on this tap, not silently at timer zero.
  function tapRating(rating: FlowRating) {
    if (died === null) return;
    const onBoss = match.focusQuestId != null && match.focusQuestId === match.bossId;
    sfxAttack();
    setShake((s) => s + 1);
    if (onBoss) addFloater("-1 hp");
    if (died) addFloater(`+${SHIP_XP} shipped`, true);
    onResolve(died, rating);
    setDied(null);
  }

  const left = crystalsLeft(match);
  const remaining = bossRemaining(match);
  const nowSafe = now > 0 ? now : Date.now(); // never a garbage first-frame clock
  const phase = matchPhase(match, !!boss, nowSafe);
  const focusMs = match.focusEndsAt ? match.focusEndsAt - nowSafe : 0;
  const breakMs = match.breakEndsAt ? match.breakEndsAt - nowSafe : 0;
  const handOpen = phase === "no_boss" || phase === "break" || phase === "out_of_mana";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/95">
      {victory && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-ink/70">
          <span className="cardplay text-6xl">💥</span>
          <span className="hitshake font-pixel text-xl uppercase text-gold">boss down</span>
          <span className="font-pixel text-[9px] uppercase text-health">+100 xp · streak +1</span>
        </div>
      )}
      {stinger && !victory && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-ink/70">
          <span className="hitshake text-6xl">⚡</span>
          <span className="animate-flash font-pixel text-lg uppercase text-life">lethal next turn</span>
        </div>
      )}

      <div className="flex items-center justify-between border-b-4 border-ink bg-visa px-3 py-2">
        <span className="font-pixel text-[10px] uppercase text-paper">⚔ the match</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMutedUi(sfxToggleMute())}
            className="font-pixel text-[10px] text-paper/80 hover:text-paper"
            aria-label="toggle sound"
          >
            {mutedUi || sfxIsMuted() ? "🔇" : "🔊"}
          </button>
          <button onClick={onClose} className="font-pixel text-[10px] text-paper/80 hover:text-paper">
            x
          </button>
        </div>
      </div>

      {/* mana + turn + lethal */}
      <div className="flex items-center gap-1.5 px-3 py-2">
        <span className="font-pixel text-[7px] uppercase text-paper/70">mana</span>
        <div className="flex flex-wrap gap-0.5">
          {Array.from({ length: match.crystals }).map((_, i) => (
            <span
              key={i}
              className={`h-3 w-3 rotate-45 border-2 border-paper/60 ${i < left ? "bg-visa" : "bg-transparent"}`}
            />
          ))}
        </div>
        <span className="ml-2 font-pixel text-[7px] uppercase text-paper/50">
          turn {Math.min(match.spent + 1, match.crystals)}/{match.crystals}
        </span>
        {lethal && (
          <span className="ml-auto tag animate-glow bg-life px-1.5 py-px font-pixel text-[8px] uppercase text-paper">
            ⚡ lethal
          </span>
        )}
      </div>

      {/* the field: auto margins center short content but keep tall content scrollable */}
      <div className="relative flex flex-1 overflow-y-auto px-4 py-3">
        {/* floating damage numbers */}
        <div className="pointer-events-none absolute inset-x-0 top-1/4 z-10 flex justify-center">
          {floaters.map((f) => (
            <span
              key={f.id}
              className={`floatup absolute font-pixel text-lg ${f.gold ? "text-gold" : "text-health"}`}
            >
              {f.text}
            </span>
          ))}
        </div>

        <div className="m-auto flex w-full flex-col items-center gap-3">
        {phase === "no_boss" && (
          <>
            {recommended ? (
              <>
                <span className="font-pixel text-[7px] uppercase text-paper/50">the deck suggests</span>
                <div className="panel w-full max-w-xs animate-glow bg-gold p-4 text-center">
                  <p className="text-lg leading-tight text-ink">{recommended.title}</p>
                </div>
                <button
                  onClick={() => onCrown(recommended.id)}
                  className="btn w-full max-w-xs bg-gold py-3 font-pixel text-[11px] uppercase text-ink"
                >
                  👑 crown the boss
                </button>
              </>
            ) : (
              <p className="max-w-xs text-center text-base text-paper/70">
                The field is empty. Head to camp (x, top right) and load your outbox to draw a boss.
              </p>
            )}
          </>
        )}

        {(phase === "ready" || phase === "focus" || phase === "resolve" || phase === "break" || phase === "out_of_mana") &&
          boss && (
            <>
              <span className="font-pixel text-[7px] uppercase text-paper/50">the boss</span>
              <div
                key={shake}
                className={`panel w-full max-w-xs bg-gold p-4 text-center ${shake > 0 ? "hitshake" : ""}`}
              >
                <p className="mb-3 text-lg leading-tight text-ink">{boss.title}</p>
                <div className="flex justify-center gap-1">
                  {Array.from({ length: match.bossHpMax }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-5 w-6 border-2 border-ink ${i < remaining ? "bg-life" : "bg-paper2"}`}
                    />
                  ))}
                </div>
                <p className="mt-2 font-pixel text-[7px] uppercase text-ink/60">
                  {remaining} hp · {match.bossHpDone}/{match.bossHpMax} struck
                </p>
              </div>
            </>
          )}

        {phase === "ready" && boss && (
          <div className="w-full max-w-xs">
            {match.lastRating && (
              <p className="mb-1 text-center text-sm text-sky">{COACH[match.lastRating]}</p>
            )}
            <label className="font-pixel text-[7px] uppercase text-paper/60">
              what dies this turn?
            </label>
            <input
              value={goalDraft}
              onChange={(e) => setGoalDraft(e.target.value)}
              placeholder="name the kill, then attack"
              className="inset mt-1 w-full bg-paper px-2 py-2 text-base text-ink placeholder:text-ink/40 focus:outline-none"
            />
            <button
              onClick={attack}
              disabled={!goalDraft.trim()}
              className="btn mt-2 w-full bg-life py-3 font-pixel text-[11px] uppercase text-paper disabled:opacity-40"
            >
              ⚔ attack · {FOCUS_MINUTES} min turn
            </button>
          </div>
        )}

        {phase === "focus" && (
          <div className="w-full max-w-xs text-center">
            <p className="font-pixel text-[7px] uppercase text-paper/50">killing</p>
            <p className="mb-2 mt-1 text-xl leading-tight text-paper">{match.focusGoal}</p>
            <div className="bar h-7 w-full overflow-hidden">
              <div
                className="flex h-full items-center justify-center bg-health font-pixel text-[11px] text-ink"
                style={{ width: `${Math.min(100, Math.max(8, (focusMs / (FOCUS_MINUTES * 60000)) * 100))}%` }}
              >
                {clock(focusMs)}
              </div>
            </div>
            <button
              onClick={onGiveUpFocus}
              className="mt-2 w-full font-pixel text-[7px] uppercase text-paper/50 hover:text-life"
            >
              give up the turn (burns the crystal)
            </button>
          </div>
        )}

        {phase === "resolve" && (
          <div className="panel w-full max-w-xs bg-paper p-3">
            <p className="font-pixel text-[7px] uppercase text-ink/50">the turn ended. check in.</p>
            <p className="mb-2 mt-1 text-base leading-tight text-ink">{match.focusGoal}</p>
            <p className="font-pixel text-[8px] uppercase text-ink">did it die?</p>
            <div className="mt-1 flex gap-2">
              <button
                onClick={() => setDied(true)}
                className={`btn flex-1 py-2 font-pixel text-[9px] uppercase text-ink ${died === true ? "bg-health" : "bg-paper2"}`}
              >
                ☠ dead
              </button>
              <button
                onClick={() => setDied(false)}
                className={`btn flex-1 py-2 font-pixel text-[9px] uppercase text-ink ${died === false ? "bg-bubblegum" : "bg-paper2"}`}
              >
                🏃 escaped
              </button>
            </div>
            <p className={`mt-3 font-pixel text-[8px] uppercase ${died === null ? "text-ink/30" : "text-ink"}`}>
              how did it feel?
            </p>
            <div className="mt-1 flex gap-2">
              {(["easy", "edge", "hard"] as FlowRating[]).map((r) => (
                <button
                  key={r}
                  onClick={() => tapRating(r)}
                  disabled={died === null}
                  className="btn flex-1 bg-sky py-2 font-pixel text-[8px] uppercase text-ink disabled:opacity-30"
                >
                  {r === "easy" ? "too easy" : r === "edge" ? "on the edge" : "too hard"}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "break" && (
          <div className="w-full max-w-xs text-center">
            <p className="font-pixel text-[8px] uppercase text-sky">opponent&apos;s turn</p>
            <p className="mt-1 text-base text-paper/80">stand up. water. eyes off screen.</p>
            <div className="bar mt-2 h-7 w-full overflow-hidden">
              <div
                className="flex h-full items-center justify-center bg-sky font-pixel text-[11px] text-ink"
                style={{ width: `${Math.min(100, Math.max(8, (breakMs / (5 * 60000)) * 100))}%` }}
              >
                {clock(breakMs)}
              </div>
            </div>
            <p className="mt-2 font-pixel text-[7px] uppercase text-paper/50">
              damage dealt {match.bossHpDone}/{match.bossHpMax}
            </p>
            <button
              onClick={onSkipBreak}
              className="mt-1 w-full font-pixel text-[7px] uppercase text-paper/50 hover:text-paper"
            >
              skip the break
            </button>
          </div>
        )}

        {phase === "out_of_mana" && (
          <p className="max-w-xs text-center text-base text-paper/70">
            0 mana. match over. you dealt {match.bossHpDone}/{match.bossHpMax}. rematch at dawn.
          </p>
        )}
        </div>
      </div>

      {/* your hand: side plays live in the breaks, not mid-turn */}
      {handOpen && (
        <div className="border-t-4 border-ink p-3">
          <p className="mb-2 font-pixel text-[7px] uppercase text-paper/60">your hand · tap to play</p>
          {hand.length === 0 ? (
            <p className="text-base text-paper/50">Empty hand. Load your outbox to draw cards.</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {hand.map((q) => (
                <button
                  key={q.id}
                  onClick={() => play(q)}
                  className="btn w-28 flex-none cardplay bg-paper p-2 text-left"
                >
                  <span className="text-2xl">{SCHOOL_META[SCHOOL_OF[q.priority]].emoji}</span>
                  <span className="mt-1 line-clamp-3 block text-sm leading-tight text-ink">{q.title}</span>
                  <span className="mt-1 block font-pixel text-[6px] uppercase text-ink/50">+25 · tap</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
