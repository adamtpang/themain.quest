import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InfoSection,
  PublicInfoPage,
} from "@/components/site/PublicInfoPage";

export const metadata: Metadata = {
  title: "Contact The Main Quest Operator",
  description:
    "Use the operator's public contact site to discuss The Main Quest while keeping private owner data and access requests out of public pages.",
  alternates: { canonical: "https://themain.quest/contact" },
};

export default function ContactPage() {
  return (
    <PublicInfoPage
      eyebrow="Contact"
      title="Contact the operator through a public channel."
      introduction="The Main Quest does not publish a private email address or accept access requests through an embedded form. The operator's public site is the appropriate starting point for product questions, collaboration ideas, or adaptation discussions."
    >
      <InfoSection title="Product and collaboration questions">
        <p>
          Contact Adam through the public channels linked from adampang.com. Include the phrase The Main Quest and a concise description of what you want to discuss, but do not include passwords, financial records, medical information, or other sensitive life data.
        </p>
        <Button asChild className="quest-button mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="https://adampang.com">
            Contact through adampang.com <ArrowRight />
          </Link>
        </Button>
      </InfoSection>
      <InfoSection title="Access and support boundary">
        <p>
          Private Life and Money OS access is limited to the approved owner identity. Contacting the operator does not grant account access, and the public Board remains the correct place for visitors to try the product loop without sharing private context.
        </p>
      </InfoSection>
    </PublicInfoPage>
  );
}
