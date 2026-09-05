import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getLandingContent } from "@/lib/landing";
import { createClient } from "@/lib/supabase/server";
import { LandingShell } from "@/components/landing/landing-shell";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Taawonyati - Gestion des cooperatives",
    description:
      "Presentation publique de Taawonyati, plateforme web et mobile pour la gestion des cooperatives.",
  };
}

export default async function LandingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const content = await getLandingContent();
  let role: "admin" | "cooperative" | null = null;
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle<{ role: "admin" | "admin_cooperative" | null }>();
    role =
      profile?.role === "admin"
        ? "admin"
        : profile?.role === "admin_cooperative"
          ? "cooperative"
          : null;
  }

  return (
    <LandingShell role={role} content={content}>
      {children}
    </LandingShell>
  );
}
