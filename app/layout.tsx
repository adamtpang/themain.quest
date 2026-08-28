import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Press_Start_2P, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { clerkConfigured } from "@/lib/auth-policy";
import { cn } from "@/lib/utils";

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const press = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press",
  display: "swap",
});

const SITE_URL = "https://themain.quest";
const TITLE = "The Main Quest: Gamify Your Life";
const DESCRIPTION =
  "The Main Quest turns your life vision into one playable command center, with focused quests, visible progress, and a private vault-backed dashboard.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "The Main Quest",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
  other: {
    "ai-summary":
      "The Main Quest is a gamified life command center that turns a long-range life vision into one binding goal, quick quests, XP, and visible progress. A public demo is available, while the owner's private dashboard is protected by Google OAuth.",
    "ai-facts":
      "One binding goal tracked as a boss fight. Today's day-score across five daily rungs. A Motion Test prevents busywork from faking progress. The private owner dashboard reads server-side life context and stores progress in Neon. Built with Next.js, TypeScript, React, Tailwind, and Clerk.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#9bd9ff",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "adam.inc",
      url: "https://adam.gives",
      sameAs: ["https://adampang.com", "https://adam.gives"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "The Main Quest",
      url: SITE_URL,
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/board/#app`,
      name: "The Main Quest public board",
      url: `${SITE_URL}/board`,
      description:
        "A free public demonstration of The Main Quest's gamified goal and quest board.",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = (
    <>
      {children}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );

  return (
    <html lang="en" className={cn(sans.variable, mono.variable, press.variable, "font-sans")}>
      <body className="font-sans antialiased">
        {clerkConfigured() ? <ClerkProvider dynamic>{content}</ClerkProvider> : content}
      </body>
    </html>
  );
}
