"use client";

import { useEffect, useState } from "react";
import { MENTORS, Mentor, mentorFor, mentorIndexFor } from "@/lib/mentors";

export function MentorPanel() {
  const [i, setI] = useState<number | null>(null);

  // Date-driven so the app, the calendar banner, and the extension agree on
  // who is teaching today. Set after mount to avoid an SSR mismatch.
  useEffect(() => {
    setI(mentorIndexFor(new Date()));
  }, []);

  if (i === null) return null;
  const m: Mentor = MENTORS[i];

  return (
    <section className="mx-auto max-w-md px-3 pt-4">
      <div className="panel bg-gold p-3">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-pixel text-[10px] uppercase text-ink">🏛 today&apos;s mentor</h2>
          <span className="font-pixel text-[6px] uppercase text-ink/50">
            {i + 1}/{MENTORS.length}
          </span>
        </div>
        <p className="font-pixel text-[11px] uppercase leading-tight text-ink">{m.name}</p>
        <p className="mt-0.5 font-pixel text-[6px] uppercase text-ink/60">{m.tag}</p>
        <p className="mt-2 text-base leading-snug text-ink/85">{m.day}</p>
        <div className="mt-2 border-t-2 border-dashed border-ink/30 pt-2">
          <span className="font-pixel text-[7px] uppercase text-ink/60">your move</span>
          <p className="mt-0.5 text-base leading-snug text-ink">{m.move}</p>
        </div>
        <div className="mt-2 flex gap-1.5">
          <button
            onClick={() => setI((v) => ((v ?? 0) - 1 + MENTORS.length) % MENTORS.length)}
            className="btn bg-paper px-2 py-1 font-pixel text-[7px] uppercase text-ink"
          >
            ← prev
          </button>
          <button
            onClick={() => setI((v) => ((v ?? 0) + 1) % MENTORS.length)}
            className="btn bg-paper px-2 py-1 font-pixel text-[7px] uppercase text-ink"
          >
            next →
          </button>
          <button
            onClick={() => setI(mentorIndexFor(new Date()))}
            className="ml-auto font-pixel text-[7px] uppercase text-ink/50 hover:text-ink"
          >
            today
          </button>
        </div>
      </div>
    </section>
  );
}
