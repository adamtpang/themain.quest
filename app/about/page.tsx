import type { Metadata } from "next";
import {
  InfoSection,
  PublicInfoPage,
} from "@/components/site/PublicInfoPage";

export const metadata: Metadata = {
  title: "About The Main Quest Life Command Center",
  description:
    "Learn what The Main Quest does, who operates it, how its public demo works, and where its private owner tools begin.",
  alternates: { canonical: "https://themain.quest/about" },
};

export default function AboutPage() {
  return (
    <PublicInfoPage
      eyebrow="About"
      title="A life plan that ends in one playable move."
      introduction="The Main Quest is a gamified life command center operated by adam.inc. The public site explains the method and offers a free browser-based Board demo, while private owner routes remain protected behind an approved identity."
    >
      <InfoSection title="What the product does">
        <p>
          The Main Quest connects long-range direction to a day-scoped outbox and then reveals one next quest. The runner defines what done means, names one physical starting action, offers bounded timeboxes, and records visible progress after the real-world action is complete.
        </p>
      </InfoSection>
      <InfoSection title="Who operates the site">
        <p>
          adam.inc operates The Main Quest and publishes the public experience at themain.quest. Public information about the operator is available through adampang.com and adam.gives, without exposing the private notes, finances, calendar, or task data that power the owner dashboard.
        </p>
      </InfoSection>
      <InfoSection title="Where the boundary sits">
        <p>
          The public Board stores its demonstration state in the visitor's browser. The private Life and Money OS routes use an owner-only Google identity boundary, and local vault content is parsed on the server so raw private source files never become public page content.
        </p>
      </InfoSection>
    </PublicInfoPage>
  );
}
