import { generators } from "openid-client";
import { NextRequest, NextResponse } from "next/server";
import {
  buildAppUrl,
  getAuthConfigurationStatus,
  getCognitoConfig,
} from "@/lib/auth/cognito";
import { getSafeReturnTo, setOidcChallengeCookies } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const status = getAuthConfigurationStatus(request.nextUrl.origin);

  if (!status.configured) {
    const loginUrl = new URL(buildAppUrl("/login", request.nextUrl.origin));
    loginUrl.searchParams.set("error", "missing_config");
    loginUrl.searchParams.set("missing", status.missing.join(","));

    return NextResponse.redirect(loginUrl);
  }

  try {
    const config = getCognitoConfig(request.nextUrl.origin);

    if (!config.userPoolDomain) {
      throw new Error("COGNITO_DOMAIN is required for Cognito signup.");
    }

    const state = generators.state();
    const nonce = generators.nonce();
    const signupUrl = new URL(`${config.userPoolDomain}/signup`);

    signupUrl.searchParams.set("client_id", config.clientId);
    signupUrl.searchParams.set("scope", config.scopes);
    signupUrl.searchParams.set("response_type", "code");
    signupUrl.searchParams.set("redirect_uri", config.redirectUri);
    signupUrl.searchParams.set("state", state);
    signupUrl.searchParams.set("nonce", nonce);

    const response = NextResponse.redirect(signupUrl);

    setOidcChallengeCookies(response, {
      state,
      nonce,
      returnTo: getSafeReturnTo(request.nextUrl.searchParams.get("returnTo")),
    });

    return response;
  } catch (error) {
    console.error("Cognito signup initialization failed:", error);

    const loginUrl = new URL(buildAppUrl("/login", request.nextUrl.origin));
    loginUrl.searchParams.set("error", "auth_init_failed");

    return NextResponse.redirect(loginUrl);
  }
}
