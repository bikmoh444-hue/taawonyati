import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createClientServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

function missing(name: string): NextResponse {
  return NextResponse.json({ error: `Missing ${name}` }, { status: 400 });
}

// Create/update the cooperative + link it to the authenticated coop user's
// profile. The RLS policy on `cooperatives` cannot satisfy the insert for a
// profile that still has cooperative_id = NULL (first setup), so this runs
// with the service role key (server-side only, never exposed to the client).
export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      {
        error:
          "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
          "Add them in Vercel → Settings → Environment Variables.",
      },
      { status: 500 }
    );
  }

  const supabase = createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, cooperative_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin_cooperative") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return missing("body");

  const nameFr = typeof body.name_fr === "string" ? body.name_fr.trim() : "";
  const nameAr = typeof body.name_ar === "string" ? body.name_ar.trim() : "";
  if (!nameFr || !nameAr) {
    return NextResponse.json(
      { error: "name_fr and name_ar are required" },
      { status: 422 }
    );
  }

  const ice = typeof body.ice === "string" ? body.ice.trim() : "";
  if (!ice || !/^\d+$/.test(ice)) {
    return NextResponse.json(
      { error: "ice is required and must contain only digits" },
      { status: 422 }
    );
  }

  const payload = {
    name_ar: nameAr,
    name_fr: nameFr,
    name: nameFr,
    address: body.address?.trim() || null,
    phone: body.phone?.trim() || null,
    email: body.email?.trim() || null,
    ice: ice || null,
    rlc: body.rlc?.trim() || null,
    if_number: body.if_number?.trim() || null,
    secteur: body.secteur?.trim() || null,
    logo_url: body.logo_url || null,
  };

  const admin = createClient(url, key);
  let coopId = profile.cooperative_id;

  try {
    if (coopId) {
      const { data: existing } = await admin
        .from("cooperatives")
        .select("id")
        .eq("id", coopId)
        .maybeSingle();
      if (existing) {
        const { error } = await admin
          .from("cooperatives")
          .update(payload)
          .eq("id", coopId);
        if (error) throw error;
      } else {
        const { data, error } = await admin
          .from("cooperatives")
          .upsert({ id: coopId, ...payload })
          .select("id")
          .single();
        if (error) throw error;
        coopId = data.id;
      }
    } else {
      const { data, error } = await admin
        .from("cooperatives")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      coopId = data.id;
    }

    if (profile.cooperative_id !== coopId) {
      const { error } = await admin
        .from("profiles")
        .update({ cooperative_id: coopId })
        .eq("id", user.id);
      if (error) throw error;
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  return NextResponse.json({ success: true, cooperative_id: coopId });
}