import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

export type AuthUser = {
  sub: string;
  username?: string;
  email?: string;
  name?: string;
  phoneNumber?: string;
};

export type AuthSession = AuthUser & {
  issuedAt: string;
  expiresAt: string;
};

type UserInfoClaims = Record<string, unknown>;

type OidcChallenge = {
  state: string;
  nonce: string;
  returnTo: string;
};

const SESSION_COOKIE = "ifu_auth_session";
const OIDC_STATE_COOKIE = "ifu_oidc_state";
const OIDC_NONCE_COOKIE = "ifu_oidc_nonce";
const OIDC_RETURN_COOKIE = "ifu_oidc_return";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
const CHALLENGE_MAX_AGE_SECONDS = 60 * 10;

const cookieDefaults = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET?.trim();

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SESSION_SECRET must be set to at least 32 characters.");
  }

  return crypto.createHash("sha256").update(secret).digest();
}

function encodeBase64Url(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));

  return Buffer.from(`${normalized}${padding}`, "base64");
}

function encryptSession(session: AuthSession) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getSessionSecret(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(session), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [iv, tag, encrypted].map(encodeBase64Url).join(".");
}

function decryptSession(value: string): AuthSession | null {
  const [ivValue, tagValue, encryptedValue] = value.split(".");

  if (!ivValue || !tagValue || !encryptedValue) {
    return null;
  }

  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      getSessionSecret(),
      decodeBase64Url(ivValue),
    );

    decipher.setAuthTag(decodeBase64Url(tagValue));

    const decrypted = Buffer.concat([
      decipher.update(decodeBase64Url(encryptedValue)),
      decipher.final(),
    ]);
    const parsed = JSON.parse(decrypted.toString("utf8")) as Partial<AuthSession>;

    if (!parsed.sub || !parsed.issuedAt || !parsed.expiresAt) {
      return null;
    }

    if (Date.parse(parsed.expiresAt) <= Date.now()) {
      return null;
    }

    return parsed as AuthSession;
  } catch {
    return null;
  }
}

function stringClaim(claims: UserInfoClaims, name: string) {
  const value = claims[name];

  return typeof value === "string" && value.trim() ? value : undefined;
}

export function createAuthSession(userInfo: UserInfoClaims): AuthSession {
  const sub = stringClaim(userInfo, "sub");

  if (!sub) {
    throw new Error("Cognito userinfo response did not include a subject claim.");
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000);

  return {
    sub,
    username:
      stringClaim(userInfo, "cognito:username") ??
      stringClaim(userInfo, "username") ??
      stringClaim(userInfo, "preferred_username"),
    email: stringClaim(userInfo, "email"),
    name: stringClaim(userInfo, "name"),
    phoneNumber: stringClaim(userInfo, "phone_number"),
    issuedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

export async function getAuthSession() {
  const cookieStore = await cookies();
  const encryptedSession = cookieStore.get(SESSION_COOKIE)?.value;

  return encryptedSession ? decryptSession(encryptedSession) : null;
}

export function setAuthSessionCookie(response: NextResponse, session: AuthSession) {
  response.cookies.set({
    ...cookieDefaults,
    name: SESSION_COOKIE,
    value: encryptSession(session),
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearAuthCookies(response: NextResponse) {
  [SESSION_COOKIE, OIDC_STATE_COOKIE, OIDC_NONCE_COOKIE, OIDC_RETURN_COOKIE].forEach((name) => {
    response.cookies.set({
      ...cookieDefaults,
      name,
      value: "",
      maxAge: 0,
    });
  });
}

export function getSafeReturnTo(value: string | null | undefined, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "https://ifu.local");
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function setOidcChallengeCookies(response: NextResponse, challenge: OidcChallenge) {
  response.cookies.set({
    ...cookieDefaults,
    name: OIDC_STATE_COOKIE,
    value: challenge.state,
    maxAge: CHALLENGE_MAX_AGE_SECONDS,
  });
  response.cookies.set({
    ...cookieDefaults,
    name: OIDC_NONCE_COOKIE,
    value: challenge.nonce,
    maxAge: CHALLENGE_MAX_AGE_SECONDS,
  });
  response.cookies.set({
    ...cookieDefaults,
    name: OIDC_RETURN_COOKIE,
    value: challenge.returnTo,
    maxAge: CHALLENGE_MAX_AGE_SECONDS,
  });
}

export function getOidcChallenge(request: NextRequest): OidcChallenge | null {
  const state = request.cookies.get(OIDC_STATE_COOKIE)?.value;
  const nonce = request.cookies.get(OIDC_NONCE_COOKIE)?.value;

  if (!state || !nonce) {
    return null;
  }

  return {
    state,
    nonce,
    returnTo: getSafeReturnTo(request.cookies.get(OIDC_RETURN_COOKIE)?.value),
  };
}
