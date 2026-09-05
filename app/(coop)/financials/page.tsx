import { redirect } from "next/navigation";
import { requireCooperativeUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function FinancialsRootPage() {
  await requireCooperativeUser();
  redirect("/financials/expenses");
}