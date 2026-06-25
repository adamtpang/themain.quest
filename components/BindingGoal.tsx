"use client";

import { Quest } from "@/lib/types";
import { PRIORITY_ORDER } from "@/lib/types";
import { PriorityTag } from "./PriorityTag";

function rank(p: Quest["priority"]) {
  return PRIORITY_ORDER.indexOf(p);
}

export function BindingGoal({
  binding,
  recommended,
  onComplete,
  onPromote,
  onClear,
}: {
  binding: Quest | null;
  recommended: Quest | null;
  onComplete: () => void;
  onPromote: (id: string) => void;
  onClear: () => void;
}) {
  // A harder open close exists than the one currently crowned.
  const harderExists =
    binding && recommended && recommended.id !== binding.id && rank(recommended.priority) < rank(binding.priority);

  return (
    <section className="mx-auto max-w-md px-4 pt-3">
      <div className="relative animate-glow overflow-hidden rounded-2xl border-2 border-hud-gold/60 bg-gradient-to-b from-hud-gold/10 to-hud-panel p-4 shadow-lg">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-hud-gold">
            🥇 Binding goal · your one move
          </span>
          {binding && (
            <button
              onClick={onClear}
              className="text-[10px] font-bold uppercase tracking-wider text-hud-dim hover:text-white"
            >
              swap
            </button>
          )}
        </div>

        {binding ? (
          <div className="animate-flash">
            <p className="mb-3 text-xl font-black leading-tight text-white">{binding.title}</p>
            <div className="mb-4">
              <PriorityTag priority={binding.priority} />
            </div>
            <button
              onClick={onComplete}
              className="w-full rounded-xl bg-hud-gold py-3 text-base font-black uppercase tracking-wider text-black transition active:scale-[0.98]"
            >
              Close it ✅
            </button>
            {harderExists && (
              <button
                onClick={() => onPromote(recommended!.id)}
                className="mt-2 w-full rounded-lg border border-life/40 bg-life/10 px-3 py-2 text-left text-xs text-life"
              >
                A harder close is open: <span className="font-bold">{recommended!.title}</span>. Tap to
                promote it to #1.
              </button>
            )}
          </div>
        ) : (
          <div>
            <p className="mb-1 text-lg font-black leading-tight text-white">No #1 set.</p>
            <p className="mb-3 text-xs leading-relaxed text-hud-dim">
              This slot only accepts a cash, ship, or life close. Motion cannot be #1. Crown your
              hardest open close and go.
            </p>
            {recommended ? (
              <button
                onClick={() => onPromote(recommended.id)}
                className="w-full rounded-xl border border-hud-gold/50 bg-hud-gold/10 p-3 text-left transition active:scale-[0.98]"
              >
                <span className="mb-2 block text-sm font-bold text-white">{recommended.title}</span>
                <span className="flex items-center justify-between">
                  <PriorityTag priority={recommended.priority} />
                  <span className="text-[10px] font-black uppercase tracking-wider text-hud-gold">
                    Set as #1 →
                  </span>
                </span>
              </button>
            ) : (
              <p className="rounded-lg border border-hud-line bg-hud-bg/50 p-3 text-xs text-hud-dim">
                Add real quests to the board below, then crown your hardest close here.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
