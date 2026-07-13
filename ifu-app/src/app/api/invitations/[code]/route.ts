import { NextResponse } from "next/server";
import { validateInvitationCode } from "@/lib/invitations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    code: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { code } = await context.params;
  const result = await validateInvitationCode(code);

  return NextResponse.json({ ok: true, ...result });
}
