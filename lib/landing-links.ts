export function buildWhatsAppUrl(
  phone: string | null,
  message: string | null
): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return "https://wa.me";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message ?? "")}`;
}

export function buildMailUrl(email: string | null): string | null {
  const value = (email ?? "").trim();
  if (!value) return null;
  return value.startsWith("mailto:") ? value : `mailto:${value}`;
}
