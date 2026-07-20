import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "ifu_auth_session";
const AGRISPHERE_DASHBOARD_PATH = "/dashboard?section=agrisphere-dashboard";

export function middleware(request: NextRequest) {
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (hasSessionCookie) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "?section=agrisphere-dashboard";

    return NextResponse.redirect(dashboardUrl);
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("returnTo", AGRISPHERE_DASHBOARD_PATH);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/agrisphere", "/agrisphere/"],
};
