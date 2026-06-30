"use client";

import { Quest } from "@/lib/types";
import { outranksForBoss } from "@/lib/board";
import { PriorityTag } from "./PriorityTag";

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
  const harderExists =
    binding && recommended && recommended.id !== binding.id && outranksForBoss(recommended, binding);

  return (
    <section className="mx-auto max-w-md px-3 pt-3">
      <div className="panel relative overflow-hidden bg-gold p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-pixel text-[8px] uppercase text-ink">🗡 main quest · the one boss</span>
          {binding && (
            <button
              onClick={onClear}
              className="font-pixel text-[7px] uppercase text-ink/70 hover:text-ink"
            >
              swap
            </button>
          )}
        </div>

        {binding ? (
          <div className="animate-flash">
            <p className="mb-2 text-2xl leading-tight text-ink">{binding.title}</p>
            <div className="mb-3">
              <PriorityTag priority={binding.priority} />
            </div>
            <button
              onClick={onComplete}
              className="btn w-full bg-life py-2 font-pixel text-[11px] uppercase text-paper"
            >
              strike the boss ⚔
            </button>
            {harderExists && (
              <button
                onClick={() => onPromote(recommended!.id)}
                className="btn mt-2 w-full bg-paper px-2 py-1.5 text-left text-base text-ink"
              >
                A tougher boss is open: <span className="text-life">{recommended!.title}</span>. Tap to
                challenge it.
              </button>
            )}
          </div>
        ) : (
          <div>
            <p className="mb-1 text-xl leading-tight text-ink">No boss chosen.</p>
            <p className="mb-3 text-base leading-snug text-ink/80">
              This slot only takes a cash, ship, or life close. A trap cannot be the boss. Pick your
              hardest open fight and go.
            </p>
            {recommended ? (
              <button
                onClick={() => onPromote(recommended.id)}
                className="btn w-full bg-paper p-2 text-left"
              >
                <span className="mb-2 block text-lg leading-tight text-ink">{recommended.title}</span>
                <span className="flex items-center justify-between gap-2">
                  <PriorityTag priority={recommended.priority} />
                  <span className="font-pixel text-[8px] uppercase text-ink">make it boss →</span>
                </span>
              </button>
            ) : (
              <p className="inset px-2 py-2 text-base text-ink/80">
                Load the quest log below, then crown your hardest fight here.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
