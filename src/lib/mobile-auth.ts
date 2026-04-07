import { auth } from "./auth";
import type { NextRequest } from "next/server";

/**
 * Extract the authenticated user ID from a mobile API request.
 * Accepts both cookie-based sessions (web) and Bearer token sessions (mobile).
 * Returns null if the request is unauthenticated.
 */
export async function getMobileUserId(req: NextRequest): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
