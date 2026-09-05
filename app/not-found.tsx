"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const { t, locale } = useI18n();
  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center"
    >
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold">{t("notFound.title")}</h1>
      <p className="text-muted-foreground">{t("notFound.description")}</p>
      <Button asChild>
        <Link href="/dashboard">{t("notFound.backHome")}</Link>
      </Button>
    </div>
  );
}