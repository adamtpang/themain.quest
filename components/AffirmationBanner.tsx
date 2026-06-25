"use client";

import { useEffect, useState } from "react";
import { AFFIRMATIONS } from "@/lib/affirmations";

const KEY = "tmq.aff";

export function AffirmationBanner() {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(false);

  // Rotate to the next identity on every load.
  useEffect(() => {
    let prev = 0;
    try {
      prev = Number(window.localStorage.getItem(KEY) ?? "0") || 0;
    } catch {
      /* ignore */
    }
    const next = (prev + 1) % AFFIRMATIONS.length;
    try {
      window.localStorage.setItem(KEY, String(next));
    } catch {
      /* ignore */
    }
    setIdx(next);
    setShown(true);
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 pt-3">
      <div className="overflow-hidden rounded-lg border border-leverage/30 bg-leverage/5 px-3 py-2">
        <p
          key={idx}
          className={`text-center text-xs font-bold uppercase tracking-wider text-leverage ${
            shown ? "animate-flash" : ""
          }`}
        >
          {AFFIRMATIONS[idx]}
        </p>
      </div>
    </div>
  );
}
