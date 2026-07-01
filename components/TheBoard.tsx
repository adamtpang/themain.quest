"use client";

import { useEffect, useRef, useState } from "react";
import { Quest } from "@/lib/types";
import { FOCUS_MINUTES, MatchState } from "@/lib/match";
import { SCHOOL_META, SCHOOL_OF } from "@/lib/schools";
import { sfxPlay, sfxAttack, sfxKill, sfxToggleMute, sfxIsMuted } from "@/lib/sfx";

let floatId = 0;

function clock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function TheBoard({
  boss,
  hand,
  match,
  lethal,
  onCloseQuest,
  onStartFocus,
  onGiveUpFocus,
  onClose,
}: {
  boss: Quest | null;
  hand: Quest[];
  match: MatchState;
  lethal: boolean;
  onCloseQuest: (id: string) => void;
  onStartFocus: () => void;
  onGiveUpFocus: () => void;
  onClose: () => void;
}) {
  const [floaters, setFloaters] = useState<{ id: number; text: string }[]>([]);
  const [shake, setShake] = useState(0);
  const [now, setNow] = useState(0);
  const [victory, setVictory] = useState(false);
  const [mutedUi, setMutedUi] = useState(false);
  const prevDone = useRef(match.bossHpDone);

  useEffect(() => {
    setNow(Date.now());
    if (!match.focusEndsAt) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [match.focusEndsAt]);

  // The boss just died: HP crossed to full-struck. Ring the victory bell.
  useEffect(() => {
    const killed =
      match.bossHpMax > 0 &&
      match.bossHpDone >= match.bossHpMax &&
      prevDone.current < match.bossHpMax;
    prevDone.current = match.bossHpDone;
    if (killed) {
      sfxKill();
      setVictory(true);
      const t = setTimeout(() => setVictory(false), 2000);
      return () => clearTimeout(t);
    }
  }, [match.bossHpDone, match.bossHpMax]);

  function hit(text: string) {
    const id = ++floatId;
    setFloaters((f) => [...f, { id, text }]);
    setShake((s) => s + 1);
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 900);
  }

  function play(q: Quest) {
    sfxPlay();
    hit(`+${q.isBinding ? 100 : 25}`);
    onCloseQuest(q.id);
  }

  function attack() {
    sfxAttack();
    onStartFocus();
  }

  const crystalsLeft = Math.max(0, match.crystals - match.spent);
  const bossRemaining = Math.max(0, match.bossHpMax - match.bossHpDone);
  const focusing = !!match.focusEndsAt;
  const remMs = match.focusEndsAt ? match.focusEndsAt - now : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/95">
      {victory && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-ink/70">
          <span className="cardplay text-6xl">💥</span>
          <span className="hitshake font-pixel text-xl uppercase text-gold">boss down</span>
          <span className="font-pixel text-[9px] uppercase text-health">+100 xp · streak +1</span>
        </div>
      )}
      <div className="flex items-center justify-between border-b-4 border-ink bg-visa px-3 py-2">
        <span className="font-pixel text-[10px] uppercase text-paper">⚔ the board</span>
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

      {/* mana + lethal */}
      <div className="flex items-center gap-1.5 px-3 py-2">
        <span className="font-pixel text-[7px] uppercase text-paper/70">mana</span>
        <div className="flex flex-wrap gap-0.5">
          {Array.from({ length: match.crystals }).map((_, i) => (
            <span
              key={i}
              className={`h-3 w-3 rotate-45 border-2 border-paper/60 ${i < crystalsLeft ? "bg-visa" : "bg-transparent"}`}
            />
          ))}
        </div>
        {lethal && (
          <span className="ml-auto tag animate-glow bg-life px-1.5 py-px font-pixel text-[8px] uppercase text-paper">
            ⚡ lethal
          </span>
        )}
      </div>

      {/* enemy boss */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-3 px-4">
        {boss ? (
          <>
            <span className="font-pixel text-[7px] uppercase text-paper/50">the boss</span>
            <div key={shake} className={`panel w-full max-w-xs bg-gold p-4 text-center ${shake > 0 ? "hitshake" : ""}`}>
              <p className="mb-3 text-lg leading-tight text-ink">{boss.title}</p>
              <div className="flex justify-center gap-1">
                {Array.from({ length: match.bossHpMax }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-5 w-7 border-2 border-ink ${i < bossRemaining ? "bg-life" : "bg-paper2"}`}
                  />
                ))}
              </div>
              <p className="mt-2 font-pixel text-[7px] uppercase text-ink/60">
                {bossRemaining} hp · {match.bossHpDone}/{match.bossHpMax} struck
              </p>
            </div>

            {/* floating damage numbers */}
            <div className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center">
              {floaters.map((f) => (
                <span key={f.id} className="floatup absolute font-pixel text-lg text-health">
                  {f.text}
                </span>
              ))}
            </div>

            {focusing ? (
              <div className="w-full max-w-xs">
                <div className="bar h-7 w-full overflow-hidden">
                  <div
                    className="flex h-full items-center justify-center bg-health font-pixel text-[11px] text-ink"
                    style={{ width: `${Math.min(100, Math.max(8, (remMs / (FOCUS_MINUTES * 60000)) * 100))}%` }}
                  >
                    {clock(remMs)}
                  </div>
                </div>
                <button
                  onClick={onGiveUpFocus}
                  className="mt-2 w-full font-pixel text-[7px] uppercase text-paper/50 hover:text-life"
                >
                  give up the turn
                </button>
              </div>
            ) : (
              <button
                onClick={attack}
                disabled={crystalsLeft <= 0}
                className="btn w-full max-w-xs bg-life py-3 font-pixel text-[11px] uppercase text-paper disabled:opacity-50"
              >
                {crystalsLeft <= 0 ? "out of mana" : `⚔ attack · focus ${FOCUS_MINUTES}m`}
              </button>
            )}
          </>
        ) : (
          <p className="max-w-xs text-center text-base text-paper/70">
            No boss on the field. Crown one from your hand, then attack it.
          </p>
        )}
      </div>

      {/* your hand */}
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
    </div>
  );
}
