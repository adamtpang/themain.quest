"use client";

import { useState } from "react";
import { Problem, problemScore, sortProblems } from "@/lib/problems";
import { makeId } from "@/lib/parse";

function Pips({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`h-2.5 w-2.5 border-2 border-ink ${i < value ? color : "bg-paper2"}`}
        />
      ))}
    </div>
  );
}

export function ProblemsBoard({
  problems,
  onChange,
}: {
  problems: Problem[];
  onChange: (next: Problem[] | ((prev: Problem[]) => Problem[])) => void;
}) {
  const [edit, setEdit] = useState(false);
  const sorted = sortProblems(problems);

  function patch(id: string, p: Partial<Problem>) {
    onChange((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));
  }
  function bump(id: string, field: "importance" | "urgency", delta: number) {
    onChange((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, [field]: Math.max(1, Math.min(5, x[field] + delta)) } : x
      )
    );
  }
  function remove(id: string) {
    onChange((prev) => prev.filter((x) => x.id !== id));
  }
  function add() {
    onChange((prev) => [
      ...prev,
      { id: makeId(), title: "New problem", importance: 3, urgency: 3, why: "", beaten: false },
    ]);
  }

  return (
    <section className="mx-auto max-w-md px-3 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-pixel text-[10px] uppercase text-ink">👹 boss list · life problems</h2>
        <button
          onClick={() => setEdit((v) => !v)}
          className="btn bg-paper px-2 py-1 font-pixel text-[7px] uppercase text-ink"
        >
          {edit ? "done" : "edit"}
        </button>
      </div>
      <p className="mb-2 text-sm leading-snug text-ink/70">
        Ranked by importance and urgency. Tap Finn to plan the order to beat them.
      </p>

      <div className="space-y-2">
        {sorted.map((p, i) => (
          <div
            key={p.id}
            className={`panel p-2 ${p.beaten ? "bg-health/30" : i === 0 ? "bg-life/15" : "bg-paper"}`}
          >
            <div className="flex items-start gap-2">
              <button
                onClick={() => patch(p.id, { beaten: !p.beaten })}
                className={`mt-px flex h-6 w-6 flex-none items-center justify-center border-2 border-ink text-sm leading-none ${
                  p.beaten ? "bg-health text-ink" : "bg-paper2 text-transparent"
                }`}
                aria-label="mark beaten"
              >
                ✓
              </button>
              {edit ? (
                <input
                  value={p.title}
                  onChange={(e) => patch(p.id, { title: e.target.value })}
                  className="inset min-w-0 flex-1 px-1 py-0.5 text-lg text-ink focus:outline-none"
                />
              ) : (
                <p className={`min-w-0 flex-1 text-lg leading-tight ${p.beaten ? "text-ink/50 line-through" : "text-ink"}`}>
                  <span className="mr-1 font-pixel text-[8px] text-ink/50">#{i + 1}</span>
                  {p.title}
                </p>
              )}
              {edit && (
                <button
                  onClick={() => remove(p.id)}
                  className="flex-none font-pixel text-[10px] text-ink/40 hover:text-life"
                  aria-label="delete"
                >
                  x
                </button>
              )}
            </div>

            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="font-pixel text-[6px] uppercase text-life">imp</span>
                <Pips value={p.importance} max={5} color="bg-life" />
                {edit && (
                  <span className="ml-1 flex gap-0.5">
                    <button onClick={() => bump(p.id, "importance", -1)} className="btn h-5 w-5 bg-paper font-pixel text-[8px] text-ink">−</button>
                    <button onClick={() => bump(p.id, "importance", 1)} className="btn h-5 w-5 bg-life font-pixel text-[8px] text-paper">+</button>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-pixel text-[6px] uppercase text-taxes">urg</span>
                <Pips value={p.urgency} max={5} color="bg-taxes" />
                {edit && (
                  <span className="ml-1 flex gap-0.5">
                    <button onClick={() => bump(p.id, "urgency", -1)} className="btn h-5 w-5 bg-paper font-pixel text-[8px] text-ink">−</button>
                    <button onClick={() => bump(p.id, "urgency", 1)} className="btn h-5 w-5 bg-taxes font-pixel text-[8px] text-ink">+</button>
                  </span>
                )}
              </div>
              {!edit && (
                <span className="ml-auto font-pixel text-[8px] text-ink/50">{problemScore(p)}pts</span>
              )}
            </div>

            {edit ? (
              <textarea
                value={p.why}
                onChange={(e) => patch(p.id, { why: e.target.value })}
                rows={3}
                placeholder="why is this happening? what is the root cause?"
                className="inset mt-2 w-full resize-y p-1.5 text-sm leading-snug text-ink placeholder:text-ink/40 focus:outline-none"
              />
            ) : (
              p.why && <p className="mt-2 text-sm leading-snug text-ink/75">{p.why}</p>
            )}
          </div>
        ))}

        {edit && (
          <button
            onClick={add}
            className="panel w-full bg-paper/50 py-3 font-pixel text-[8px] uppercase text-ink/60"
          >
            + add problem
          </button>
        )}
      </div>
    </section>
  );
}
