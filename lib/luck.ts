// Luck, from Barabasi's five laws of success (The Formula). The core finding:
// success is a COLLECTIVE phenomenon, not an individual one. Performance is what
// you do. Success is how many people saw it. The rest of this app measures
// performance only, which is exactly how you end up as Al Diaz instead of
// Basquiat: same talent, same city, one of them networked.
//
// So luck surface is a PRODUCT, not a sum. Either factor at zero zeroes it out.

export type LuckState = {
  weekOf: string; // Monday, YYYY-MM-DD
  shots: number; // attempts launched (law 5: more shots, more breakthroughs)
  touches: number; // new people who saw the work (law 1: networks drive success)
};

export function mondayOf(d: Date = new Date()): string {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - dow);
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${x.getFullYear()}-${m}-${day}`;
}

export function freshLuck(weekOf: string): LuckState {
  return { weekOf, shots: 0, touches: 0 };
}

// The whole thesis in one line: work in obscurity multiplies out to nothing.
export function luckSurface(l: LuckState): number {
  return Math.max(0, l.shots) * Math.max(0, l.touches);
}

export function luckNudge(l: LuckState): string {
  if (l.shots === 0 && l.touches === 0) {
    return "Zero surface this week. One shot, one new person. That is the whole ask.";
  }
  if (l.touches === 0) {
    return "You are Al Diaz right now. Great work nobody saw is worth zero. Show one new person.";
  }
  if (l.shots === 0) {
    return "You have reach and nothing to show. Launch one shot this week.";
  }
  return l.shots > l.touches
    ? "Shots are ahead of reach. Add people, not output."
    : "Reach is ahead of shots. Ship something for them to see.";
}

export type Law = { n: number; title: string; lesson: string; move: string };

export const LAWS: Law[] = [
  {
    n: 1,
    title: "Networks drive success when performance cannot be measured",
    lesson:
      "Basquiat and Al Diaz had the same talent and the same city. Basquiat relentlessly befriended the established artists. One painting later sold for $110 million, the other is a footnote.",
    move: "Put your work in front of one person who already has standing.",
  },
  {
    n: 2,
    title: "Performance is bounded, success is unbounded",
    lesson:
      "Usain Bolt is about 1% faster than the man who loses, and takes hundreds of times the reward. Wine judges scored the same wine 80, 90 and 96 in one sitting. The gap at the top is tiny, the payoff is not.",
    move: "Stop being intimidated. If you are near the top you are closer than it looks.",
  },
  {
    n: 3,
    title: "Previous success x fitness = future success",
    lesson:
      "Rowling's crime novel sold 500 copies as Robert Galbraith. The day her name came out, sales rose hundreds of thousands of percent. Same book. But crowds rarely get behind the mediocre, so fitness still has to be real.",
    move: "Borrow credibility. Name your first real client, then let it compound.",
  },
  {
    n: 4,
    title: "Teams do the work, one person gets the credit",
    lesson:
      "The Bulls won six titles, Jordan got the credit. Jony Ive designed the iPhone, Jobs got the credit. Start under someone with a reputation, absorb it, then branch out under your own name.",
    move: "Put your name on the thing you shipped today.",
  },
  {
    n: 5,
    title: "With persistence, success can come at any time",
    lesson:
      "S = Qr. Your skill factor Q stays roughly constant, r is the value of the idea, and you cannot know r in advance. Age does not matter. The people who break through are the ones who took more shots.",
    move: "Take another shot. The only losing move is running out of attempts.",
  },
];
