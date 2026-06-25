"use client";

import { useMemo, useState } from "react";
import { Quest } from "@/lib/types";
import { parseOutbox } from "@/lib/parse";
import { sortQuests } from "@/lib/board";
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
    <div
      className={`rounded-xl border p-3 ${
        q.passesMotionTest
          ? q.isBinding
            ? "border-hud-gold/50 bg-hud-gold/5"
            : "border-hud-line bg-hud-panel"
          : "border-hud-line/60 bg-hud-bg/40 opacity-70"
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          onClick={() => onToggleDone(q.id)}
          className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-md border text-xs transition active:scale-90 ${
            q.done
              ? "border-transparent bg-health text-black animate-pop"
              : "border-hud-line bg-hud-bg text-transparent"
          }`}
          aria-label="toggle done"
        >
          ✓
        </button>
        <p
          className={`min-w-0 flex-1 text-sm leading-snug ${
            q.done ? "text-hud-dim line-through" : "text-white"
          }`}
        >
          {q.isBinding && <span className="mr-1">🥇</span>}
          {q.title}
        </p>
        <button
          onClick={() => onDelete(q.id)}
          className="flex-none px-1 text-hud-dim hover:text-life"
          aria-label="delete"
        >
          ×
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button onClick={() => onCyclePriority(q.id)} aria-label="change priority">
          <PriorityTag priority={q.priority} />
        </button>
        <button onClick={() => onToggleMotion(q.id)} aria-label="toggle motion test">
          {q.passesMotionTest ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-health/40 bg-health/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-health">
              real
            </span>
          ) : (
            <MotionTag />
          )}
        </button>

        {eligible && !q.isBinding && (
          <button
            onClick={() => onSetBinding(q.id)}
            className="ml-auto rounded-full border border-hud-gold/50 bg-hud-gold/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-hud-gold active:scale-95"
          >
            🥇 set #1
          </button>
        )}
      </div>

      {!q.passesMotionTest && (
        <p className="mt-2 text-[11px] italic text-hud-dim">
          This is motion, not execution. Park it.
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

  const sorted = useMemo(() => sortQuests(quests), [quests]);
  const real = sorted.filter((q) => q.passesMotionTest);
  const motion = sorted.filter((q) => !q.passesMotionTest);

  function handleParse() {
    const parsed = parseOutbox(raw);
    if (parsed.length) onAdd(parsed);
    setRaw("");
    setOpen(false);
  }

  return (
    <section className="mx-auto max-w-md px-4 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-hud-dim">
          The board
        </h2>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-hud-line bg-hud-panel px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white active:scale-95"
        >
          {open ? "close" : "+ paste outbox"}
        </button>
      </div>

      {open && (
        <div className="mb-3 rounded-xl border border-hud-line bg-hud-panel p-3">
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={6}
            placeholder={"Dump raw outbox lines, one per line.\nTags like [im5 ef2] are stripped.\nMotion is auto flagged, you get final say."}
            className="w-full resize-y rounded-lg border border-hud-line bg-hud-bg p-2 text-sm text-white placeholder:text-hud-dim/60 focus:border-leverage focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-hud-dim">
              {raw.split(/\r?\n/).filter((l) => l.trim()).length} lines
            </span>
            <button
              onClick={handleParse}
              className="rounded-lg bg-leverage px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white active:scale-95"
            >
              Parse into quests
            </button>
          </div>
        </div>
      )}

      {real.length === 0 && motion.length === 0 && (
        <p className="rounded-xl border border-dashed border-hud-line bg-hud-panel/40 p-6 text-center text-xs text-hud-dim">
          No quests yet. Paste your outbox to load the board.
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
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-loops">
              Parked · motion · 0 pts
            </span>
            <span className="h-px flex-1 bg-hud-line" />
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
