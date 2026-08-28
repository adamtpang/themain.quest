import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  clerkConfigured,
  developmentAuthBypassEnabled,
  unconfiguredRouteDecision,
} from "@/lib/auth-policy";
import {
  BASELINE_CONTENT_SECURITY_POLICY,
  CLERK_CONTENT_SECURITY_POLICY,
  baselineContentSecurityPolicy,
} from "@/lib/security-headers";

const configuredClerkProxy = clerkMiddleware({
  contentSecurityPolicy: CLERK_CONTENT_SECURITY_POLICY,
});

function baselineResponse(): NextResponse {
  const response = NextResponse.next();
  response.headers.set(
    "Content-Security-Policy",
    process.env.NODE_ENV === "development"
      ? baselineContentSecurityPolicy(true)
      : BASELINE_CONTENT_SECURITY_POLICY,
  );
  return response;
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (developmentAuthBypassEnabled()) return baselineResponse();

  if (!clerkConfigured()) {
    const decision = unconfiguredRouteDecision(request.nextUrl.pathname);
    if (decision.action === "reject") {
      return NextResponse.json({ error: "Owner authentication is not configured" }, { status: 503 });
    }
    if (decision.action === "redirect") {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      signInUrl.searchParams.set("reason", "not-configured");
      return NextResponse.redirect(signInUrl);
    }
    return baselineResponse();
  }

  return configuredClerkProxy(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
