import { requireCooperativeUser } from "@/lib/auth";
import { getLocale, getT } from "@/lib/i18n/server";
import { CooperativeForm } from "@/components/coop/cooperative-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { cooperative } = await requireCooperativeUser();
  const t = getT(getLocale());

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("setup.editTitle")}</p>
      <CooperativeForm cooperative={cooperative} isSetup={false} />
    </div>
  );
}