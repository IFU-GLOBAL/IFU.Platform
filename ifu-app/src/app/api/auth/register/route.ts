import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const registerUrl = new URL("/register", request.nextUrl.origin);
  const returnTo = request.nextUrl.searchParams.get("returnTo");

  if (returnTo) {
    registerUrl.searchParams.set("returnTo", returnTo);
  }

  return NextResponse.redirect(registerUrl);
}
