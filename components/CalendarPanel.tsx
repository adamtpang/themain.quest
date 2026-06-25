"use client";

import { useEffect, useState } from "react";
import { useLocalStorage } from "@/lib/storage";

type Mode = "AGENDA" | "WEEK" | "MONTH";

const SRC_KEY = "tmq.gcal.src";
const MODE_KEY = "tmq.gcal.mode";
const DEFAULT_SRC = "adamtpang@gmail.com";

function embedUrl(src: string, mode: Mode, tz: string) {
  const p = new URLSearchParams({
    src,
    ctz: tz,
    mode,
    showTitle: "0",
    showPrint: "0",
    showCalendars: "0",
    showTz: "0",
    showNav: "1",
    showDate: "1",
    bgcolor: "#0d1018",
  });
  return `https://calendar.google.com/calendar/embed?${p.toString()}`;
}

export function CalendarPanel() {
  const [src, setSrc, hydrated] = useLocalStorage<string>(SRC_KEY, DEFAULT_SRC);
  const [mode, setMode] = useLocalStorage<Mode>(MODE_KEY, "AGENDA");
  const [tz, setTz] = useState("UTC");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    try {
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    } catch {
      /* keep UTC */
    }
  }, []);

  const modes: Mode[] = ["AGENDA", "WEEK", "MONTH"];

  return (
    <section className="mx-auto max-w-md px-4 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-hud-dim">
          📅 Calendar
        </h2>
        <div className="flex items-center gap-1">
          {modes.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider active:scale-95 ${
                mode === m
                  ? "border-visa/60 bg-visa/15 text-visa"
                  : "border-hud-line bg-hud-panel text-hud-dim"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-hud-line bg-hud-panel">
        {hydrated && src ? (
          <iframe
            key={`${src}-${mode}-${tz}`}
            title="Google Calendar"
            src={embedUrl(src, mode, tz)}
            className="block h-[460px] w-full border-0 bg-white"
            loading="lazy"
          />
        ) : (
          <div className="flex h-[120px] items-center justify-center text-xs text-hud-dim">
            No calendar set.
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        {editing ? (
          <div className="flex w-full items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="you@gmail.com or calendar id"
              className="flex-1 rounded-lg border border-hud-line bg-hud-bg px-2 py-1 text-xs text-white placeholder:text-hud-dim/60 focus:border-visa focus:outline-none"
            />
            <button
              onClick={() => {
                setSrc(draft.trim() || DEFAULT_SRC);
                setEditing(false);
              }}
              className="rounded-lg bg-visa px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white active:scale-95"
            >
              save
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => {
                setDraft(src);
                setEditing(true);
              }}
              className="text-[10px] font-bold uppercase tracking-wider text-hud-dim hover:text-white"
            >
              change calendar
            </button>
            <a
              href="https://calendar.google.com/calendar/r"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold uppercase tracking-wider text-visa"
            >
              open in google ↗
            </a>
          </>
        )}
      </div>

      <p className="mt-1 text-[10px] leading-relaxed text-hud-dim/80">
        Shows your calendar when you are signed into this Google account in this browser. A permission
        page means you need to sign in here first.
      </p>
    </section>
  );
}
