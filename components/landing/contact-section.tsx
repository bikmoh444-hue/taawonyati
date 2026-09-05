"use client";

import { useState, type FormEvent } from "react";
import {
  Clock,
  Mail,
  MessageCircle,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useLanding } from "./landing-shell";
import { EMAIL_REGEX } from "@/lib/format";

export function ContactSection() {
  const { t } = useI18n();
  const { settings } = useLanding();
  const waNumber = settings.whatsappNumber?.replace(/[^0-9]/g, "") || "";
  const waHref = waNumber ? `https://wa.me/${waNumber}` : "https://wa.me";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!EMAIL_REGEX.test(email.trim())) {
      toast.error(t("landing.contactEmailInvalid"));
      return;
    }
    if (!message.trim()) {
      toast.error(t("landing.contactMessageRequired"));
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      if (!res.ok) throw new Error("contact failed");
      toast.success(t("landing.contactSuccess"));
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      toast.error(t("landing.contactError"));
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="contact" className="scroll-mt-20 bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#0F766E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0D9488]" />
            {t("landing.contactBadge")}
          </span>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">
            {t("landing.contactTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
            {t("landing.contactSubtitle")}
          </p>
        </header>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.2)] sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-1.5 block text-xs font-semibold text-slate-500"
                >
                  {t("landing.contactNameLabel")}
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("landing.contactNamePlaceholder")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition-colors placeholder:text-slate-400 focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="mb-1.5 block text-xs font-semibold text-slate-500"
                >
                  {t("landing.contactEmail")}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("landing.contactEmailPlaceholder")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition-colors placeholder:text-slate-400 focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-1.5 block text-xs font-semibold text-slate-500"
                >
                  {t("landing.contactMessage")}
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("landing.contactMessagePlaceholder")}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition-colors placeholder:text-slate-400 focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-full bg-[#0D9488] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0F766E] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4 rtl:-scale-x-100" />
                {sending ? t("common.loading") : t("landing.contactSend")}
              </button>
            </form>
          </div>

          {/* Support / infos */}
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.2)]">
              <h3 className="text-base font-bold tracking-tight text-[#0F172A]">
                {t("landing.contactInfoTitle")}
              </h3>
              <div className="mt-5 space-y-4">
                <InfoRow
                  icon={<MessageCircle className="h-4 w-4" />}
                  label={t("landing.contactByWhatsApp")}
                  value={
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#0D9488] hover:text-[#0F766E]"
                    >
                      {waNumber ? `+${waNumber}` : "https://wa.me"}
                    </a>
                  }
                />
                <InfoRow
                  icon={<Clock className="h-4 w-4" />}
                  label=""
                  value={
                    <span className="font-medium text-slate-600">
                      {t("landing.contactResponseTime")}
                    </span>
                  }
                />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] p-7 text-white shadow-[0_30px_70px_-35px_rgba(11,18,36,0.7)]">
              <div className="pointer-events-none absolute -end-14 -top-14 h-40 w-40 rounded-full bg-[#0D9488]/20 blur-2xl" />
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E6F4F1] text-[#0D9488]">
                  <Mail className="h-5 w-5" />
                </span>
                <h3 className="text-base font-bold tracking-tight text-white">
                  {t("landing.contactAssistantTitle")}
                </h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                {t("landing.contactAssistantDesc")}
              </p>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0D9488] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0F766E]"
              >
                <MessageCircle className="h-4 w-4" />
                {t("landing.contactWhatsApp")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E6F4F1] text-[#0D9488]">
        {icon}
      </span>
      <div className="min-w-0">
        {label && (
          <p className="text-[11px] font-semibold text-slate-400">{label}</p>
        )}
        <p className="truncate text-sm">{value}</p>
      </div>
    </div>
  );
}