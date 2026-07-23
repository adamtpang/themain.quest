// The greatest lives ever lived, and how they actually ran their days. One
// mentor per day on an 18 day rotation, picked deterministically from the date
// so the app, the calendar banners, and the extension all agree on who is
// teaching today. Epoch is 2026-07-23, the day the calendar rotation started.

export type Mentor = {
  name: string;
  tag: string;
  day: string; // the real routine
  move: string; // the practice to steal today
};

export const MENTORS: Mentor[] = [
  {
    name: "Anthony Trollope",
    tag: "47 novels, before breakfast",
    day: "Wrote 3 hours before his Post Office job, 05:30 to 08:30, watch on the desk, 250 words every 15 minutes. If he finished a novel mid-session he started the next one immediately.",
    move: "Put a clock on the desk and demand a countable output per block. Volume beats inspiration.",
  },
  {
    name: "Charles Darwin",
    tag: "changed biology part-time",
    day: "Three short work blocks (08:00, 10:30, late afternoon), about 4.5 hours total, with thinking walks on his Sandwalk in between.",
    move: "Cap the deep work. Walk between the blocks, that is where it resolves.",
  },
  {
    name: "Benjamin Franklin",
    tag: "the two questions",
    day: "Rose at 5 and asked \"What good shall I do this day?\" Worked 8 to 12 and 2 to 6. Asked at night \"What good have I done today?\" Scored himself on 13 virtues, daily.",
    move: "You already run the evening question. Run the morning one too.",
  },
  {
    name: "Haruki Murakami",
    tag: "repetition as mesmerism",
    day: "Wakes at 4am, writes 5 to 6 hours, then runs 10k or swims 1500m, reads, music, bed at 9pm. Same sequence for decades.",
    move: "Do not redesign the day. Repeat it until it hypnotises you.",
  },
  {
    name: "Maya Angelou",
    tag: "the stripped room",
    day: "Rented a bare hotel room and had the pictures taken off the walls. Arrived 06:30, wrote lying across the bed on a yellow legal pad until early afternoon.",
    move: "One location that means only work. Strip it. Your brain will learn the signal.",
  },
  {
    name: "Ernest Hemingway",
    tag: "never write to empty",
    day: "Wrote from first light until midday, standing. Always stopped at a point where he still had juice and knew what came next.",
    move: "End every block by writing the next concrete step, so tomorrow has no blank page.",
  },
  {
    name: "Winston Churchill",
    tag: "two days in one",
    day: "Worked from bed dictating letters. Mandatory 1 to 2 hour nap in the afternoon, properly undressed. Then worked deep into the night. Ran a war on it.",
    move: "Rest is scheduled, never earned. Take it especially when you feel behind.",
  },
  {
    name: "Warren Buffett",
    tag: "the empty calendar",
    day: "A famously near-empty calendar, about 80% of the day reading and thinking, almost no meetings.",
    move: "Decline one thing today. Very successful people say no to almost everything.",
  },
  {
    name: "John D. Rockefeller",
    tag: "the ledger, every night",
    day: "Kept a ledger from age 16 and reviewed the numbers daily for life. Ate simply, napped, stayed deliberately calm while competitors panicked.",
    move: "Log the number tonight. Asks sent. Not the feeling, the number.",
  },
  {
    name: "Marcus Aurelius",
    tag: "rehearse the hard thing",
    day: "Ran an empire and still wrote the Meditations to himself at night, in the field. Each morning he rehearsed the day's difficulties so none landed as a surprise.",
    move: "Name the day's hardest moment before it arrives. You control the response, nothing else.",
  },
  {
    name: "Immanuel Kant",
    tag: "the clockwork walk",
    day: "Same walk, same route, same hour, every afternoon for decades. Neighbours reportedly set their clocks by him.",
    move: "One thing at the same time every day, no negotiation. Regularity makes the rest cheap.",
  },
  {
    name: "Leonardo da Vinci",
    tag: "the notebook on the belt",
    day: "Carried a notebook everywhere and filled thousands of pages with questions, sketches and observations, moving freely between anatomy, engineering and painting.",
    move: "Write down the question you cannot stop thinking about. Curiosity across fields compounds.",
  },
  {
    name: "Miyamoto Musashi",
    tag: "undefeated in 61 duels",
    day: "Trained relentlessly, lived austerely, owned almost nothing, and wrote the Book of Five Rings alone in a cave near the end.",
    move: "One deliberate block on the craft. A thousand days to forge, ten thousand to refine.",
  },
  {
    name: "Marie Curie",
    tag: "two Nobels, two sciences",
    day: "Long unbroken sessions in a freezing shed of a laboratory, often forgetting to eat.",
    move: "Give the hardest thing 25 unbroken minutes before the day gets a vote.",
  },
  {
    name: "Stephen King",
    tag: "2,000 words, never zero",
    day: "2,000 words every morning without exception, same seat, same time, door closed, music on. Afternoons for naps and life.",
    move: "You run this as Pangaea 300 words. The floor is the whole trick. Never miss twice.",
  },
  {
    name: "Ludwig van Beethoven",
    tag: "60 beans, then the walk",
    day: "Rose at dawn and counted exactly 60 coffee beans for his cup. Composed until early afternoon, then walked for hours with pencil and paper in his pocket.",
    move: "Take paper on the walk. The ideas arrive while moving and they do not wait.",
  },
  {
    name: "Viktor Frankl",
    tag: "meaning as fuel",
    day: "Survived the camps and observed that those who endured had a why. Rebuilt his life's work from memory afterwards.",
    move: "Name who today's hard thing is actually for. Meaning is the strongest fuel there is.",
  },
  {
    name: "Harriet Tubman",
    tag: "never lost a passenger",
    day: "Made around 13 trips back into slave territory to lead people out, moving at night, on foot, hunted.",
    move: "Take the next step scared, then the next. Deciding is the hard part, after that it is just steps.",
  },
];

// The calendar rotation started on this date with Trollope at index 0.
const EPOCH = Date.UTC(2026, 6, 23); // 2026-07-23
const DAY_MS = 86400000;

export function mentorIndexFor(date: Date): number {
  const d = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.floor((d - EPOCH) / DAY_MS);
  const n = MENTORS.length;
  return ((days % n) + n) % n; // safe for dates before the epoch too
}

export function mentorFor(date: Date): Mentor {
  return MENTORS[mentorIndexFor(date)];
}
