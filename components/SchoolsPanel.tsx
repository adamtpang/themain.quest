"use client";

import { SCHOOL_IDS, SCHOOL_META, Schools, schoolLevel, schoolProgress } from "@/lib/schools";

export function SchoolsPanel({ schools }: { schools: Schools }) {
  const mastery = SCHOOL_IDS.reduce((a, id) => a + schoolLevel(schools[id]), 0);

  return (
    <section className="mx-auto max-w-md px-3 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-pixel text-[10px] uppercase text-ink">🧙 schools</h2>
        <span className="text-base text-ink/60">mastery {mastery}</span>
      </div>
      <p className="mb-2 text-sm leading-snug text-ink/70">
        Level a school by closing quests in it. No self-rating, you earn it. Be Ben Franklin, max
        them all.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {SCHOOL_IDS.map((id) => {
          const m = SCHOOL_META[id];
          const p = schoolProgress(schools[id]);
          return (
            <div key={id} className="panel bg-paper p-2">
              <div className="flex items-center justify-between gap-1">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="text-lg">{m.emoji}</span>
                  <span className="truncate text-base text-ink">{m.name}</span>
                </span>
                <span className={`flex-none font-pixel text-sm ${m.text}`}>lv {p.level}</span>
              </div>
              <div className="bar mt-2 h-3 w-full overflow-hidden">
                <div
                  className={`h-full ${m.bar} transition-[width] duration-300`}
                  style={{ width: `${p.pct}%` }}
                />
              </div>
              <span className="mt-1 block text-sm leading-none text-ink/55">
                {p.intoLevel}/{p.span} to lv {p.level + 1}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
