import { requireCooperativeUser } from "@/lib/auth";
import { getLocale, getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  await requireCooperativeUser();
  const t = getT(getLocale());

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-extrabold text-navy">Taawonyati</h1>
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("about.text")}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          {t("about.version")} 1.0.0
        </p>
      </div>
    </div>
  );
}