export function safeAppCallback(callbackUrl: string | undefined, fallback = "/life"): string {
  if (!callbackUrl) return fallback;
  return callbackUrl.startsWith("/")
    && !callbackUrl.startsWith("//")
    && !callbackUrl.includes("\\")
    ? callbackUrl
    : fallback;
}
