import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export function trustedSameOriginJsonMutation(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  const fetchSite = request.headers.get("sec-fetch-site");

  let parsedOrigin: URL | null = null;
  try {
    parsedOrigin = origin ? new URL(origin) : null;
  } catch {
    parsedOrigin = null;
  }

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",", 1)[0]?.trim();
  const requestHost = forwardedHost || request.headers.get("host") || request.nextUrl.host;
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",", 1)[0]?.trim();
  const requestProtocol = forwardedProtocol || request.nextUrl.protocol.replace(/:$/, "");
  const exactOrigin = parsedOrigin
    ? parsedOrigin.host === requestHost && parsedOrigin.protocol === `${requestProtocol}:`
    : false;

  return contentType === "application/json"
    && exactOrigin
    && (!fetchSite || fetchSite === "same-origin" || fetchSite === "none");
}

export function secretHeaderMatches(supplied: string | null, expected: string): boolean {
  const suppliedBytes = Buffer.from(supplied ?? "");
  const expectedBytes = Buffer.from(expected);
  return expectedBytes.length > 0
    && suppliedBytes.length === expectedBytes.length
    && timingSafeEqual(suppliedBytes, expectedBytes);
}
