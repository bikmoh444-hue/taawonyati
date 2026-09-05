import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

const AVATAR_COLORS = [
  "bg-primary",
  "bg-violet-500",
  "bg-orange-400",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-rose-400",
  "bg-indigo-500",
  "bg-amber-500",
  "bg-lime-600",
  "bg-fuchsia-500",
];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function InitialAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm",
        colorFor(name || "?"),
        className
      )}
    >
      {initials(name || "?") || "?"}
    </div>
  );
}