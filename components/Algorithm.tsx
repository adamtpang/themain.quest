"use client";

import { useState } from "react";
import { Quest } from "@/lib/types";
import { PriorityTag } from "./PriorityTag";

// Elon's algorithm as a daily ritual: question every quest, delete what does
// not survive, keep only the critical path. Rockefeller measured every drop.
export function Algorithm({
  quests,
  onDelete,
  onSetBinding,
  onClose,
}: {
  quests: Quest[];
  onDelete: (id: string) => void;
  onSetBinding: (id: string) => void;
  onClose: () => void;
}) {
  const [queue] = useState(() => quests); // snapshot so deletions do not shift the walk
  const [i, setI] = useState(0);
  const [cut, setCut] = useState(0);
  const [kept, setKept] = useState(0);

  const q = queue[i];
  const done = i >= queue.length;

  function keep() {
    setKept((k) => k + 1);
    setI((x) => x + 1);
  }
  function del() {
    if (q) onDelete(q.id);
    setCut((c) => c + 1);
    setI((x) => x + 1);
  }
  function boss() {
    if (q) onSetBinding(q.id);
    setKept((k) => k + 1);
    setI((x) => x + 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/90 p-4">
      <div className="panel mx-auto flex h-full w-full max-w-md flex-col bg-paper p-4">
        <div className="flex items-center justify-between border-b-4 border-ink pb-2">
          <span className="font-pixel text-[10px] uppercase text-ink">⚙ the algorithm</span>
          <button onClick={onClose} className="font-pixel text-[10px] text-ink/60 hover:text-life">
            x
          </button>
        </div>

        {queue.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-lg text-ink/70">Nothing to question. Load your outbox first.</p>
            <button onClick={onClose} className="btn bg-paper px-4 py-2 font-pixel text-[9px] uppercase text-ink">
              close
            </button>
          </div>
        ) : done ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <span className="font-pixel text-base text-life">cut {cut}</span>
            <span className="font-pixel text-base text-health">{kept} survive</span>
            <p className="max-w-xs text-base leading-snug text-ink/75">
              The critical path is clear. Now spend your mana on the one that makes money.
            </p>
            <button onClick={onClose} className="btn bg-health px-4 py-2 font-pixel text-[10px] uppercase text-ink">
              done
            </button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            <p className="mt-3 text-center font-pixel text-[7px] uppercase text-ink/50">
              {i + 1} / {queue.length} · question. delete. keep only what compounds.
            </p>

            <div className="my-auto">
              <div className="panel bg-paper2 p-4">
                <p className="mb-3 text-xl leading-tight text-ink">{q.title}</p>
                <PriorityTag priority={q.priority} />
                <p className="mt-4 text-base leading-snug text-ink/70">
                  Whose ask is this? Does it survive deletion? Elon deletes every part. Rockefeller
                  counted every drop.
                </p>
              </div>
            </div>

            <div className="space-y-2 pb-2">
              <button
                onClick={del}
                className="btn w-full bg-life py-3 font-pixel text-[11px] uppercase text-paper"
              >
                delete it
              </button>
              <div className="flex gap-2">
                <button
                  onClick={keep}
                  className="btn flex-1 bg-paper py-2 font-pixel text-[9px] uppercase text-ink"
                >
                  keep
                </button>
                <button
                  onClick={boss}
                  className="btn flex-1 bg-gold py-2 font-pixel text-[9px] uppercase text-ink"
                >
                  🗡 make boss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
