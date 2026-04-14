import { NextRequest, NextResponse } from "next/server";
import {
  REFERRAL_COOKIE_NAME,
  getReferralCodeByCode,
  normalizeReferralCode,
} from "@/lib/referrals";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const normalized = normalizeReferralCode(code);
  const referralCode = await getReferralCodeByCode(normalized);
  const redirectUrl = new URL(`/auth/signup${normalized ? `?ref=${encodeURIComponent(normalized)}` : ""}`, req.url);

  const res = NextResponse.redirect(redirectUrl);

  if (referralCode) {
    res.cookies.set({
      name: REFERRAL_COOKIE_NAME,
      value: referralCode.code,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return res;
}
