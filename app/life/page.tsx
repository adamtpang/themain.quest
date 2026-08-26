import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LifeCommandCenter } from "@/components/life/LifeCommandCenter";
import { authOptions, isAllowedEmail } from "@/lib/auth-options";
import { getLifeCommandData } from "@/lib/life-command";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Life Command Center | The Main Quest",
  robots: { index: false, follow: false },
};

export default async function LifePage() {
  const bypass = process.env.NODE_ENV !== "production" && process.env.AUTH_DEV_BYPASS === "true";
  if (!bypass) {
    const session = await getServerSession(authOptions);
    if (!isAllowedEmail(session?.user?.email)) redirect("/signin?callbackUrl=/life");
  }

  return <LifeCommandCenter initialData={await getLifeCommandData()} />;
}
