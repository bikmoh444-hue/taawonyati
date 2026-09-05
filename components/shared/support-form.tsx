"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { EMAIL_REGEX } from "@/lib/format";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const SUPPORT_EMAIL = "support@taawonyati.ma";

export function SupportForm() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const canSend = !!name.trim() && EMAIL_REGEX.test(email) && !!message.trim();

  async function send() {
    if (!message.trim()) {
      toast.error(t("support.messageRequired"));
      return;
    }
    setSending(true);
    try {
      const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
        `[Taawonyati] Message de ${name.trim()}`
      )}&body=${encodeURIComponent(
        `Nom: ${name.trim()}\nEmail: ${email.trim()}\n\n${message}`
      )}`;
      window.location.href = mailto;
      toast.success(t("toasts.saved"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <p className="text-sm text-muted-foreground">{t("support.subtitle")}</p>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("support.name")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("support.email")}</Label>
              <Input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("support.message")}</Label>
            <Textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="flex justify-between gap-2">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
            >
              <Mail className="h-4 w-4" />
              {t("support.viaEmail")} {SUPPORT_EMAIL}
            </a>
            <Button type="button" onClick={send} disabled={sending || !canSend}>
              <Send className="h-4 w-4" />
              {t("support.send")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}