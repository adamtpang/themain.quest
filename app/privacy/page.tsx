import type { Metadata } from "next";
import {
  InfoSection,
  PublicInfoPage,
} from "@/components/site/PublicInfoPage";

export const metadata: Metadata = {
  title: "The Main Quest Privacy Policy",
  description:
    "Read how The Main Quest separates public demo data from owner-only identity, progress, and local vault context.",
  alternates: { canonical: "https://themain.quest/privacy" },
};

export default function PrivacyPage() {
  return (
    <PublicInfoPage
      eyebrow="Privacy"
      title="Privacy is a product boundary, not a promise in small print."
      introduction="The Main Quest separates a free public demo from private owner tools. This policy explains the data used by each surface, the service providers involved, and the controls that keep raw private life context out of public pages and client bundles."
    >
      <InfoSection title="Public pages and the Board demo">
        <p>
          Public pages can receive standard request information from the hosting platform, such as an IP address, browser type, requested path, and timing data. The public Board keeps its demonstration state in local browser storage and does not require a Main Quest account.
        </p>
      </InfoSection>
      <InfoSection title="Private owner routes">
        <p>
          Private routes use Google sign-in to verify a single approved email identity. The application can store parsed quest snapshots, completion timestamps, XP, skip reasons, and challenge adjustments in a protected database so owner progress survives browser refreshes and restarts.
        </p>
        <p>
          Local development can read an Obsidian outbox on the server. The browser receives only the parsed quest fields needed for the current interface, and public HTML does not include raw vault notes, financial records, calendar events, or complete task files.
        </p>
      </InfoSection>
      <InfoSection title="Service providers and sharing">
        <p>
          Vercel provides hosting and request delivery, Google provides owner authentication, and Neon provides protected progress storage. The Main Quest does not sell private life data or use public pages to disclose the owner's vault, finances, calendar, or day plan.
        </p>
      </InfoSection>
      <InfoSection title="Choices and contact">
        <p>
          Visitors can clear the public Board's local browser storage through their browser controls. Questions about this policy can be directed through the public operator contact path, and private account access remains restricted even when a visitor makes contact.
        </p>
      </InfoSection>
    </PublicInfoPage>
  );
}
