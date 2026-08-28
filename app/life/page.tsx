import type { Metadata } from "next";
import { LifeCommandCenter } from "@/components/life/LifeCommandCenter";
import { getLifeCommandData } from "@/lib/life-command";
import { requirePrivatePageAccess } from "@/lib/private-access";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Life Command Center | The Main Quest",
  robots: { index: false, follow: false },
};

export default async function LifePage() {
  const authMode = await requirePrivatePageAccess("/life");
  return <LifeCommandCenter initialData={await getLifeCommandData()} authMode={authMode} />;
}
