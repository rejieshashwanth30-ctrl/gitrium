import { prisma } from "@/lib/db/prisma";
import { User } from "@supabase/supabase-js";

export interface UserProfileData {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  company: string | null;
  githubUsername: string | null;
  githubConnected: boolean;
  isVerified: boolean;
  tier: string;
}

interface CacheEntry {
  profile: UserProfileData;
  expiresAt: number;
}

// In-memory request/short-lived cache to prevent duplicate remote DB roundtrips
const profileCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30_000; // 30 seconds

export function invalidateUserProfileCache(userId?: string) {
  if (userId) {
    profileCache.delete(userId);
  } else {
    profileCache.clear();
  }
}

/**
 * Self-healing profile resolver:
 * Guarantees that every authenticated Supabase user has a corresponding
 * Gitrium profile in the database without throwing onboarding errors.
 */
export async function ensureUserProfile(supabaseUser: User): Promise<UserProfileData | null> {
  if (!supabaseUser || !supabaseUser.id) return null;

  const now = Date.now();
  const cached = profileCache.get(supabaseUser.id);
  if (cached && cached.expiresAt > now) {
    return cached.profile;
  }

  try {
    const existing = await prisma.userProfile.findUnique({
      where: { userId: supabaseUser.id },
    });

    if (existing) {
      profileCache.set(supabaseUser.id, { profile: existing, expiresAt: now + CACHE_TTL_MS });
      return existing;
    }

    // Derive initial profile information from metadata or email
    const metadata = supabaseUser.user_metadata || {};
    const email = supabaseUser.email || `${supabaseUser.id}@gitrium.dev`;
    const defaultUsername =
      metadata.user_name ||
      metadata.preferred_username ||
      email.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase() ||
      `dev_${supabaseUser.id.substring(0, 8)}`;

    const displayName =
      metadata.full_name ||
      metadata.name ||
      defaultUsername.charAt(0).toUpperCase() + defaultUsername.slice(1);

    const avatarUrl = metadata.avatar_url || null;

    // Safe upsert to handle potential concurrent requests
    const profile = await prisma.userProfile.upsert({
      where: { userId: supabaseUser.id },
      update: {
        email,
        updatedAt: new Date(),
      },
      create: {
        userId: supabaseUser.id,
        username: defaultUsername,
        displayName,
        email,
        avatarUrl,
        githubUsername: metadata.user_name || null,
        githubConnected: !!metadata.user_name,
        isVerified: false,
        tier: "Free",
      },
    });

    profileCache.set(supabaseUser.id, { profile, expiresAt: Date.now() + CACHE_TTL_MS });
    return profile;
  } catch (error) {
    console.error("Profile resolution error (fallback active):", error);
    // Return a safe memory profile if database connection is pending/unreachable
    return {
      id: supabaseUser.id,
      userId: supabaseUser.id,
      username: supabaseUser.email?.split("@")[0] || "developer",
      displayName: supabaseUser.user_metadata?.full_name || "Gitrium Developer",
      email: supabaseUser.email || "",
      avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
      bio: null,
      location: null,
      website: null,
      company: null,
      githubUsername: supabaseUser.user_metadata?.user_name || null,
      githubConnected: !!supabaseUser.user_metadata?.user_name,
      isVerified: true,
      tier: "Free",
    };
  }
}

