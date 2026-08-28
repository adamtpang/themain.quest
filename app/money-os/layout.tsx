import { requirePrivatePageAccess } from "@/lib/private-access";

export const dynamic = "force-dynamic";

export default async function MoneyOSLayout({ children }: { children: React.ReactNode }) {
  await requirePrivatePageAccess("/money-os");
  return children;
}
