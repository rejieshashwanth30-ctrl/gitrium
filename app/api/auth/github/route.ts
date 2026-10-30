import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Initiates GitHub OAuth through Supabase Auth (server-side entry point).
 * Connects Gitrium to GitHub via the configured OAuth provider.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/select-repositories";

  // Prevent open redirect vulnerabilities: strictly allow internal relative paths
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/select-repositories";

  // Determine application origin dynamically
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const isLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    host.includes(":3000");
  const protocol = request.headers.get("x-forwarded-proto") || (isLocal ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo,
        scopes: "read:user user:email repo",
        queryParams: {
          prompt: "consent",
        },
      },
    });

    if (!error && data?.url) {
      return NextResponse.redirect(data.url);
    }
    console.error("[OAuth Init] Supabase returned error:", error?.message);
    return NextResponse.redirect(
      `${origin}/github-connect?error=OAUTH_PROVIDER_ERROR&error_description=${encodeURIComponent(
        error?.message || "OAuth provider initialization failed"
      )}`
    );
  } catch (err: any) {
    console.warn("[OAuth Init] Supabase server OAuth redirect error:", err?.message);
    return NextResponse.redirect(
      `${origin}/github-connect?error=OAUTH_PROVIDER_ERROR&error_description=${encodeURIComponent(
        err?.message || "Server OAuth redirect failed"
      )}`
    );
  }
}
