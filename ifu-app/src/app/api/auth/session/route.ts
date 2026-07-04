import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      sub: session.sub,
      username: session.username,
      email: session.email,
      name: session.name,
      phoneNumber: session.phoneNumber,
    },
  });
}
