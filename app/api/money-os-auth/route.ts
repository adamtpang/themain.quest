import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Password sign-in was replaced by Google OAuth." },
    { status: 410 }
  );
}
