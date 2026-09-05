import { requireCooperativeUser } from "@/lib/auth";
import { SupportForm } from "@/components/shared/support-form";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  await requireCooperativeUser();
  return (
    <div className="space-y-4">
      <SupportForm />
    </div>
  );
}