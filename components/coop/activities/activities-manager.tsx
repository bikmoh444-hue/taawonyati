"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CalendarX, FileDown, Loader2, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Activity } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { fmtDateLong } from "@/lib/format";
import { FilterChips, type ChipOption } from "@/components/shared/filter-chips";
import { EmptyState } from "@/components/shared/empty-state";
import { Fab } from "@/components/shared/fab";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ActivityDialog } from "@/components/coop/activities/activity-dialog";

function storagePathFromUrl(url: string): string | null {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("activity_images");
    if (idx === -1) return null;
    return parts.slice(idx + 1).join("/");
  } catch {
    return null;
  }
}

export function ActivitiesManager({
  activities,
  userId,
  coopId,
}: {
  activities: Activity[];
  userId: string;
  coopId: string | null;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const [year, setYear] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<Activity | null>(null);
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  async function downloadPdf(url: string, filename: string) {
    if (downloading) return;
    setDownloading(url);
    try {
      const res = await fetch(url, { credentials: "same-origin" });
      const contentType = res.headers.get("Content-Type") ?? "";
      if (!res.ok || !contentType.includes("application/pdf")) {
        toast.error(t("toasts.pdfError"));
        return;
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error(t("toasts.pdfError"));
    } finally {
      setDownloading(null);
    }
  }

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const a of activities) {
      set.add(new Date(a.date).getFullYear());
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [activities]);

  const yearChips: ChipOption[] = useMemo(() => {
    const chips: ChipOption[] = [{ label: t("activities.allYears"), value: "__all__" }];
    for (const y of years) chips.push({ label: String(y), value: String(y) });
    return chips;
  }, [years, t]);

  const filtered = useMemo(
    () =>
      year
        ? activities.filter((a) => new Date(a.date).getFullYear() === year)
        : activities,
    [activities, year]
  );

  async function remove(a: Activity) {
    if (a.image_url) {
      const path = storagePathFromUrl(a.image_url);
      if (path) {
        await supabase.storage.from("activity_images").remove([path]);
      }
    }
    const { error } = await supabase.from("activities").delete().eq("id", a.id);
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
      <div className="flex items-center justify-between gap-3">
        <FilterChips
          options={yearChips}
          selected={year ? String(year) : "__all__"}
          onSelect={(v) => {
            if (!v || v === "__all__") setYear(null);
            else setYear(Number(v));
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="shrink-0 rounded-full"
          onClick={() =>
            downloadPdf(
              `/api/pdf/activities-report?year=${year ?? new Date().getFullYear()}`,
              `rapport-activites-${year ?? new Date().getFullYear()}.pdf`
            )
          }
          disabled={downloading !== null}
        >
          {downloading ===
          `/api/pdf/activities-report?year=${year ?? new Date().getFullYear()}` ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          {t("activities.annualReport")}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarX className="h-9 w-9" strokeWidth={1.5} />}
          message={t("activities.empty")}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <div key={a.id} className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <div className="relative aspect-[16/10] bg-soft">
                {a.image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={a.image_url}
                    alt={a.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-muted-foreground/40">
                    <CalendarDays className="h-12 w-12" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-navy">{a.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {fmtDateLong(a.date, locale)}
                    </p>
                    {a.location && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {a.location}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary"
                      onClick={() =>
                        downloadPdf(`/api/pdf/activity/${a.id}`, `activite-${a.id}.pdf`)
                      }
                      disabled={downloading !== null}
                      aria-label={t("activities.downloadPdf")}
                    >
                      {downloading === `/api/pdf/activity/${a.id}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-destructive"
                      onClick={() => setDeleting(a)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {a.notes && (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                    {a.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("common.confirmDelete")}
        description={t("activities.deleteConfirmMessage")}
        onConfirm={() => {
          if (deleting) remove(deleting);
        }}
      />

      <ActivityDialog
        open={open}
        onOpenChange={setOpen}
        userId={userId}
        coopId={coopId}
      />

      <Fab onClick={() => setOpen(true)} label={t("activities.addNew")} />
    </div>
  );
}