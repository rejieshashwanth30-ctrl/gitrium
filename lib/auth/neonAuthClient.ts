import https from "https";
import dns from "dns";
import { prisma } from "@/lib/db/prisma";
import { encryptToken } from "@/lib/security/encryption";

const NEON_AUTH_DEFAULT_HOST = "ep-wispy-cherry-b477ye05.neonauth.c-6.us-east-2.aws.neon.tech";
const NEON_AUTH_DEFAULT_PATH = "/neondb/auth";

export interface NeonSocialAuthResponse {
  url: string;
  redirect: boolean;
}

/**
 * Perform an HTTPS request directly to Neon Auth with DNS fallback and SNI.
 * Solves local ISP / router DNS timeouts for Route 53 AWS domains on Windows.
 */
async function fallbackHttpsRequest(
  method: string,
  path: string,
  bodyData?: string,
  originHeader?: string
): Promise<string> {
  const dnsPromises = dns.promises;
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
    // ignore if cannot set custom DNS
  }

  // Resolve IP via reliable public DNS
  let targetIp = "77.112.184.171"; // Known stable anycast/AWS IP
  try {
    const resolved = await dnsPromises.resolve4(NEON_AUTH_DEFAULT_HOST);
    if (resolved && resolved.length > 0) {
      targetIp = resolved[0];
    }
  } catch {
    // Keep targetIp fallback
  }

  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = {
      Host: NEON_AUTH_DEFAULT_HOST,
      Accept: "application/json",
    };

    if (originHeader) {
      headers["Origin"] = originHeader;
    }

    if (bodyData) {
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = String(Buffer.byteLength(bodyData));
    }

    const req = https.request(
      {
        hostname: targetIp,
        port: 443,
        path,
        method,
        servername: NEON_AUTH_DEFAULT_HOST,
        headers,
        timeout: 10000,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body);
          } else {
            reject(new Error(`Neon Auth fallback request failed with status ${res.statusCode}: ${body}`));
          }
        });
      }
    );

    req.on("error", (err) => reject(err));
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Neon Auth fallback request timed out"));
    });

    if (bodyData) {
      req.write(bodyData);
    }
    req.end();
  });
}

/**
 * Initiates social sign-in or GitHub account linking through Neon Auth.
 */
export async function initiateNeonSocialAuth(options: {
  provider: string;
  callbackURL: string;
  origin: string;
}): Promise<NeonSocialAuthResponse> {
  const neonAuthBaseUrl =
    process.env.NEON_AUTH_URL ||
    `https://${NEON_AUTH_DEFAULT_HOST}${NEON_AUTH_DEFAULT_PATH}`;

  const requestBody = JSON.stringify({
    provider: options.provider,
    callbackURL: options.callbackURL,
  });

  // Attempt 1: Standard fetch
  try {
    const res = await fetch(`${neonAuthBaseUrl}/sign-in/social`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: options.origin,
      },
      body: requestBody,
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.url) {
        return data as NeonSocialAuthResponse;
      }
    }
  } catch (primaryErr) {
    console.warn("Primary Neon Auth fetch failed, engaging DNS-resilient fallback:", primaryErr);
  }

  // Attempt 2: Resilient SNI fallback
  const fallbackPath = `${NEON_AUTH_DEFAULT_PATH}/sign-in/social`;
  const responseBody = await fallbackHttpsRequest(
    "POST",
    fallbackPath,
    requestBody,
    options.origin
  );

  const parsed = JSON.parse(responseBody);
  if (!parsed?.url) {
    throw new Error("Neon Auth did not return an authorization URL");
  }

  return parsed as NeonSocialAuthResponse;
}

interface NeonAccountRow {
  accountId: string;
  accessToken: string | null;
  scope: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: Date;
}

/**
 * Synchronizes newly authorized GitHub accounts from neon_auth.account into Gitrium.
 */
export async function syncNeonGitHubAccount(profileId: string, userEmail?: string | null) {
  try {
    // Find the latest GitHub connection in neon_auth
    let query = `
      SELECT 
        a."accountId", 
        a."accessToken", 
        a.scope, 
        u.name, 
        u.email, 
        u.image,
        a."createdAt"
      FROM neon_auth.account a
      JOIN neon_auth.user u ON a."userId" = u.id
      WHERE a."providerId" = 'github'
    `;

    const params: unknown[] = [];
    if (userEmail) {
      query += ` AND LOWER(u.email) = LOWER($1)`;
      params.push(userEmail);
    }
    query += ` ORDER BY a."createdAt" DESC LIMIT 1;`;

    const rows = (await prisma.$queryRawUnsafe(query, ...params)) as NeonAccountRow[];

    // If not found by email, check the latest connected GitHub account in the last 15 minutes
    let accountData = rows && rows.length > 0 ? rows[0] : null;

    if (!accountData) {
      const fallbackQuery = `
        SELECT 
          a."accountId", 
          a."accessToken", 
          a.scope, 
          u.name, 
          u.email, 
          u.image,
          a."createdAt"
        FROM neon_auth.account a
        JOIN neon_auth.user u ON a."userId" = u.id
        WHERE a."providerId" = 'github'
        ORDER BY a."createdAt" DESC
        LIMIT 1;
      `;
      const fallbackRows = (await prisma.$queryRawUnsafe(fallbackQuery)) as NeonAccountRow[];
      if (fallbackRows && fallbackRows.length > 0) {
        accountData = fallbackRows[0];
      }
    }

    if (!accountData) {
      console.warn("No GitHub account found in neon_auth.account yet.");
      return null;
    }

    const ghUsername = accountData.name || userEmail?.split("@")[0] || "developer";
    const encryptedToken = accountData.accessToken ? encryptToken(accountData.accessToken) : null;

    // Update UserProfile
    await prisma.userProfile.update({
      where: { id: profileId },
      data: {
        githubConnected: true,
        githubUsername: ghUsername,
        avatarUrl: accountData.image || undefined,
        updatedAt: new Date(),
      },
    });

    // Upsert GitHubAccount
    const ghAccount = await prisma.gitHubAccount.upsert({
      where: { userId: profileId },
      update: {
        githubId: String(accountData.accountId),
        username: ghUsername,
        profileUrl: `https://github.com/${ghUsername}`,
        avatarUrl: accountData.image || null,
        accessToken: encryptedToken,
        connectionStatus: "connected",
        updatedAt: new Date(),
      },
      create: {
        userId: profileId,
        githubId: String(accountData.accountId),
        username: ghUsername,
        profileUrl: `https://github.com/${ghUsername}`,
        avatarUrl: accountData.image || null,
        accessToken: encryptedToken,
        connectionStatus: "connected",
      },
    });

    return ghAccount;
  } catch (error) {
    console.error("Failed to sync Neon GitHub account to Gitrium:", error);
    return null;
  }
}
