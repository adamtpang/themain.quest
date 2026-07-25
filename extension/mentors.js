// The greatest lives ever lived, shared by the popup and the pinned tab.
// Date-synced with themain.quest and the calendar banners: epoch 2026-07-23,
// 18 day rotation, so every surface names the same mentor on the same day.
const TMQ_MENTORS = [
  { name: "Anthony Trollope", tag: "47 novels, before breakfast", day: "Wrote 3 hours before his Post Office job, 05:30 to 08:30, watch on the desk, 250 words every 15 minutes.", move: "Put a clock on the desk and demand a countable output per block." },
  { name: "Charles Darwin", tag: "changed biology part-time", day: "Three short work blocks, about 4.5 hours total, with thinking walks on his Sandwalk in between.", move: "Cap the deep work. Walk between the blocks, that is where it resolves." },
  { name: "Benjamin Franklin", tag: "the two questions", day: "Rose at 5 and asked what good he would do that day. Asked at night what good he had done.", move: "Bookend the day with the two questions." },
  { name: "Haruki Murakami", tag: "repetition as mesmerism", day: "Wakes at 4am, writes 5 to 6 hours, runs 10k, bed at 9pm. Same sequence for decades.", move: "Do not redesign the day. Repeat it until it hypnotises you." },
  { name: "Maya Angelou", tag: "the stripped room", day: "Rented a bare hotel room, arrived 06:30, wrote on a yellow legal pad until early afternoon.", move: "One location that means only work. Strip it." },
  { name: "Ernest Hemingway", tag: "never write to empty", day: "Wrote from first light until midday, standing. Always stopped while he still knew what came next.", move: "End every block by writing the next concrete step." },
  { name: "Winston Churchill", tag: "two days in one", day: "Mandatory 1 to 2 hour nap in the afternoon, properly undressed. Then worked deep into the night.", move: "Rest is scheduled, never earned. Take it especially when behind." },
  { name: "Warren Buffett", tag: "the empty calendar", day: "A famously near-empty calendar, about 80% of the day reading and thinking.", move: "Decline one thing today. Say no to almost everything." },
  { name: "John D. Rockefeller", tag: "the ledger, every night", day: "Kept a ledger from age 16 and reviewed the numbers daily for life. Stayed calm while competitors panicked.", move: "Log the number tonight. Asks sent. Not the feeling, the number." },
  { name: "Marcus Aurelius", tag: "rehearse the hard thing", day: "Ran an empire and still wrote the Meditations to himself at night, in the field.", move: "Name the day's hardest moment before it arrives." },
  { name: "Immanuel Kant", tag: "the clockwork walk", day: "Same walk, same route, same hour, every afternoon for decades. Neighbours set their clocks by him.", move: "One thing at the same time every day, no negotiation." },
  { name: "Leonardo da Vinci", tag: "the notebook on the belt", day: "Carried a notebook everywhere and filled thousands of pages with questions and sketches.", move: "Write down the question you cannot stop thinking about." },
  { name: "Miyamoto Musashi", tag: "undefeated in 61 duels", day: "Trained relentlessly, lived austerely, wrote the Book of Five Rings alone in a cave.", move: "One deliberate block on the craft. Mastery is a duration." },
  { name: "Marie Curie", tag: "two Nobels, two sciences", day: "Long unbroken sessions in a freezing shed of a laboratory, often forgetting to eat.", move: "Give the hardest thing 25 unbroken minutes before the day gets a vote." },
  { name: "Stephen King", tag: "2,000 words, never zero", day: "2,000 words every morning without exception, same seat, same time, door closed.", move: "The floor is the whole trick. Never zero, never miss twice." },
  { name: "Ludwig van Beethoven", tag: "60 beans, then the walk", day: "Counted exactly 60 coffee beans for his cup, composed until early afternoon, then walked for hours with pencil and paper.", move: "Take paper on the walk. The ideas do not wait." },
  { name: "Viktor Frankl", tag: "meaning as fuel", day: "Survived the camps and observed that those who endured had a why.", move: "Name who today's hard thing is actually for." },
  { name: "Harriet Tubman", tag: "never lost a passenger", day: "Made around 13 trips back into slave territory to lead people out, moving at night, hunted.", move: "Take the next step scared, then the next." },
];

// 2026-07-23 = index 0 (Trollope), same epoch as the app and the calendar.
function tmqMentorIndex(date) {
  const EPOCH = Date.UTC(2026, 6, 23);
  const d = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.floor((d - EPOCH) / 86400000);
  const n = TMQ_MENTORS.length;
  return ((days % n) + n) % n;
}
