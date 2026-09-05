import { NextResponse } from "next/server";
import { loadLifeContext } from "@/lib/life-context-sources";
import { privateApiDenial } from "@/lib/private-access";

export const dynamic = "force-dynamic";

// Owner-only. Returns the same brief `npm run life:context` prints, so the
// private command center can hand it to summon.guide without a terminal.
export async function GET() {
  const denial = await privateApiDenial();
  if (denial) return denial;
  const result = await loadLifeContext();
  return NextResponse.json(result);
}
