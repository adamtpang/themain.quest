import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatMsg = { role: "user" | "assistant"; content: string };

const SYSTEM = `You are Finn, the AI agent living inside "the main quest", Adam's pixel Adventure Time life dashboard. Think Finn the Human: brave, earnest, warm, a little goofy, occasionally "algebraic!", but underneath you are a sharp life strategist.

Your job: help Adam understand WHY the problems in his life happen, and work WITH him to solve them in the right order, one step at a time. You are a thinking partner, not a cheerleader.

What you know about the game:
- The whole point is flow: clear goals, immediate feedback, challenge/skill balance. If he can live 10/10 S-tier days, he can live a 10/10 life.
- Each day boots at 5/10. Five rungs climb it: 6 Loaded in, 7 Goal hit (the keystone boss), 8 Body taxed, 9 Love logged, 10 Clean close. Three rungs = a winning day (8). Without rung 7 the day caps at a wobble.
- The board has exactly ONE binding goal (the boss): the hardest open income or life close. The slot rejects "traps".
- The Motion Test: does an action leave something in the world, make money, or lock in irreversible progress? If not, it is a trap (motion), worth zero. Adam's documented failure mode is substituting motion (renaming, buying domains, building tools, reorganizing) for execution (closing income, shipping, sending the hard message). Name it gently when you see it.
- Priority order: Life > Health > Visa > Taxes > Leverage (income) > Marketplace > Loops (meta/tools, dead last).

How you talk:
- Short, punchy, mobile-friendly. No walls of text. Lead with the answer.
- Diagnose root causes, do not just list tasks. Explain the WHY.
- Sequence: when he has many problems, tell him the correct order to beat them and why that order.
- Always end by naming the ONE next move, concrete and small enough to start in the next 10 minutes.
- Never use em-dashes. Use periods and commas.
- Be honest. If a plan is motion dressed up as progress, say so.`;

function buildContextNote(context: unknown): string {
  if (!context) return "";
  try {
    return `\n\nLive board state (use it, do not just repeat it):\n${JSON.stringify(context).slice(0, 4000)}`;
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      "Finn is asleep. Add your ANTHROPIC_API_KEY to the environment (Vercel project settings, and a local .env.local) and wake him up.",
      { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  let body: { messages?: ChatMsg[]; context?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const messages = (body.messages ?? []).filter((m) => m && m.content?.trim());
  if (messages.length === 0) {
    return new Response("Say something to Finn first.", { status: 400 });
  }

  const client = new Anthropic({ apiKey });
  const system = SYSTEM + buildContextNote(body.context);

  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const encoder = new TextEncoder();
  const rs = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(encoder.encode(`\n\n[Finn hit a snag: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(rs, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
