import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();

    const { origin } = new URL(request.url);
    return NextResponse.redirect(`${origin}/login`, { status: 303 });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
  }
}

