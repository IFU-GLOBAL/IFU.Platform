import { NextRequest, NextResponse } from "next/server";
import {
  buildAppUrl,
  buildCognitoLogoutUrl,
  getAuthConfigurationStatus,
  getCognitoConfig,
} from "@/lib/auth/cognito";
import { clearAuthCookies } from "@/lib/auth/session";
import { getRequestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestOrigin = getRequestOrigin(request);
  const status = getAuthConfigurationStatus(requestOrigin);
  const logoutUrl = status.configured
    ? buildCognitoLogoutUrl(getCognitoConfig(requestOrigin))
    : buildAppUrl("/", requestOrigin);
  const response = NextResponse.redirect(logoutUrl);

  clearAuthCookies(response);

  return response;
}
