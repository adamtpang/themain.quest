import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";

const press = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press",
  display: "swap",
});

const vt = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "the main quest",
  description: "Your one life, gamified. Days are XP. Close the boss. Welcome to Ooo.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#9bd9ff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${press.variable} ${vt.variable}`}>
      <body className="font-vt antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
