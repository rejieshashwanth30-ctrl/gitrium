import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

// In-memory rate limiting map: email -> lastRequestedTimestamp
const resendRateLimitMap = new Map<string, number>();
const RESEND_COOLDOWN_MS = 60_000; // 60 seconds

/**
 * POST /api/auth/resend-confirmation
 * Requests a new account confirmation email from Supabase Auth with rate limiting.
 * Avoids email enumeration by returning a consistent message.
 */
export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !email.includes("@") || email.length > 254) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Rate-limiting check
    const now = Date.now();
    const lastRequest = resendRateLimitMap.get(email);
    if (lastRequest && now - lastRequest < RESEND_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - (now - lastRequest)) / 1000);
      return NextResponse.json(
        {
          success: false,
          rateLimited: true,
          retryAfterSeconds: remainingSeconds,
          message: `Please wait ${remainingSeconds} seconds before requesting another confirmation email.`,
        },
        { status: 429 }
      );
    }

    // Determine application origin
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes(":3000");
    const protocol = request.headers.get("x-forwarded-proto") || (isLocal ? "http" : "https");
    const origin = `${protocol}://${host}`;
    const emailRedirectTo = `${origin}/auth/callback?next=/github-connect`;

    console.log(`[Resend Confirmation] Dispatching confirmation request for email: ${email.replace(/(?<=.{2}).(?=.*@)/g, "*")}`);

    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo,
      },
    });

    if (error) {
      console.warn("[Resend Confirmation] Supabase resend notice:", error.message);

      // Handle provider-side rate limits
      if (error.message.toLowerCase().includes("rate") || error.status === 429) {
        return NextResponse.json(
          {
            success: false,
            rateLimited: true,
            retryAfterSeconds: 60,
            message: "Email delivery is currently rate-limited by the email service. Please wait a few minutes before trying again.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: error.message || "We couldn't request a confirmation email right now. Please try again.",
        },
        { status: 400 }
      );
    }

    // Record timestamp for rate-limiting
    resendRateLimitMap.set(email, now);

    return NextResponse.json({
      success: true,
      message: "If an account with this email exists, a confirmation link has been dispatched. Please check your inbox and spam folder.",
    });
  } catch (error: any) {
    console.error("[Resend Confirmation] Unexpected server error:", error);
    return NextResponse.json(
      { error: "Server encountered an error while processing request." },
      { status: 500 }
    );
  }
}
