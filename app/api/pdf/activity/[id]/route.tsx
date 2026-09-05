import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ActivityPdf } from "@/lib/pdf/activity-template";
import { LOCALE_COOKIE, type AppLocale } from "@/lib/constants";
import type { Activity, Cooperative } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let activity: Activity | null = null;
  let cooperative: Cooperative | null = null;
  try {
    const [activityRes, profileRes] = await Promise.all([
      supabase
        .from("activities")
        .select("*")
        .eq("id", params.id)
        .maybeSingle<Activity>(),
      supabase
        .from("profiles")
        .select("cooperative_id")
        .eq("id", user.id)
        .maybeSingle<{ cooperative_id: string | null }>(),
    ]);

    if (activityRes.error) {
      console.error(`[pdf/activity] failed to load activity ${params.id}:`, activityRes.error);
      return NextResponse.json(
        { error: "Failed to load activity" },
        { status: 500 }
      );
    }

    activity = activityRes.data;
    if (!activity) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const coopId = profileRes.data?.cooperative_id ?? activity.cooperative_id;
    if (coopId) {
      const { data } = await supabase
        .from("cooperatives")
        .select("*")
        .eq("id", coopId)
        .maybeSingle<Cooperative>();
      cooperative = data ?? null;
    }
  } catch (err) {
    console.error(`[pdf/activity] query failed for ${params.id}`, err);
    return NextResponse.json(
      { error: "Failed to load activity data" },
      { status: 500 }
    );
  }

  if (!cooperative) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const cookieStore = cookies();
  const locale: AppLocale =
    cookieStore.get(LOCALE_COOKIE)?.value === "fr" ? "fr" : "ar";

  let buffer: Buffer;
  try {
    buffer = await renderToBuffer(
      <ActivityPdf activity={activity!} cooperative={cooperative} locale={locale} />
    );
  } catch (err) {
    console.error("[pdf/activity] render failed", err);
    return NextResponse.json(
      { error: "Failed to render PDF" },
      { status: 500 }
    );
  }

  return new Response(new Uint8Array(buffer as Uint8Array<ArrayBuffer>), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="activite-${activity.id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
