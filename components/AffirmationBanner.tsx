"use client";

import { useEffect, useState } from "react";
import { AFFIRMATIONS } from "@/lib/affirmations";

const KEY = "tmq.aff";

export function AffirmationBanner() {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(false);

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
    <div className="mx-auto max-w-md px-3 pt-3">
      <div className="panel bg-bubblegum px-3 py-2">
        <p className="font-pixel text-[7px] uppercase text-ink/70">today you are</p>
        <p
          key={idx}
          className={`text-lg leading-tight text-ink ${shown ? "animate-flash" : ""}`}
        >
          {AFFIRMATIONS[idx]}
        </p>
      </div>
    </div>
  );
}
