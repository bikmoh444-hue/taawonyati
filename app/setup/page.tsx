import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getLocale, getT } from "@/lib/i18n/server";
import { CooperativeForm } from "@/components/coop/cooperative-form";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const sess = await requireSession();

  if (sess.profile.role !== "admin_cooperative") {
    redirect("/admin/dashboard");
  }

  const locale = getLocale();
  const t = getT(locale);
  const completed = !!sess.cooperative && !!sess.cooperative.name_ar;

  return (
    <div className="min-h-screen bg-soft py-10">
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="mb-2 text-2xl font-extrabold text-navy">Taawoniati</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {completed ? t("setup.editTitle") : t("setup.title")}
        </p>
        <CooperativeForm cooperative={sess.cooperative} isSetup={!completed} />
      </div>
    </div>
  );
}