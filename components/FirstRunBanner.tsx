"use client";

// Shown only before the first quest exists. Everything else on this page —
// The Match, The Climb, Unlocks, Schools, the mentor carousel — is an
// OUTCOME of playing, not an entry point, and dumping all of it on a player
// who hasn't done anything yet is exactly why "I don't get how to use this"
// happens. One explanation, one action.

export function FirstRunBanner() {
  return (
    <div className="mx-auto max-w-md px-3 pt-3">
      <div className="panel bg-visa px-3 py-3">
        <p className="font-pixel text-[8px] uppercase text-paper">first time here?</p>
        <p className="mt-1 text-lg leading-snug text-paper">
          This is your life, gamified. Paste today&rsquo;s to-do list below, one line per task, and
          the board builds itself: a boss to fight, a score that only moves on real closes.
        </p>
        <a
          href="#quest-log"
          className="btn mt-3 block w-full bg-paper py-2 text-center font-pixel text-[10px] uppercase text-ink"
        >
          ↓ start: load your outbox
        </a>
      </div>
    </div>
  );
}
