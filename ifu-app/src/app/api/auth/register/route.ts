import { NextRequest, NextResponse } from "next/server";
import { getRequestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const registerUrl = new URL("/register", getRequestOrigin(request));
  const returnTo = request.nextUrl.searchParams.get("returnTo");

  if (returnTo) {
    registerUrl.searchParams.set("returnTo", returnTo);
  }

  return NextResponse.redirect(registerUrl);
}
