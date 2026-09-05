import type { ReactNode } from "react";
import { requireAdminUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminUser();
  return <AdminShell>{children}</AdminShell>;
}