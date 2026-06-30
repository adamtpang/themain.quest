"use client";

import { useMemo, useState } from "react";
import { Quest } from "@/lib/types";
import { parseOutbox } from "@/lib/parse";
import { sortQuests } from "@/lib/board";
import { Algorithm } from "./Algorithm";
import { MotionTag, PriorityTag } from "./PriorityTag";

function QuestRow({
  q,
  onToggleDone,
  onCyclePriority,
  onToggleMotion,
  onSetBinding,
  onDelete,
}: {
  q: Quest;
  onToggleDone: (id: string) => void;
  onCyclePriority: (id: string) => void;
  onToggleMotion: (id: string) => void;
  onSetBinding: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const eligible = q.passesMotionTest && !q.done;
  return (
    <div className={`panel p-2 ${q.passesMotionTest ? (q.isBinding ? "bg-gold/40" : "bg-paper") : "bg-loops/20"}`}>
      <div className="flex items-start gap-2">
        <button
          onClick={() => onToggleDone(q.id)}
          className={`mt-px flex h-6 w-6 flex-none items-center justify-center border-2 border-ink text-sm leading-none active:translate-x-px active:translate-y-px ${
            q.done ? "bg-health text-ink animate-pop" : "bg-paper2 text-transparent"
          }`}
          aria-label="toggle done"
        >
          ✓
        </button>
        <p className={`min-w-0 flex-1 text-lg leading-tight ${q.done ? "text-ink/50 line-through" : "text-ink"}`}>
          {q.isBinding && <span className="mr-1">🗡</span>}
          {q.title}
        </p>
        <button
          onClick={() => onDelete(q.id)}
          className="flex-none px-1 font-pixel text-[10px] text-ink/40 hover:text-life"
          aria-label="delete"
        >
          x
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <button onClick={() => onCyclePriority(q.id)} aria-label="change priority">
          <PriorityTag priority={q.priority} />
        </button>
        <button onClick={() => onToggleMotion(q.id)} aria-label="toggle motion test">
          {q.passesMotionTest ? (
            <span className="tag inline-flex items-center bg-health px-1.5 py-px text-sm uppercase leading-none text-ink">
              quest
            </span>
          ) : (
            <MotionTag />
          )}
        </button>

        {q.scheduledTime && (
          <span className="tag inline-flex items-center bg-taxes px-1.5 py-px text-sm uppercase leading-none text-ink">
            ⏰ {q.scheduledTime}
          </span>
        )}
        {q.rungHint && (
          <span className="tag inline-flex items-center bg-paper2 px-1.5 py-px text-sm uppercase leading-none text-ink">
            rung {q.rungHint}
          </span>
        )}

        {eligible && !q.isBinding && (
          <button
            onClick={() => onSetBinding(q.id)}
            className="btn ml-auto bg-gold px-1.5 py-px font-pixel text-[7px] uppercase text-ink"
          >
            🗡 make boss
          </button>
        )}
      </div>

      {!q.passesMotionTest && (
        <p className="mt-1.5 text-sm italic leading-snug text-ink/60">
          This is a trap, not a quest. Park it.
        </p>
      )}
    </div>
  );
}

export function QuestBoard({
  quests,
  onAdd,
  onToggleDone,
  onCyclePriority,
  onToggleMotion,
  onSetBinding,
  onDelete,
}: {
  quests: Quest[];
  onAdd: (q: Quest[]) => void;
  onToggleDone: (id: string) => void;
  onCyclePriority: (id: string) => void;
  onToggleMotion: (id: string) => void;
  onSetBinding: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [raw, setRaw] = useState("");
  const [open, setOpen] = useState(false);
  const [algoOpen, setAlgoOpen] = useState(false);

  const sorted = useMemo(() => sortQuests(quests), [quests]);
  const real = sorted.filter((q) => q.passesMotionTest);
  const motion = sorted.filter((q) => !q.passesMotionTest);
  const openReal = real.filter((q) => !q.done);

  function handleParse() {
    const parsed = parseOutbox(raw);
    if (parsed.length) onAdd(parsed);
    setRaw("");
    setOpen(false);
  }

  return (
    <section className="mx-auto max-w-md px-3 pt-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="font-pixel text-[10px] uppercase text-ink">📜 quest log</h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAlgoOpen(true)}
            className="btn bg-ink px-2 py-1 font-pixel text-[7px] uppercase text-paper"
          >
            ⚙ algorithm
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="btn bg-visa px-2 py-1 font-pixel text-[7px] uppercase text-paper"
          >
            {open ? "close" : "+ load outbox"}
          </button>
        </div>
      </div>

      {algoOpen && (
        <Algorithm
          quests={openReal}
          onDelete={onDelete}
          onSetBinding={onSetBinding}
          onClose={() => setAlgoOpen(false)}
        />
      )}

      {open && (
        <div className="panel mb-3 bg-paper p-2">
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={6}
            placeholder={"Dump raw outbox lines, one per line.\nTags like [im5 ef2] get stripped.\nTraps are auto flagged, you get final say."}
            className="inset w-full resize-y p-2 text-lg leading-snug text-ink placeholder:text-ink/40 focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-base text-ink/60">
              {raw.split(/\r?\n/).filter((l) => l.trim()).length} lines
            </span>
            <button
              onClick={handleParse}
              className="btn bg-health px-2 py-1 font-pixel text-[8px] uppercase text-ink"
            >
              parse to quests
            </button>
          </div>
        </div>
      )}

      {real.length === 0 && motion.length === 0 && (
        <p className="panel bg-paper/70 p-5 text-center text-lg text-ink/60">
          Empty log. Load your outbox to fill the board.
        </p>
      )}

      <div className="space-y-2">
        {real.map((q) => (
          <QuestRow
            key={q.id}
            q={q}
            onToggleDone={onToggleDone}
            onCyclePriority={onCyclePriority}
            onToggleMotion={onToggleMotion}
            onSetBinding={onSetBinding}
            onDelete={onDelete}
          />
        ))}
      </div>

      {motion.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-pixel text-[8px] uppercase text-loops">✦ traps · parked · 0 xp</span>
            <span className="h-1 flex-1 bg-loops/50" />
          </div>
          <div className="space-y-2">
            {motion.map((q) => (
              <QuestRow
                key={q.id}
                q={q}
                onToggleDone={onToggleDone}
                onCyclePriority={onCyclePriority}
                onToggleMotion={onToggleMotion}
                onSetBinding={onSetBinding}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
