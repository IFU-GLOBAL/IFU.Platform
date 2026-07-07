import { NextRequest, NextResponse } from "next/server";
import { getSafeReturnTo, setAuthSessionCookie, type AuthSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date();
  const session: AuthSession = {
    sub: "local-dashboard-preview",
    username: "local-dashboard-preview",
    email: "local@internationalfarmunion.com",
    name: "Local IFU Member",
    issuedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
  };
  const returnTo = getSafeReturnTo(request.nextUrl.searchParams.get("returnTo"));
  const response = NextResponse.redirect(new URL(returnTo, request.url));

  setAuthSessionCookie(response, session);

  return response;
}
