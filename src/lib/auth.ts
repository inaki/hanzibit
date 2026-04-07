import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { getPool } from "./db";
import { sendPasswordResetEmail } from "./email";

function getTrustedOrigins() {
  const candidates = [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3000",
  ].filter(Boolean) as string[];

  const origins = new Set<string>();

  for (const value of candidates) {
    try {
      const url = new URL(value);
      origins.add(url.origin);

      if (url.hostname.startsWith("www.")) {
        origins.add(`${url.protocol}//${url.hostname.replace(/^www\./, "")}`);
      } else {
        origins.add(`${url.protocol}//www.${url.hostname}`);
      }
    } catch {
      // Ignore malformed env values and keep the explicit defaults.
    }
  }

  return Array.from(origins);
}

export const auth = betterAuth({
  database: getPool(),
  trustedOrigins: getTrustedOrigins(),
  plugins: [bearer()],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      void sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl: url,
      });
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
});
