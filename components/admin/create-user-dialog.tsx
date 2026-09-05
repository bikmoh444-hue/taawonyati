"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { EMAIL_REGEX } from "@/lib/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function CreateUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [creating, setCreating] = useState(false);

  async function create() {
    if (!EMAIL_REGEX.test(email)) {
      toast.error(t("admin.emailInvalid"));
      return;
    }
    if (password.length < 8) {
      toast.error(t("admin.passwordTooShort"));
      return;
    }
    if (!fullName.trim()) {
      toast.error(t("admin.fullNameRequired"));
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/create-cooperative-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName: fullName.trim() }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error ?? "failed");
      }
      toast.success(t("admin.createSuccess"));
      onOpenChange(false);
      setEmail("");
      setPassword("");
      setFullName("");
    } catch (e) {
      console.error(e);
      toast.error(t("toasts.error"));
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.createUser")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("admin.fullNameLabel")}</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("admin.emailLabel")}</Label>
            <Input
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("admin.passwordLabel")}</Label>
            <Input
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <p className="rounded-2xl bg-soft p-3 text-xs text-muted-foreground">
            {t("admin.cooperativeNameNote")}
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="button" onClick={create} disabled={creating}>
              {creating && <Loader2 className="animate-spin" />}
              {t("common.create")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}