import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { EMAIL_REGEX } from "@/lib/format";

export const runtime = "nodejs";

// Public endpoint for the landing footer contact form. RLS allows anonymous
// inserts into `contact_messages`; only admins can read them.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Missing body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "Invalid email" },
      { status: 422 }
    );
  }
  if (!message) {
    return NextResponse.json(
      { error: "Message required" },
      { status: 422 }
    );
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("contact_messages")
    .insert({ name: name || null, email, message });

  if (error) {
    console.error("[contact] failed to insert message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
