"use client";

import { useEffect, useState } from "react";
import { useLocalStorage } from "@/lib/storage";
import { freshLuck, LAWS, LuckState, luckNudge, luckSurface, mondayOf } from "@/lib/luck";

const LUCK_KEY = "tmq.luck";

export function LuckPanel() {
  const [luck, setLuck, hydrated] = useLocalStorage<LuckState>(LUCK_KEY, freshLuck(mondayOf()));
  const [showLaws, setShowLaws] = useState(false);

  // Luck is a flow, not a stock. It resets every Monday.
  useEffect(() => {
    if (!hydrated) return;
    const wk = mondayOf();
    if (luck.weekOf !== wk) setLuck(freshLuck(wk));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, luck.weekOf]);

  const surface = luckSurface(luck);

  return (
    <section className="mx-auto max-w-md px-3 pt-3">
      <div className="panel bg-paper p-3">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-pixel text-[10px] uppercase text-ink">🍀 luck surface</h2>
          <span className="font-pixel text-[6px] uppercase text-ink/50">this week</span>
        </div>
        <p className="mb-2 text-sm leading-snug text-ink/70">
          Success is collective, not individual. Shots times reach, because work nobody saw
          multiplies out to zero.
        </p>

        <div className="flex items-center gap-2">
          <Counter
            label="shots"
            hint="attempts launched"
            value={luck.shots}
            onAdd={() => setLuck((l) => ({ ...l, shots: l.shots + 1 }))}
            onSub={() => setLuck((l) => ({ ...l, shots: Math.max(0, l.shots - 1) }))}
          />
          <span className="font-pixel text-[12px] text-ink/60">x</span>
          <Counter
            label="reach"
            hint="new people who saw it"
            value={luck.touches}
            onAdd={() => setLuck((l) => ({ ...l, touches: l.touches + 1 }))}
            onSub={() => setLuck((l) => ({ ...l, touches: Math.max(0, l.touches - 1) }))}
          />
          <div className="ml-auto text-right">
            <div
              className={`font-pixel text-xl leading-none ${surface > 0 ? "text-health" : "text-life"}`}
            >
              {surface}
            </div>
            <div className="mt-1 font-pixel text-[6px] uppercase text-ink/50">surface</div>
          </div>
        </div>

        <p className="mt-2 inset px-2 py-1.5 text-sm leading-snug text-ink/80">{luckNudge(luck)}</p>

        <button
          onClick={() => setShowLaws((v) => !v)}
          className="mt-2 font-pixel text-[7px] uppercase text-ink/60 hover:text-ink"
        >
          the five laws {showLaws ? "▲" : "▼"}
        </button>
        {showLaws && (
          <ol className="mt-1 space-y-2">
            {LAWS.map((law) => (
              <li key={law.n} className="border-l-4 border-gold pl-2">
                <p className="font-pixel text-[8px] uppercase leading-tight text-ink">
                  {law.n}. {law.title}
                </p>
                <p className="mt-1 text-sm leading-snug text-ink/70">{law.lesson}</p>
                <p className="mt-1 text-sm leading-snug text-ink">→ {law.move}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function Counter({
  label,
  hint,
  value,
  onAdd,
  onSub,
}: {
  label: string;
  hint: string;
  value: number;
  onAdd: () => void;
  onSub: () => void;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center gap-1">
        <button
          onClick={onSub}
          className="btn bg-paper2 px-1.5 py-0.5 font-pixel text-[8px] text-ink"
          aria-label={`remove one ${label}`}
        >
          -
        </button>
        <span className="font-pixel text-lg leading-none text-ink">{value}</span>
        <button
          onClick={onAdd}
          className="btn bg-health px-1.5 py-0.5 font-pixel text-[8px] text-ink"
          aria-label={`add one ${label}`}
        >
          +
        </button>
      </div>
      <div className="mt-1 font-pixel text-[6px] uppercase text-ink/60">{label}</div>
      <div className="font-pixel text-[5px] uppercase text-ink/40">{hint}</div>
    </div>
  );
}
