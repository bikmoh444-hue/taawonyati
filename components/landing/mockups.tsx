import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Reusable device mockups.
// Screenshots are rendered inside a real device frame (phone / browser window)
// instead of as plain images.
//
// PhoneMockup uses FIXED dimensions so every instance is identical regardless
// of the parent container. The frame is ~250px wide (280px on sm+) × 9:19.5 ratio
// including the 12px bezel on each side.
// DesktopMockup max-width increased to 800px for better visibility.
// Both use object-contain to show full screenshot without cropping.
// ---------------------------------------------------------------------------

export function PhoneMockup({
  src,
  alt,
  className,
  fallback,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  fallback?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative w-[250px] shrink-0 select-none rounded-[2.8rem] border-[12px] border-[#0B1224] bg-[#0B1224] shadow-[0_40px_80px_-25px_rgba(11,18,36,0.6)] sm:w-[280px]",
        className
      )}
    >
      <div className="absolute -left-[4px] top-24 h-10 w-[4px] rounded-l bg-[#0B1224]" />
      <div className="absolute -left-[4px] top-40 h-16 w-[4px] rounded-l bg-[#0B1224]" />
      <div className="absolute -right-[4px] top-28 h-12 w-[4px] rounded-r bg-[#0B1224]" />
      <div className="absolute left-1/2 top-3 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-[#0B1224]" />
      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2rem] bg-white">
        {src ? (
          <Image
            src={src}
            alt={alt ?? "Aperçu mobile"}
            fill
            sizes="(max-width: 640px) 200px, (max-width: 768px) 250px, 280px"
            className="object-contain object-center"
            unoptimized
          />
        ) : (
          fallback ?? <ScreenPlaceholder label="Capture mobile" />
        )}
      </div>
    </div>
  );
}

export function DesktopMockup({
  src,
  alt,
  className,
  fallback,
  urlText = "https://taawonyati.com",
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  fallback?: ReactNode;
  urlText?: string;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-[800px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_45px_90px_-30px_rgba(15,23,42,0.4)]",
        className
      )}
    >
      {/* Browser toolbar */}
      <div className="flex items-center gap-2 border-b border-slate-100 bg-[#F8FAFB] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
        <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
        <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        <div className="mx-3 flex h-7 flex-1 items-center rounded-md border border-slate-200 bg-white px-3">
          <span className="truncate text-[12px] font-medium text-slate-400">
            {urlText}
          </span>
        </div>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden bg-white">
        {src ? (
          <Image
            src={src}
            alt={alt ?? "Aperçu web"}
            fill
            sizes="(max-width: 800px) 100vw, 800px"
            className="object-contain object-center"
            unoptimized
          />
        ) : (
          fallback ?? <ScreenPlaceholder label="Capture web" />
        )}
      </div>
    </div>
  );
}

export function ScreenPlaceholder({ label }: { label: string }) {
  return (
    <div className="grid h-full w-full place-items-center bg-[#F4F7F6]">
      <div className="flex flex-col items-center gap-2 px-6 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#E6F4F1] text-[#0D9488]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
            aria-hidden
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
        <p className="text-xs font-semibold text-slate-400">{label}</p>
      </div>
    </div>
  );
}
