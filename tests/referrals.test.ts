import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateReferralCommissionAmount,
  normalizeReferralCode,
} from "../src/lib/referrals";

test("normalizes referral codes to uppercase alphanumeric values", () => {
  assert.equal(normalizeReferralCode(" ai-4 love "), "AI4LOVE");
});

test("calculates referral commission from cents", () => {
  assert.equal(calculateReferralCommissionAmount(1200, 0.25), 300);
});
