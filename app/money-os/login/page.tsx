import { redirect } from "next/navigation";

export default function MoneyOSLoginPage() {
  redirect("/signin?callbackUrl=/money-os");
}
