import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Initiates GitHub OAuth through Supabase Auth (with Neon Auth bridge fallback).
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

  // 1. Primary path: Supabase SSR Auth redirect
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo,
        scopes: "read:user user:email repo",
      },
    });

    if (!error && data?.url) {
      return NextResponse.redirect(data.url);
    }
  } catch (err) {
    console.warn("Supabase server OAuth redirect fallback:", err);
  }

  // 2. Secondary path: Client-side Neon Auth bridge
  const neonAuthUrl =
    process.env.NEON_AUTH_URL ||
    process.env.NEXT_PUBLIC_NEON_AUTH_URL ||
    "https://ep-wispy-cherry-b477ye05.neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Connecting to GitHub — ADYK Gitrium</title>
  <style>
    body { background-color: #F7F6F1; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; color: #17201B; }
    .card { background: white; border: 1px solid #DDE1DC; border-radius: 12px; padding: 2rem 2.5rem; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05); max-width: 400px; width: 100%; }
    .spinner { width: 32px; height: 32px; border: 3px solid #EFEEE8; border-top-color: #159A72; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1.25rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .title { font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; font-family: monospace; }
    .sub { font-size: 12px; color: #56635C; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <div class="title">Connecting to GitHub</div>
    <div class="sub">Establishing secure OAuth session...</div>
  </div>
  <script>
    (async function() {
      try {
        const res = await fetch(${JSON.stringify(neonAuthUrl + "/sign-in/social")}, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            provider: "github",
            callbackURL: ${JSON.stringify(redirectTo)}
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.url) {
            window.location.href = data.url;
            return;
          }
        }
        window.location.href = ${JSON.stringify(origin + "/github-connect?error=oauth_init_failed")};
      } catch (err) {
        window.location.href = ${JSON.stringify(origin + "/github-connect?error=auth_unreachable")};
      }
    })();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
