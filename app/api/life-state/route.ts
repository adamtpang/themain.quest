import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions, isAllowedEmail } from "@/lib/auth-options";
import {
  getLifeCommandData,
  readSharedState,
  saveSharedState,
  todayKey,
} from "@/lib/life-command";

export const dynamic = "force-dynamic";

async function authorized(): Promise<boolean> {
  if (process.env.NODE_ENV !== "production" && process.env.AUTH_DEV_BYPASS === "true") return true;
  const session = await getServerSession(authOptions);
  return isAllowedEmail(session?.user?.email);
}

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getLifeCommandData());
}

export async function POST(req: NextRequest) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    type?: "toggleQuest" | "syncSnapshot";
    id?: string;
    completed?: boolean;
  };
  const current = await readSharedState();
  const state = {
    ...current,
    completedQuestIds: [...current.completedQuestIds],
    completedAtById: { ...current.completedAtById },
    completedXpById: { ...current.completedXpById },
    daily: { ...current.daily },
  };

  if (body.type === "syncSnapshot") {
    const snapshot = await getLifeCommandData(state);
    state.snapshot = snapshot;
    await saveSharedState(state);
    return NextResponse.json({ ok: true, data: snapshot });
  }

  if (body.type !== "toggleQuest" || !body.id) {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const before = await getLifeCommandData(state);
  const quest = before.quests.find((item) => item.id === body.id);
  if (!quest) return NextResponse.json({ error: "Quest not found" }, { status: 404 });

  const completed = new Set(state.completedQuestIds);
  const nextCompleted = body.completed ?? !completed.has(body.id);
  if (nextCompleted) {
    completed.add(body.id);
    state.completedAtById[body.id] = new Date().toISOString();
    state.completedXpById[body.id] = quest.xp;
  } else {
    completed.delete(body.id);
    delete state.completedAtById[body.id];
    delete state.completedXpById[body.id];
  }
  state.completedQuestIds = [...completed];

  const after = await getLifeCommandData(state);
  state.daily[todayKey()] = {
    score: after.todayScore,
    xp: after.xp,
    quests: after.completedToday,
  };
  await saveSharedState(state);

  return NextResponse.json({ ok: true, data: await getLifeCommandData(state) });
}
