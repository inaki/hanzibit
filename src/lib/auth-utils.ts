import { auth } from "./auth";
import { headers } from "next/headers";
import { DEV_USER_ID } from "./constants";

/**
 * Get the current authenticated user ID.
 * Falls back to DEV_USER_ID when no session exists (dev mode).
 */
export async function getAuthUserId(): Promise<string> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id ?? DEV_USER_ID;
  } catch {
    return DEV_USER_ID;
  }
}
