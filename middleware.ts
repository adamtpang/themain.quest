import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "money_os_auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/money-os") || pathname.startsWith("/money-os/login")) {
    return NextResponse.next();
  }

  const secret = process.env.MONEY_OS_PASSWORD;
  const cookie = req.cookies.get(COOKIE_NAME)?.value;

  if (secret && cookie === secret) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/money-os/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/money-os/:path*"],
};
