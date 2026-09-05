"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, MoreVertical, Package } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { fmtMoney } from "@/lib/format";
import { productCategoryLabel } from "@/lib/labels";
import { SearchBar } from "@/components/shared/search-bar";
import { FilterChips, type ChipOption } from "@/components/shared/filter-chips";
import { EmptyState } from "@/components/shared/empty-state";
import { Fab } from "@/components/shared/fab";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function stockBadge(p: Product) {
  if (p.stock <= 0) {
    return { label: "products.outOfStock", variant: "danger" as const };
  }
  if (p.min_stock > 0 && p.stock <= p.min_stock) {
    return { label: "products.lowStock", variant: "warning" as const };
  }
  return { label: "products.healthyStock", variant: "success" as const };
}

export function ProductsManager({ products }: { products: Product[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  // Category filter chips derived dynamically from the data (matches mobile).
  const chipOptions = useMemo<ChipOption[]>(() => {
    const present = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean) as string[])
    );
    const chips: ChipOption[] = [{ label: t("categories.all"), value: "__all__" }];
    for (const c of present) {
      chips.push({ label: productCategoryLabel(c, locale), value: c });
    }
    return chips;
  }, [products, locale, t]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (category && category !== "__all__" && p.category !== category) return false;
      return true;
    });
  }, [products, search, category]);

  async function softDelete(p: Product) {
    const { error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", p.id);
    if (error) {
      toast.error(t("toasts.error"));
      return;
    }
    toast.success(t("toasts.deleted"));
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={t("products.searchPlaceholder")}
      />
      <FilterChips
        options={chipOptions}
        selected={category}
        onSelect={(v) => setCategory(v === "__all__" ? "__all__" : v)}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="h-9 w-9" strokeWidth={1.5} />}
          message={t("products.empty")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => {
            const badge = stockBadge(p);
            return (
              <div
                key={p.id}
                className="group overflow-hidden rounded-3xl bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => router.push(`/products/${p.id}/edit`)}
                  className="relative block aspect-square w-full bg-soft"
                >
                  {p.photo_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.photo_url}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-muted-foreground/40">
                      <Package className="h-14 w-14" />
                    </div>
                  )}
                  {p.is_bio && (
                    <span className="absolute start-2 top-2 flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow">
                      <Leaf className="h-3 w-3" />
                      {t("products.bioBadge")}
                    </span>
                  )}
                </button>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-navy">{p.name}</p>
                      <p className="text-xs font-medium text-muted-foreground">
                        {productCategoryLabel(p.category, locale)}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-soft"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/products/${p.id}/edit`)}
                        >
                          {t("common.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleting(p)}
                        >
                          {t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-bold text-primary" dir="ltr">
                      {fmtMoney(p.price, locale)}
                    </p>
                    <Badge variant={badge.variant}>
                      {t(badge.label as never)}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("common.confirmDelete")}
        description={t("common.confirmDeleteMessage")}
        onConfirm={() => {
          if (deleting) softDelete(deleting);
        }}
      />

      <Fab onClick={() => router.push("/products/new")} label={t("products.addNew")} />
    </div>
  );
}