import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Reusable empty state: large icon in a soft tinted circle, bold title,
// small gray description, optional CTA. Per design spec §C.
export function EmptyState({
  icon,
  message,
  title,
  description,
  action,
  tone = "teal",
  className,
}: {
  icon?: ReactNode;
  message?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  tone?: "teal" | "slate" | "rose" | "amber";
  className?: string;
}) {
  const tones: Record<string, string> = {
    teal: "bg-teal-50 text-teal-600",
    slate: "bg-slate-100 text-slate-400",
    rose: "bg-rose-50 text-rose-500",
    amber: "bg-amber-50 text-amber-500",
  };
  const heading = title ?? message;
  const sub = description ?? (title ? message : undefined);
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-3xl bg-white px-6 py-14 text-center shadow-sm",
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "grid h-16 w-16 place-items-center rounded-full",
            tones[tone]
          )}
        >
          <span className="[&>svg]:h-9 [&>svg]:w-9 [&>svg]:stroke-[1.5]">
            {icon}
          </span>
        </div>
      )}
      {heading && (
        <p className="text-base font-semibold text-slate-700">{heading}</p>
      )}
      {sub && (
        <p className="max-w-xs text-sm text-slate-400">{sub}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
