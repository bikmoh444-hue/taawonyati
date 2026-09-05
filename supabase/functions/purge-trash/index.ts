// Purge trash: permanently delete documents & products whose
// deleted_at is older than 30 days.
//
// Runs server-side via a scheduled (cron) trigger — the schedule is
// declared in supabase/config.toml under [functions.purge-trash].
// It uses the SERVICE_ROLE key so it works even when the app is closed
// and bypasses RLS.
//
// Deployment:
//   supabase functions deploy purge-trash
//   # then tell Supabase to invoke it daily (set in config.toml):
//   supabase functions update cron purge-trash

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RETENTION_DAYS = 30;

// Optional shared secret so the endpoint cannot be triggered by strangers.
// Set SCHEDULED_TRIGGER_SECRET in the function secrets; the cron scheduler
// sends it as a Bearer token. If unset, only allow requests that carry it.
const SCHEDULED_TRIGGER_SECRET = Deno.env.get("SCHEDULED_TRIGGER_SECRET");

function authorized(authHeader: string | null): boolean {
  if (!SCHEDULED_TRIGGER_SECRET) return true; // no secret configured -> allow
  return authHeader === `Bearer ${SCHEDULED_TRIGGER_SECRET}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    if (!authorized(req.headers.get("Authorization"))) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const cutoff = new Date(
      Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const result: Record<string, number> = {};

    for (const table of ["documents", "products"]) {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .lt("deleted_at", cutoff);

      if (error) throw error;
      result[table] = (data ?? []).length;
    }

    return new Response(JSON.stringify({ ok: true, purged: result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
