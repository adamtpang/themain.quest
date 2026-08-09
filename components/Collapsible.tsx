"use client";

import { useLocalStorage } from "@/lib/storage";

// Groups reference/progression panels behind a named, collapsed-by-default
// section instead of dumping everything into one endless scroll. "What do I
// do right now" (boss, match, quest log, life problems) stays always open;
// "how am I doing over time" and "extras" collapse until asked for. State
// persists per section so once you open one, it stays open.

export function Collapsible({
  storageKey,
  title,
  subtitle,
  children,
}: {
  storageKey: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useLocalStorage<boolean>(storageKey, false);

  return (
    <>
      <div className="mx-auto max-w-md px-3 pt-4">
        <button
          onClick={() => setOpen((v) => !v)}
          className="panel flex w-full items-center justify-between gap-2 bg-paper px-3 py-2 text-left"
          aria-expanded={open}
        >
          <span>
            <span className="block font-pixel text-[9px] uppercase text-ink">{title}</span>
            <span className="mt-0.5 block text-sm text-ink/60">{subtitle}</span>
          </span>
          <span className="font-pixel text-[9px] text-ink/50">{open ? "▲ hide" : "▼ show"}</span>
        </button>
      </div>
      {/* children are full sections that apply their own mx-auto max-w-md px-3 — do not re-wrap them */}
      {open && children}
    </>
  );
}
