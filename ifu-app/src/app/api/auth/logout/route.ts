import { NextRequest, NextResponse } from "next/server";
import {
  buildAppUrl,
  buildCognitoLogoutUrl,
  getAuthConfigurationStatus,
  getCognitoConfig,
} from "@/lib/auth/cognito";
import { clearAuthCookies } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const status = getAuthConfigurationStatus(request.nextUrl.origin);
  const logoutUrl = status.configured
    ? buildCognitoLogoutUrl(getCognitoConfig(request.nextUrl.origin))
    : buildAppUrl("/login?signedOut=1", request.nextUrl.origin);
  const response = NextResponse.redirect(logoutUrl);

  clearAuthCookies(response);

  return response;
}
