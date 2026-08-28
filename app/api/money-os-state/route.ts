import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { trustedSameOriginJsonMutation } from "@/lib/request-security";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  const rows = await sql`
    SELECT key, value
    FROM money_os_state
    WHERE key IN ('checklist', 'debt')
  `;
  let debt: number | null = null;
  let completedCount = 0;
  for (const row of rows as { key: string; value: unknown }[]) {
    if (row.key === "debt" && typeof row.value === "number" && Number.isFinite(row.value)) {
      debt = Math.max(0, row.value);
    }
    if (row.key === "checklist" && row.value && typeof row.value === "object" && !Array.isArray(row.value)) {
      completedCount = Object.values(row.value as Record<string, unknown>).filter((value) => value === true).length;
    }
  }
  return NextResponse.json(
    { debt, completedCount },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(req: NextRequest) {
  if (!trustedSameOriginJsonMutation(req)) {
    return NextResponse.json({ error: "Untrusted mutation request" }, { status: 403 });
  }
  let body: { key?: string; value?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { key, value } = body;
  if (key !== "debt" || typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1_000_000_000_000) {
    return NextResponse.json({ error: "unknown key" }, { status: 400 });
  }
  await sql`
    INSERT INTO money_os_state (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(value)}::jsonb, updated_at = now()
  `;
  return NextResponse.json({ ok: true });
}
