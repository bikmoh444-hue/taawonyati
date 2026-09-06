import { cn } from "@/lib/utils";

// Compact, consistently-sized brand logo used across the header, footer,
// admin shell and auth screens. Handles the uploaded logo URL plus a
// fallback mark when no logo is set.
export function SiteLogo({
  src,
   alt = "taawoniati",
  className,
  iconClassName,
  invert = false,
  showWordmark = true,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  iconClassName?: string;
  invert?: boolean;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={cn(
            "h-8 w-8 rounded-lg object-contain",
            iconClassName
          )}
        />
      ) : (
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white",
            invert ? "bg-[#0D9488]/90" : "bg-[#0D9488]",
            iconClassName
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden
          >
            <path d="m11 17 2 2a1 1 0 1 0 3-3" />
            <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
            <path d="m21 3 1 11h-2" />
            <path d="M3 3v12a2 2 0 0 0 2 2h6" />
          </svg>
        </span>
      )}
      {showWordmark && (
        <span
          className={cn(
            "text-lg font-extrabold tracking-tight",
            invert ? "text-white" : "text-[#111827]"
          )}
        >
          {alt}
        </span>
      )}
    </span>
  );
}
