import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { developmentAuthBypassEnabled } from "@/lib/auth-options";

const PAGE_PREFIXES = ["/life", "/money-os"];
const API_PREFIXES = ["/api/life-state", "/api/money-os-state"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isPage = PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isApi && !isPage) return NextResponse.next();

  if (developmentAuthBypassEnabled()) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const allowed = (process.env.AUTH_ALLOWED_EMAIL ?? "").trim().toLowerCase();
  const authorized = Boolean(allowed && token?.email?.toLowerCase() === allowed);

  if (authorized) return NextResponse.next();

  if (isApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const signInUrl = new URL("/signin", req.url);
  signInUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    "/life/:path*",
    "/money-os/:path*",
    "/api/life-state/:path*",
    "/api/money-os-state/:path*",
  ],
};
