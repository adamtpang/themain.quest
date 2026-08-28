import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Press_Start_2P, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
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
    canonical: "/",
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
      "One binding goal tracked as a boss fight. Today's day-score across five daily rungs. A Motion Test prevents busywork from faking progress. The private owner dashboard reads server-side life context and stores progress in Neon. Built with Next.js, TypeScript, React, Tailwind, and Auth.js.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#9bd9ff",
};

// Structured data for bots: an Organization node (adam.inc) publishing a
// SoftwareApplication node (this app), with absolute @id/url on both so
// crawlers can ground the entity instead of guessing from prose alone.
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
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: "The Main Quest",
      url: SITE_URL,
      description: DESCRIPTION,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "29",
        priceCurrency: "USD",
        url: "https://buy.stripe.com/9B69ATgvw68B9As0m5aMU0D",
      },
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
  return (
    <html lang="en" className={cn(sans.variable, mono.variable, press.variable, "font-sans")}>
      <body className="font-sans antialiased">
        {children}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
