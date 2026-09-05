"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";

export type UploadKind = "logo" | "product" | "activity" | "landing";

async function compressImage(file: File, maxWidth = 1200, quality = 0.75): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Downscale large images to maxWidth to keep storage/uploads light.
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no ctx"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("toBlob"))),
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("img load"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

function uploadPathFor(kind: UploadKind, userId: string, _ext: string, ts: number) {
  if (kind === "logo") return `${userId}_${ts}.jpg`;
  if (kind === "product") return `products/${ts}.jpg`;
  if (kind === "activity") return `activities/${ts}.jpg`;
  return `landing/${ts}.jpg`;
}

export function ImageUpload({
  kind,
  value,
  onChange,
  helperText,
  className,
}: {
  kind: UploadKind;
  value?: string | null;
  onChange: (url: string | null) => void;
  helperText?: string;
  className?: string;
}) {
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);
  const [broken, setBroken] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset the error state whenever a new image URL is provided.
  useEffect(() => {
    setBroken(false);
  }, [value]);

  const bucket =
    kind === "logo"
      ? STORAGE_BUCKETS.LOGOS
      : kind === "product"
        ? STORAGE_BUCKETS.PRODUCT_PHOTOS
        : kind === "activity"
          ? STORAGE_BUCKETS.ACTIVITY_IMAGES
          : STORAGE_BUCKETS.LANDING_MEDIA;

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id ?? "anonymous";
      const ext = "jpg";
      const ts = Date.now();
      const path = uploadPathFor(kind, userId, ext, ts);
      const payload = await compressImage(file, 1200, 0.75);
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, payload, { upsert: true, contentType: "image/jpeg" });
      if (error) {
        toast.error(t("toasts.imageUploadError"));
        return;
      }
      const url = supabase.storage.from(bucket).getPublicUrl(path).data
        .publicUrl;
      onChange(url);
      toast.success(t("toasts.imageUploaded"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-border bg-[#eef1f0] transition-colors hover:border-primary/50"
      >
        {value ? (
          <>
            {broken ? (
              <div className="flex flex-col items-center gap-2 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                  <Camera className="h-6 w-6" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {t("toasts.imageLoadError")}
                </span>
              </div>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt=""
                  onError={() => setBroken(true)}
                  className="h-full w-full object-cover"
                />
                {uploading && (
                  <div className="absolute inset-0 grid place-items-center bg-black/30">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Camera className="h-6 w-6" />
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {helperText ?? t("setup.logoHelp")}
            </span>
          </div>
        )}
      </button>
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange(null);
          }}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-destructive"
        >
          <X className="h-3.5 w-3.5" />
          {t("common.delete")}
        </button>
      )}
    </div>
  );
}