import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "money_os_auth";

export async function POST(req: NextRequest) {
  const { password, next } = await req.json();
  const secret = process.env.MONEY_OS_PASSWORD;

  if (!secret) {
    return NextResponse.json(
      { error: "MONEY_OS_PASSWORD is not set on the server" },
      { status: 500 }
    );
  }

  if (password !== secret) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, next: next || "/money-os" });
  res.cookies.set(COOKIE_NAME, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
