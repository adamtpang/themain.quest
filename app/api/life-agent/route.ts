import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions, developmentAuthBypassEnabled, isAllowedEmail } from "@/lib/auth-options";
import { getLifeCommandData, LifeStateUnavailableError, readSharedState, updateSharedState } from "@/lib/life-command";
import { recordChallengeAdjustment } from "@/lib/life-state-actions";
import {
  getLifeAgentJobStatus,
  getLifeAgentCapability,
  localLifeAgentEnabled,
  makeAdaptiveMove,
  startProcessJob,
} from "@/lib/local-life-agent";
import { secretHeaderMatches, trustedSameOriginJsonMutation } from "@/lib/request-security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 90;

async function authorized(): Promise<boolean> {
  if (developmentAuthBypassEnabled()) return true;
  const session = await getServerSession(authOptions);
  return isAllowedEmail(session?.user?.email);
}

function localRequest(request: NextRequest): boolean {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",", 1)[0]?.trim();
  const host = forwardedHost || request.headers.get("host") || request.nextUrl.host;
  try {
    return ["localhost", "127.0.0.1", "::1"].includes(new URL(`http://${host}`).hostname);
  } catch {
    return false;
  }
}

export function trustedLocalMutation(request: NextRequest, expectedCapability: string): boolean {
  return localRequest(request)
    && trustedSameOriginJsonMutation(request)
    && secretHeaderMatches(request.headers.get("x-life-agent-capability"), expectedCapability);
}

export async function GET(request: NextRequest) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!localRequest(request) || !localLifeAgentEnabled()) {
    return NextResponse.json(getLifeAgentJobStatus());
  }
  return NextResponse.json({
    ...getLifeAgentJobStatus(),
    capability: getLifeAgentCapability(),
  });
}

export async function POST(request: NextRequest) {
  if (!(await authorized())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
