import { requireCooperativeUser } from "@/lib/auth";
import { CoopShell } from "@/components/layout/coop-shell";

export const dynamic = "force-dynamic";

export default async function CoopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, cooperative } = await requireCooperativeUser();

  return (
    <CoopShell profile={profile} cooperative={cooperative}>
      {children}
    </CoopShell>
  );
}