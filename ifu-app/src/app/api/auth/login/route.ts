import { generators } from "openid-client";
import { NextRequest, NextResponse } from "next/server";
import {
  buildAppUrl,
  getAuthConfigurationStatus,
  getCognitoClient,
  getCognitoConfig,
} from "@/lib/auth/cognito";
import { getSafeReturnTo, setOidcChallengeCookies } from "@/lib/auth/session";
import { getRequestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestOrigin = getRequestOrigin(request);
  const status = getAuthConfigurationStatus(requestOrigin);

  if (!status.configured) {
    const loginUrl = new URL(buildAppUrl("/login", requestOrigin));
    loginUrl.searchParams.set("error", "missing_config");
    loginUrl.searchParams.set("missing", status.missing.join(","));

    return NextResponse.redirect(loginUrl);
  }

  try {
    const config = getCognitoConfig(requestOrigin);
    const client = await getCognitoClient(config);
    const state = generators.state();
    const nonce = generators.nonce();
    const authUrl = client.authorizationUrl({
      scope: config.scopes,
      state,
      nonce,
      redirect_uri: config.redirectUri,
      response_type: "code",
    });
    const response = NextResponse.redirect(authUrl);

    setOidcChallengeCookies(response, {
      state,
      nonce,
      returnTo: getSafeReturnTo(request.nextUrl.searchParams.get("returnTo")),
    });

    return response;
  } catch (error) {
    console.error("Cognito login initialization failed:", error);

    const loginUrl = new URL(buildAppUrl("/login", requestOrigin));
    loginUrl.searchParams.set("error", "auth_init_failed");

    return NextResponse.redirect(loginUrl);
  }
}
