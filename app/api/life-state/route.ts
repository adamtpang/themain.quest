import { NextRequest, NextResponse } from "next/server";
import { developmentAuthBypassEnabled } from "@/lib/auth-policy";
import {
  getLifeCommandData,
  LifeStateConflictError,
  LifeStateUnavailableError,
  todayKey,
  updateSharedState,
} from "@/lib/life-command";
import {
  recordChallengeAdjustment,
  recordQuestSkip,
  resetSkippedQuests,
  toggleQuestCompletion,
} from "@/lib/life-state-actions";
import { getLifeAgentCapability } from "@/lib/local-life-agent";
import { privateApiDenial } from "@/lib/private-access";
import { secretHeaderMatches, trustedSameOriginJsonMutation } from "@/lib/request-security";

export const dynamic = "force-dynamic";

class QuestNotFoundError extends Error {}

export async function GET() {
  const denial = await privateApiDenial();
  if (denial) return denial;
  try {
    return NextResponse.json(await getLifeCommandData());
  } catch (cause) {
    if (cause instanceof LifeStateUnavailableError) {
      return NextResponse.json({ error: "Life progress storage is temporarily unavailable" }, { status: 503 });
    }
    throw cause;
  }
}

export async function POST(req: NextRequest) {
  const denial = await privateApiDenial();
  if (denial) return denial;
  const trustedRequest = trustedSameOriginJsonMutation(req)
    && (!developmentAuthBypassEnabled()
      || secretHeaderMatches(req.headers.get("x-life-agent-capability"), getLifeAgentCapability()));
  if (!trustedRequest) return NextResponse.json({ error: "Untrusted mutation request" }, { status: 403 });

  let body: {
    type?: "toggleQuest" | "syncSnapshot" | "skipQuest" | "resetSkips" | "recordAdjustment";
    id?: string;
    completed?: boolean;
    reason?: string;
    action?: string;
    source?: "built-in" | "ai";
    timeboxMinutes?: number;
    elapsedSeconds?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    if (body.type === "syncSnapshot") {
      const saved = await updateSharedState(async (current) => {
        const state = resetSkippedQuests(current);
        state.snapshot = await getLifeCommandData(state);
        return state;
      });
      return NextResponse.json({ ok: true, data: await getLifeCommandData(saved) });
    }

    if (body.type === "resetSkips") {
      const saved = await updateSharedState(resetSkippedQuests);
      return NextResponse.json({ ok: true, data: await getLifeCommandData(saved) });
    }

    if ((body.type === "skipQuest" || body.type === "recordAdjustment") && !body.id) {
      return NextResponse.json({ error: "Quest is required" }, { status: 400 });
    }

    if (body.type === "skipQuest") {
      const reason = body.reason?.trim().slice(0, 500);
      if (!reason) return NextResponse.json({ error: "Tell the coach why this quest is wrong right now" }, { status: 400 });
      const saved = await updateSharedState(async (current) => {
        const before = await getLifeCommandData(current);
        const quest = before.quests.find((item) => item.id === body.id);
        if (!quest) throw new QuestNotFoundError();
        return recordQuestSkip(current, quest, reason);
      });
      return NextResponse.json({ ok: true, data: await getLifeCommandData(saved) });
    }

    if (body.type === "recordAdjustment") {
      const action = body.action?.trim().slice(0, 500);
      if (!action) return NextResponse.json({ error: "Adjusted action is required" }, { status: 400 });
      const saved = await updateSharedState(async (current) => {
        const before = await getLifeCommandData(current);
        const quest = before.quests.find((item) => item.id === body.id);
        if (!quest) throw new QuestNotFoundError();
        return recordChallengeAdjustment(
          current,
          quest,
          action,
          body.source === "ai" ? "ai" : "built-in",
          body.timeboxMinutes,
        );
      });
      return NextResponse.json({ ok: true, data: await getLifeCommandData(saved) });
    }

    if (body.type !== "toggleQuest" || !body.id) {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const saved = await updateSharedState(async (current) => {
      const before = await getLifeCommandData(current);
      const quest = before.quests.find((item) => item.id === body.id);
      if (!quest) throw new QuestNotFoundError();
      const state = toggleQuestCompletion(current, quest, body.completed, {
        elapsedSeconds: body.elapsedSeconds,
        timeboxMinutes: body.timeboxMinutes,
      });

      const after = await getLifeCommandData(state);
      state.daily[todayKey()] = {
        score: after.todayScore,
        xp: after.xp,
        quests: after.completedToday,
      };
      return state;
    });

    return NextResponse.json({ ok: true, data: await getLifeCommandData(saved) });
  } catch (cause) {
    if (cause instanceof QuestNotFoundError) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }
    if (cause instanceof LifeStateUnavailableError) {
      return NextResponse.json({ error: "Life progress storage is temporarily unavailable" }, { status: 503 });
    }
    if (cause instanceof LifeStateConflictError) {
      return NextResponse.json({ error: "Life progress changed in another request. Try again." }, { status: 409 });
    }
    throw cause;
  }
}
