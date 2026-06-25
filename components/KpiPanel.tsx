"use client";

import { useEffect, useState } from "react";
import { computeLifeLeft, LifeLeft } from "@/lib/life";
import {
  Kpi,
  KPI_COLOR_CLASS,
  KPI_COLOR_CYCLE,
  KpiColor,
} from "@/lib/kpis";
import { makeId } from "@/lib/parse";

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-hud-line">
      <div
        className={`h-full rounded-full ${color} transition-[width] duration-300`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function TimeTile() {
  const [life, setLife] = useState<LifeLeft | null>(null);
  useEffect(() => setLife(computeLifeLeft()), []);
  const pctLeft = life ? 100 - life.percentElapsed : 0;
  return (
    <div className="rounded-xl border border-taxes/40 bg-taxes/5 p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold text-taxes">
          <span className="text-base">⏳</span> Time
        </span>
        <span className="text-[9px] uppercase tracking-wider text-hud-dim">the clock</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-black tabular-nums text-taxes">
          {life ? life.daysLeft.toLocaleString() : "..."}
        </span>
        <span className="text-[10px] font-bold text-hud-dim">days left</span>
      </div>
      <Bar value={pctLeft} max={100} color="bg-taxes" />
      <span className="mt-1 block text-[10px] text-hud-dim">
        {life ? pctLeft.toFixed(1) : "0"}% of the game still on the board
      </span>
    </div>
  );
}

export function KpiPanel({
  kpis,
  onChange,
}: {
  kpis: Kpi[];
  onChange: (next: Kpi[] | ((prev: Kpi[]) => Kpi[])) => void;
}) {
  const [edit, setEdit] = useState(false);

  // All updates are functional so rapid taps never clobber each other.
  function update(id: string, patch: Partial<Kpi>) {
    onChange((prev) => prev.map((k) => (k.id === id ? { ...k, ...patch } : k)));
  }
  function bump(id: string, delta: number) {
    onChange((prev) =>
      prev.map((k) =>
        k.id === id ? { ...k, value: Math.max(0, Math.min(k.max, k.value + delta)) } : k
      )
    );
  }
  function cycleColor(id: string) {
    onChange((prev) =>
      prev.map((k) => {
        if (k.id !== id) return k;
        const i = KPI_COLOR_CYCLE.indexOf(k.color);
        return { ...k, color: KPI_COLOR_CYCLE[(i + 1) % KPI_COLOR_CYCLE.length] as KpiColor };
      })
    );
  }
  function remove(id: string) {
    onChange((prev) => prev.filter((k) => k.id !== id));
  }
  function add() {
    onChange((prev) => [
      ...prev,
      { id: makeId(), emoji: "⭐", label: "New KPI", value: 5, max: 10, color: "gold" },
    ]);
  }

  return (
    <section className="mx-auto max-w-md px-4 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-hud-dim">
          Life KPIs
        </h2>
        <button
          onClick={() => setEdit((v) => !v)}
          className="rounded-full border border-hud-line bg-hud-panel px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white active:scale-95"
        >
          {edit ? "done" : "edit"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <TimeTile />

        {kpis.map((k) => {
          const c = KPI_COLOR_CLASS[k.color];
          return (
            <div key={k.id} className={`rounded-xl border bg-hud-panel p-3 ${c.ring}`}>
              <div className="flex items-center justify-between gap-1">
                {edit ? (
                  <input
                    value={k.emoji}
                    onChange={(e) => update(k.id, { emoji: e.target.value.slice(0, 2) })}
                    className="w-8 rounded bg-hud-bg text-center text-base"
                    aria-label="emoji"
                  />
                ) : (
                  <span className="text-base">{k.emoji}</span>
                )}
                {edit ? (
                  <button
                    onClick={() => remove(k.id)}
                    className="text-hud-dim hover:text-life"
                    aria-label="delete kpi"
                  >
                    ×
                  </button>
                ) : (
                  <span className={`text-lg font-black tabular-nums ${c.text}`}>
                    {k.value}
                    <span className="text-[10px] text-hud-dim">/{k.max}</span>
                  </span>
                )}
              </div>

              {edit ? (
                <input
                  value={k.label}
                  onChange={(e) => update(k.id, { label: e.target.value })}
                  className="mt-1 w-full rounded bg-hud-bg px-1 py-0.5 text-xs text-white focus:outline-none"
                  aria-label="label"
                />
              ) : (
                <span className="mt-1 block truncate text-xs font-bold text-white">{k.label}</span>
              )}

              <Bar value={k.value} max={k.max} color={c.bar} />

              {edit ? (
                <button
                  onClick={() => cycleColor(k.id)}
                  className={`mt-2 w-full rounded-md border py-1 text-[10px] font-bold uppercase tracking-wider ${c.ring} ${c.text}`}
                >
                  recolor
                </button>
              ) : (
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => bump(k.id, -1)}
                    className="h-7 flex-1 rounded-md border border-hud-line bg-hud-bg text-sm font-black text-hud-dim active:scale-95"
                    aria-label="decrease"
                  >
                    −
                  </button>
                  <button
                    onClick={() => bump(k.id, 1)}
                    className={`h-7 flex-1 rounded-md border text-sm font-black active:scale-95 ${c.ring} ${c.text}`}
                    aria-label="increase"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {edit && (
          <button
            onClick={add}
            className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-hud-line bg-hud-panel/40 text-xs font-bold text-hud-dim active:scale-95"
          >
            + Add KPI
          </button>
        )}
      </div>
    </section>
  );
}
