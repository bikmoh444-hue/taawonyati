import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ActivitiesReportPdf } from "@/lib/pdf/activities-report-template";
import { LOCALE_COOKIE, type AppLocale } from "@/lib/constants";
import type { Activity, Cooperative } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const requested = Number(url.searchParams.get("year"));
  const year = Number.isFinite(requested) ? requested : new Date().getFullYear();
  const start = `${year}-01-01`;
  const end = `${year + 1}-01-01`;

  const cookieStore = cookies();
  const locale: AppLocale =
    cookieStore.get(LOCALE_COOKIE)?.value === "fr" ? "fr" : "ar";

  let activities: Activity[];
  let cooperative: Cooperative | null = null;
  try {
    const [activitiesRes, profileRes] = await Promise.all([
      supabase
        .from("activities")
        .select("*")
        .gte("date", start)
        .lt("date", end)
        .order("date", { ascending: true })
        .returns<Activity[]>(),
      supabase
        .from("profiles")
        .select("cooperative_id")
        .eq("id", user.id)
        .maybeSingle<{ cooperative_id: string | null }>(),
    ]);

    if (activitiesRes.error) {
      console.error(
        `[pdf/activities-report] failed to load activities for ${year}:`,
        activitiesRes.error
      );
      return NextResponse.json(
        { error: "Failed to load activities" },
        { status: 500 }
      );
    }

    activities = activitiesRes.data ?? [];
    if (profileRes.data?.cooperative_id) {
      const { data } = await supabase
        .from("cooperatives")
        .select("*")
        .eq("id", profileRes.data.cooperative_id)
        .maybeSingle<Cooperative>();
      cooperative = data ?? null;
    }
  } catch (err) {
    console.error(`[pdf/activities-report] query failed for ${year}`, err);
    return NextResponse.json(
      { error: "Failed to load report data" },
      { status: 500 }
    );
  }

  if (!cooperative) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let buffer: Buffer;
  try {
    buffer = await renderToBuffer(
      <ActivitiesReportPdf
        activities={activities}
        cooperative={cooperative}
        year={year}
        locale={locale}
      />
    );
  } catch (err) {
    console.error("[pdf/activities-report] render failed", err);
    return NextResponse.json(
      { error: "Failed to render PDF" },
      { status: 500 }
    );
  }

  return new Response(new Uint8Array(buffer as Uint8Array<ArrayBuffer>), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="rapport-activites-${year}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}