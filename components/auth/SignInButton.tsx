"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { safeAppCallback } from "@/lib/safe-callback";

export function SignInButton({
  callbackUrl = "/life",
  localPreview = false,
}: {
  callbackUrl?: string;
  localPreview?: boolean;
}) {
  const safeCallback = safeAppCallback(callbackUrl);
  if (localPreview) {
    return (
      <Button asChild size="lg" className="quest-button h-12 w-full bg-primary text-base text-primary-foreground hover:bg-primary/90">
        <Link href={safeCallback}>Open local preview</Link>
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="quest-button h-12 w-full bg-primary text-base text-primary-foreground hover:bg-primary/90"
      onClick={() => signIn("google", { callbackUrl: safeCallback })}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
        <path fill="currentColor" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.3Z" />
        <path fill="currentColor" opacity=".75" d="M12 22c2.7 0 5-.9 6.6-2.4L15.4 17c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
        <path fill="currentColor" opacity=".5" d="M6.4 13.8A6 6 0 0 1 6.1 12c0-.6.1-1.2.3-1.8V7.6H3.1A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.4l3.3-2.6Z" />
        <path fill="currentColor" opacity=".9" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.7 9.7 0 0 0 3.1 7.6l3.3 2.6A6 6 0 0 1 12 6.1Z" />
      </svg>
      Continue with Google
    </Button>
  );
}
