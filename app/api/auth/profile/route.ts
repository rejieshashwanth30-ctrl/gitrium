import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profileService";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await ensureUserProfile(user);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Verify real GitHub account connection status from database
    const ghAccount = await prisma.gitHubAccount.findUnique({
      where: { userId: profile.id },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        connectionStatus: true,
        accessToken: true,
        updatedAt: true,
      },
    });

    const isConnected = Boolean(
      profile.githubConnected &&
      ghAccount &&
      ghAccount.connectionStatus === "connected" &&
      ghAccount.accessToken
    );

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      profile: {
        ...profile,
        githubConnected: isConnected,
        githubUsername: ghAccount?.username || profile.githubUsername,
        avatarUrl: ghAccount?.avatarUrl || profile.avatarUrl,
        connectionStatus: ghAccount?.connectionStatus || (isConnected ? "connected" : "disconnected"),
      },
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
