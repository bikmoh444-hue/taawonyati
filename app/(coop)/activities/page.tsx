import { requireCooperativeUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ActivitiesManager } from "@/components/coop/activities/activities-manager";
import type { Activity } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const { userId, profile } = await requireCooperativeUser();
  const supabase = createClient();

  const { data } = await supabase
    .from("activities")
    .select("*")
    .order("date", { ascending: false })
    .returns<Activity[]>();

  return (
    <ActivitiesManager
      activities={data ?? []}
      userId={userId}
      coopId={profile.cooperative_id}
    />
  );
}