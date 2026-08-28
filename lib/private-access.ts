import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import {
  anyAllowedEmail,
  clerkConfigured,
  developmentAuthBypassEnabled,
} from "@/lib/auth-policy";

export type PrivateAccessStatus = "allowed" | "unauthenticated" | "forbidden" | "unconfigured";

export async function getPrivateAccessStatus(): Promise<PrivateAccessStatus> {
  if (developmentAuthBypassEnabled()) return "allowed";
  if (!clerkConfigured()) return "unconfigured";

  const session = await auth();
  if (!session.isAuthenticated) return "unauthenticated";

  const user = await currentUser();
  if (!user) return "unauthenticated";
  const allowed = anyAllowedEmail(user.emailAddresses.map((entry) => entry.emailAddress));
  return allowed ? "allowed" : "forbidden";
}

export async function requirePrivatePageAccess(callbackUrl: string): Promise<"clerk" | "dev-bypass"> {
  if (developmentAuthBypassEnabled()) return "dev-bypass";

  const status = await getPrivateAccessStatus();
  if (status === "allowed") return "clerk";

  const params = new URLSearchParams({ callbackUrl });
  if (status === "forbidden") params.set("reason", "not-allowed");
  if (status === "unconfigured") params.set("reason", "not-configured");
  redirect(`/signin?${params.toString()}`);
}

export async function privateApiDenial(): Promise<NextResponse | null> {
  const status = await getPrivateAccessStatus();
  if (status === "allowed") return null;
  if (status === "forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (status === "unconfigured") {
    return NextResponse.json({ error: "Owner authentication is not configured" }, { status: 503 });
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
