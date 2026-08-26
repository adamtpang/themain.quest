import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export function allowedEmail(): string {
  return (process.env.AUTH_ALLOWED_EMAIL ?? "").trim().toLowerCase();
}

export function isAllowedEmail(email: string | null | undefined): boolean {
  const allowed = allowedEmail();
  return Boolean(allowed && email && email.toLowerCase() === allowed);
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/signin" },
  callbacks: {
    async signIn({ user, profile }) {
      return isAllowedEmail(user.email ?? profile?.email);
    },
    async session({ session, token }) {
      if (session.user && token.email) session.user.email = token.email;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
