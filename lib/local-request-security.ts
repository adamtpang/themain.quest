import type { NextRequest } from "next/server";
import { secretHeaderMatches, trustedSameOriginJsonMutation } from "@/lib/request-security";

export function localRequest(request: NextRequest): boolean {
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
