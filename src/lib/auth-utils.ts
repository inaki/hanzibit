import { auth } from "./auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DEV_USER_ID } from "./constants";

export async function getAuthUserId(): Promise<string> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user?.id) return session.user.id;
  } catch {
    // session check failed
  }

  if (process.env.NODE_ENV === "development") return DEV_USER_ID;

  redirect("/auth/signin");
}
