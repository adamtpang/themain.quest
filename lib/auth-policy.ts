const PRIVATE_PAGE_PREFIXES = ["/life", "/money-os"] as const;
const PRIVATE_API_PREFIXES = ["/api/life-state", "/api/life-agent", "/api/money-os-state"] as const;

export type PrivateRouteKind = "page" | "api" | null;
type AuthEnvironment = Record<string, string | undefined>;

export type UnconfiguredRouteDecision =
  | { action: "continue"; status: 200 }
  | { action: "redirect"; status: 307 }
  | { action: "reject"; status: 503 };

export function allowedEmail(environment: AuthEnvironment = process.env): string {
  return (environment.AUTH_ALLOWED_EMAIL ?? "").trim().toLowerCase();
}

export function isAllowedEmail(
  email: string | null | undefined,
  environment: AuthEnvironment = process.env,
): boolean {
  const allowed = allowedEmail(environment);
  return Boolean(allowed && email && email.trim().toLowerCase() === allowed);
}

export function anyAllowedEmail(
  emails: Array<string | null | undefined>,
  environment: AuthEnvironment = process.env,
): boolean {
  return emails.some((email) => isAllowedEmail(email, environment));
}

export function developmentAuthBypassEnabled(environment: AuthEnvironment = process.env): boolean {
  return environment.NODE_ENV !== "production" && environment.AUTH_DEV_BYPASS === "true";
}

export function clerkConfigured(environment: AuthEnvironment = process.env): boolean {
  return Boolean(
    environment.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()
      && environment.CLERK_SECRET_KEY?.trim(),
  );
}

export function privateRouteKind(pathname: string): PrivateRouteKind {
  if (PRIVATE_API_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return "api";
  }
  if (PRIVATE_PAGE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return "page";
  }
  return null;
}

export function unconfiguredRouteDecision(pathname: string): UnconfiguredRouteDecision {
  const kind = privateRouteKind(pathname);
  if (kind === "api") return { action: "reject", status: 503 };
  if (kind === "page") return { action: "redirect", status: 307 };
  return { action: "continue", status: 200 };
}
