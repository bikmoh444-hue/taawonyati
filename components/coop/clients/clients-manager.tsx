"use client";

import { useMemo, useState } from "react";
import { MoreVertical, Phone, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Client } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { SearchBar } from "@/components/shared/search-bar";
import { FilterChips } from "@/components/shared/filter-chips";
import { EmptyState } from "@/components/shared/empty-state";
import { Fab } from "@/components/shared/fab";
import { InitialAvatar } from "@/components/shared/initial-avatar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientForm } from "./client-form";

export function ClientsManager({
  clients,
  coopId,
}: {
  clients: Client[];
  coopId: string | null;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone || "").includes(q)
    );
  }, [clients, search]);

  async function hardDelete(c: Client) {
    const { error } = await supabase.from("clients").delete().eq("id", c.id);
    if (error) {
      toast.error(t("toasts.error"));
      return;
    }
    toast.success(t("toasts.deleted"));
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={t("clients.searchPlaceholder")}
      />
      <FilterChips
        options={[{ label: t("clients.allClients"), value: "__all__" }]}
        selected="__all__"
        onSelect={() => {
          /* decorative chip (matches mobile) */
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-9 w-9" strokeWidth={1.5} />}
          message={t("clients.empty")}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="relative flex items-center gap-3 overflow-hidden rounded-3xl bg-white p-4 shadow-sm"
            >
              <span className="absolute inset-y-0 end-0 w-1.5 bg-primary/60" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditing(c);
                      setFormOpen(true);
                    }}
                  >
                    {t("common.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleting(c)}
                  >
                    {t("common.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <InitialAvatar name={c.name} />

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-navy">{c.name}</p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground" dir="ltr">
                  {c.phone}
                </p>
              </div>
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground/50" />
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
          setFormOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? t("clients.editTitle") : t("clients.newTitle")}
            </DialogTitle>
          </DialogHeader>
          <ClientForm
            key={editing?.id ?? "new"}
            client={editing}
            coopId={coopId}
            onSaved={() => {
              setFormOpen(false);
              setEditing(null);
              router.refresh();
            }}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("common.confirmDelete")}
        description={t("common.confirmDeleteMessage")}
        onConfirm={() => {
          if (deleting) hardDelete(deleting);
        }}
      />

      <Fab onClick={() => setFormOpen(true)} label={t("clients.addNew")} />
    </div>
  );
}