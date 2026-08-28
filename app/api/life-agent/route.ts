import { NextRequest, NextResponse } from "next/server";
import { getLifeCommandData, LifeStateUnavailableError, readSharedState, updateSharedState } from "@/lib/life-command";
import { recordChallengeAdjustment } from "@/lib/life-state-actions";
import {
  getLifeAgentJobStatus,
  getLifeAgentCapability,
  localLifeAgentEnabled,
  makeAdaptiveMove,
  startProcessJob,
} from "@/lib/local-life-agent";
import { localRequest, trustedLocalMutation } from "@/lib/local-request-security";
import { privateApiDenial } from "@/lib/private-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 90;

export async function GET(request: NextRequest) {
  const denial = await privateApiDenial();
  if (denial) return denial;
  if (!localRequest(request) || !localLifeAgentEnabled()) {
    return NextResponse.json(getLifeAgentJobStatus());
  }
  return NextResponse.json({
    ...getLifeAgentJobStatus(),
    capability: getLifeAgentCapability(),
  });
}

export async function POST(request: NextRequest) {
  const denial = await privateApiDenial();
  if (denial) return denial;
  if (!trustedLocalMutation(request, getLifeAgentCapability()) || !localLifeAgentEnabled()) {
    return NextResponse.json({ error: "The agent bridge runs only on the owner's local machine" }, { status: 503 });
  }

  const body = await request.json() as { action?: "process" | "shrink"; questId?: string };
  if (body.action === "process") {
    return NextResponse.json(startProcessJob(), { status: 202 });
  }

  if (body.action === "shrink" && body.questId) {
    const state = await readSharedState();
    const data = await getLifeCommandData(state);
    const quest = data.quests.find((item) => item.id === body.questId && !item.completed);
    if (!quest) return NextResponse.json({ error: "Quest not found" }, { status: 404 });

    try {
      const move = await makeAdaptiveMove(quest, state);
      const saved = await updateSharedState(async (current) => {
        const currentData = await getLifeCommandData(current);
        const currentQuest = currentData.quests.find((item) => item.id === body.questId && !item.completed);
        if (!currentQuest) throw new Error("Quest not found");
        return recordChallengeAdjustment(current, currentQuest, move.action, "ai", 2);
      });
      return NextResponse.json({ ok: true, move, data: await getLifeCommandData(saved) });
    } catch (cause) {
      const status = cause instanceof LifeStateUnavailableError ? 503 : 502;
      return NextResponse.json({ error: cause instanceof Error ? cause.message : "The quest could not be reduced" }, { status });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
