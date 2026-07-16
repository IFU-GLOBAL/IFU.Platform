import { NextRequest, NextResponse } from "next/server";
import { getRequestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    code: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { code } = await context.params;
  const registerUrl = new URL("/register", getRequestOrigin(request));

  registerUrl.searchParams.set("inv", code);

  for (const [key, value] of request.nextUrl.searchParams.entries()) {
    if (key.startsWith("utm_")) {
      registerUrl.searchParams.set(key, value);
    }
  }

  return NextResponse.redirect(registerUrl);
}
