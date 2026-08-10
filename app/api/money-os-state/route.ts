import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  const rows = await sql`SELECT key, value FROM money_os_state`;
  const state: Record<string, unknown> = {};
  for (const row of rows as { key: string; value: unknown }[]) {
    state[row.key] = row.value;
  }
  return NextResponse.json(state);
}

export async function POST(req: NextRequest) {
  const { key, value } = await req.json();
  if (key !== "checklist" && key !== "debt") {
    return NextResponse.json({ error: "unknown key" }, { status: 400 });
  }
  await sql`
    INSERT INTO money_os_state (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(value)}::jsonb, updated_at = now()
  `;
  return NextResponse.json({ ok: true });
}
