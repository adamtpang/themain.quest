"use client";

import { useEffect, useState } from "react";
import { computeLifeLeft, LifeLeft } from "@/lib/life";
import { Kpi, KPI_COLOR_CLASS, KPI_COLOR_CYCLE, KpiColor } from "@/lib/kpis";
import { makeId } from "@/lib/parse";

function Bar({ value, max, fill }: { value: number; max: number; fill: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="bar mt-2 h-3 w-full overflow-hidden">
      <div className={`h-full ${fill} transition-[width] duration-300`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function TimeTile() {
  const [life, setLife] = useState<LifeLeft | null>(null);
  useEffect(() => setLife(computeLifeLeft()), []);
  const pctLeft = life ? 100 - life.percentElapsed : 0;
  return (
    <div className="panel bg-paper p-2">
      <div className="flex items-center justify-between">
        <span className="font-pixel text-[8px] uppercase text-taxes">⏳ time</span>
        <span className="font-pixel text-[6px] uppercase text-ink/50">the clock</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-pixel text-base text-taxes">
          {life ? life.daysLeft.toLocaleString() : "..."}
        </span>
        <span className="text-sm text-ink/60">days</span>
      </div>
      <Bar value={pctLeft} max={100} fill="bg-taxes" />
      <span className="mt-1 block text-sm leading-tight text-ink/60">
        {life ? pctLeft.toFixed(1) : "0"}% still on the board
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
      { id: makeId(), emoji: "⭐", label: "New stat", value: 5, max: 10, color: "gold" },
    ]);
  }

  return (
    <section className="mx-auto max-w-md px-3 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-pixel text-[10px] uppercase text-ink">🎲 stats</h2>
        <button
          onClick={() => setEdit((v) => !v)}
          className="btn bg-paper px-2 py-1 font-pixel text-[7px] uppercase text-ink"
        >
          {edit ? "done" : "edit"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <TimeTile />

        {kpis.map((k) => {
          const c = KPI_COLOR_CLASS[k.color];
          return (
            <div key={k.id} className="panel bg-paper p-2">
              <div className="flex items-center justify-between gap-1">
                {edit ? (
                  <input
                    value={k.emoji}
                    onChange={(e) => update(k.id, { emoji: e.target.value.slice(0, 2) })}
                    className="inset w-8 text-center text-lg"
                    aria-label="emoji"
                  />
                ) : (
                  <span className="text-lg">{k.emoji}</span>
                )}
                {edit ? (
                  <button
                    onClick={() => remove(k.id)}
                    className="font-pixel text-[10px] text-ink/40 hover:text-life"
                    aria-label="delete stat"
                  >
                    x
                  </button>
                ) : (
                  <span className={`font-pixel text-sm ${c.text}`}>
                    {k.value}
                    <span className="text-[8px] text-ink/50">/{k.max}</span>
                  </span>
                )}
              </div>

              {edit ? (
                <input
                  value={k.label}
                  onChange={(e) => update(k.id, { label: e.target.value })}
                  className="inset mt-1 w-full px-1 py-0.5 text-base text-ink focus:outline-none"
                  aria-label="label"
                />
              ) : (
                <span className="mt-1 block truncate text-lg leading-none text-ink">{k.label}</span>
              )}

              <Bar value={k.value} max={k.max} fill={c.bar} />

              {edit ? (
                <button
                  onClick={() => cycleColor(k.id)}
                  className="btn mt-2 w-full bg-paper py-1 font-pixel text-[7px] uppercase text-ink"
                >
                  recolor
                </button>
              ) : (
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => bump(k.id, -1)}
                    className="btn h-7 flex-1 bg-paper font-pixel text-xs text-ink"
                    aria-label="decrease"
                  >
                    −
                  </button>
                  <button
                    onClick={() => bump(k.id, 1)}
                    className={`btn h-7 flex-1 font-pixel text-xs text-ink ${c.bar}`}
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
            className="panel flex min-h-[120px] items-center justify-center bg-paper/50 font-pixel text-[8px] uppercase text-ink/60"
          >
            + add stat
          </button>
        )}
      </div>
    </section>
  );
}
