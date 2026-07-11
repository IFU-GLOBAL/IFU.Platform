import crypto from "node:crypto";

const REFERRAL_DELETE_TOKEN_BYTES = 32;
const REFERRAL_DELETE_TOKEN_DAYS = 90;

export function hashReferralDeleteToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createReferralDeleteToken(now = new Date()) {
  const token = crypto.randomBytes(REFERRAL_DELETE_TOKEN_BYTES).toString("base64url");
  const expiresAt = new Date(now.getTime() + REFERRAL_DELETE_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  return {
    token,
    tokenHash: hashReferralDeleteToken(token),
    expiresAt,
  };
}

export function buildReferralDeleteUrl(appBaseUrl: string, token: string) {
  const url = new URL("/api/referrals/delete", appBaseUrl);
  url.searchParams.set("token", token);
  return url.toString();
}
