import { NextRequest, NextResponse } from "next/server";
import { buildAppUrl, getCognitoClient, getCognitoConfig } from "@/lib/auth/cognito";
import {
  clearAuthCookies,
  createAuthSession,
  getOidcChallenge,
  setAuthSessionCookie,
} from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectToLogin(request: NextRequest, error: string) {
  const loginUrl = new URL(buildAppUrl("/login", request.nextUrl.origin));
  loginUrl.searchParams.set("error", error);
  const response = NextResponse.redirect(loginUrl);

  clearAuthCookies(response);

  return response;
}

export async function GET(request: NextRequest) {
  const challenge = getOidcChallenge(request);

  if (!challenge) {
    return redirectToLogin(request, "missing_challenge");
  }

  if (request.nextUrl.searchParams.has("error")) {
    return redirectToLogin(
      request,
      request.nextUrl.searchParams.get("error") ?? "cognito_error",
    );
  }

  try {
    const config = getCognitoConfig(request.nextUrl.origin);
    const client = await getCognitoClient(config);
    const params = client.callbackParams(request.url);
    const tokenSet = await client.callback(config.redirectUri, params, {
      nonce: challenge.nonce,
      state: challenge.state,
    });
    const userInfo = await client.userinfo(tokenSet.access_token ?? tokenSet);
    const session = createAuthSession(userInfo);
    const response = NextResponse.redirect(
      new URL(challenge.returnTo, buildAppUrl("/", request.nextUrl.origin)),
    );

    clearAuthCookies(response);
    setAuthSessionCookie(response, session);

    return response;
  } catch (error) {
    console.error("Cognito callback failed:", error);

    return redirectToLogin(request, "callback_failed");
  }
}
