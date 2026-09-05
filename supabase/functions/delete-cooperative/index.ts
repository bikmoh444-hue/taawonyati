import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // 0. Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the user is an admin
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized: Admin only' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    const { cooperativeId } = await req.json();
    if (!cooperativeId) {
      return new Response(JSON.stringify({ error: 'cooperativeId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    // 1. Supprimer les comptes admin_cooperative liés à la coopérative.
    //    profiles.cooperative_id est ON DELETE SET NULL, donc sans cette étape
    //    les comptes auth.users resteraient orphelins. Supprimer auth.users
    //    cascade vers profiles (profiles.id references auth.users on delete cascade).
    const { data: coopProfiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("cooperative_id", cooperativeId)
      .eq("role", "admin_cooperative");

    if (profilesError) throw profilesError;

    if (coopProfiles && coopProfiles.length > 0) {
      for (const p of coopProfiles) {
        const { error: delUserError } = await supabaseAdmin.auth.admin.deleteUser(p.id);
        if (delUserError) throw delUserError;
      }
    }

    // 2. Supprimer les revenus (incomes) de la coopérative avant les documents,
    //    car incomes.document_id references documents(id) sans ON DELETE (NO ACTION).
    const { error: incomesError } = await supabaseAdmin
      .from("incomes")
      .delete()
      .eq("cooperative_id", cooperativeId);
    if (incomesError) throw incomesError;

    // 3. Supprimer la coopérative. Le reste (clients, suppliers, products,
    //    documents, document_items, expenses, activities, ...) cascade via FK.
    const { error: coopError } = await supabaseAdmin
      .from("cooperatives")
      .delete()
      .eq("id", cooperativeId);
    if (coopError) throw coopError;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
    });
  }
});