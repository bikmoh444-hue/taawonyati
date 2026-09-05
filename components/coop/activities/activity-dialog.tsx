"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Activity } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/shared/image-upload";

function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function ActivityDialog({
  open,
  onOpenChange,
  userId,
  coopId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  coopId: string | null;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [date, setDate] = useState(todayISO());
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // reset when reopened
  useEffect(() => {
    if (open) {
      setName("");
      setDate(todayISO());
      setLocation("");
      setNotes("");
      setImageUrl(null);
    }
  }, [open]);

  async function save() {
    if (!name.trim()) {
      toast.error(t("activities.nameRequired"));
      return;
    }
    if (!date) {
      toast.error(t("activities.dateRequired"));
      return;
    }
    if (!location.trim()) {
      toast.error(t("activities.locationRequired"));
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("activities").insert({
        cooperative_id: coopId,
        name: name.trim(),
        date: new Date(`${date}T00:00:00`).toISOString(),
        location: location.trim(),
        notes: notes.trim() || null,
        image_url: imageUrl,
        created_by: userId,
      });
      if (error) throw error;
      toast.success(t("toasts.saved"));
      onOpenChange(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error(t("toasts.error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("activities.newActivity")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("activities.nameLabel")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t("activities.dateLabel")}</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("activities.locationLabel")}</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("activities.notesLabel")}</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("activities.imageLabel")}</Label>
            <ImageUpload
              kind="activity"
              value={imageUrl}
              onChange={setImageUrl}
              helperText={t("activities.imageHelp")}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="button" onClick={save} disabled={saving}>
              {t("common.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}