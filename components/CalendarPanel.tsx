"use client";

import { useEffect, useState } from "react";
import { useLocalStorage } from "@/lib/storage";

type Mode = "AGENDA" | "WEEK" | "MONTH";

const SRC_KEY = "tmq.gcal.src";
const MODE_KEY = "tmq.gcal.mode";
const DEFAULT_SRC = "adamtpangelinan@gmail.com";

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
    bgcolor: "#fff7e6",
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
    <section className="mx-auto max-w-md px-3 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-pixel text-[10px] uppercase text-ink">🕰 today's timeline</h2>
        <div className="flex items-center gap-1">
          {modes.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`btn px-1.5 py-px font-pixel text-[6px] uppercase ${
                mode === m ? "bg-visa text-paper" : "bg-paper text-ink"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="panel overflow-hidden bg-paper p-0">
        {hydrated && src ? (
          <iframe
            key={`${src}-${mode}-${tz}`}
            title="Google Calendar"
            src={embedUrl(src, mode, tz)}
            className="block h-[440px] w-full border-0 bg-paper"
            loading="lazy"
          />
        ) : (
          <div className="flex h-[120px] items-center justify-center text-lg text-ink/60">
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
              className="inset flex-1 px-2 py-1 text-base text-ink placeholder:text-ink/40 focus:outline-none"
            />
            <button
              onClick={() => {
                setSrc(draft.trim() || DEFAULT_SRC);
                setEditing(false);
              }}
              className="btn bg-health px-2 py-1 font-pixel text-[7px] uppercase text-ink"
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
              className="font-pixel text-[7px] uppercase text-ink/60 hover:text-ink"
            >
              change calendar
            </button>
            <a
              href="https://calendar.google.com/calendar/r"
              target="_blank"
              rel="noopener noreferrer"
              className="font-pixel text-[7px] uppercase text-visa"
            >
              open in google →
            </a>
          </>
        )}
      </div>

      <p className="mt-1 text-sm leading-snug text-ink/60">
        Shows your calendar when you are signed into this Google account in this browser. A permission
        page means you need to sign in here first.
      </p>
    </section>
  );
}
