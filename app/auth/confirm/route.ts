import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profileService";
import { EmailOtpType } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * GET /auth/confirm
 * Dedicated handler for Supabase email confirmation links (PKCE code or TokenHash OTP).
 * Verifies email address, ensures UserProfile in Neon database, and redirects cleanly.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/github-connect";

  // Prevent open redirect vulnerabilities
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/github-connect";

  const supabase = createClient();

  // 1. Token Hash flow (OTP verification)
  if (tokenHash && type) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

      if (!error && data.user) {
        await ensureUserProfile(data.user);
        return NextResponse.redirect(`${origin}${safeNext}?confirmed=true&email_verified=true`);
      }

      console.error("[Auth Confirm] verifyOtp error:", error?.message);
      const desc = encodeURIComponent(error?.message || "Invalid or expired confirmation link");
      return NextResponse.redirect(`${origin}/login?error=CONFIRMATION_LINK_INVALID&error_description=${desc}`);
    } catch (err: any) {
      console.error("[Auth Confirm] verifyOtp exception:", err);
      return NextResponse.redirect(`${origin}/login?error=CONFIRMATION_FAILED`);
    }
  }

  // 2. PKCE code exchange flow
  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.user) {
        await ensureUserProfile(data.user);
        return NextResponse.redirect(`${origin}${safeNext}?confirmed=true&email_verified=true`);
      }

      console.error("[Auth Confirm] exchangeCodeForSession error:", error?.message);
      const desc = encodeURIComponent(error?.message || "Invalid or expired confirmation code");
      return NextResponse.redirect(`${origin}/login?error=CONFIRMATION_LINK_INVALID&error_description=${desc}`);
    } catch (err: any) {
      console.error("[Auth Confirm] exchangeCode exception:", err);
      return NextResponse.redirect(`${origin}/login?error=CONFIRMATION_FAILED`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=CONFIRMATION_PARAMS_MISSING`);
}
