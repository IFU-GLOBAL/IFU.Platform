import { NextRequest, NextResponse } from "next/server";
import { buildInvitationLink, createInvitation } from "@/lib/invitations";
import { getRequestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanString(value: unknown, maxLength = 160) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseExpiresAt(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  if (cleanString(body.website)) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const invitation = await createInvitation({
    name: cleanString(body.name),
    email: cleanString(body.email),
    phone: cleanString(body.phone),
    country: cleanString(body.country),
    suggestedRole: cleanString(body.suggestedRole),
    invitedBy: cleanString(body.invitedBy),
    channel: cleanString(body.channel) || "copy_link",
    expiresAt: parseExpiresAt(body.expiresAt),
  });

  return NextResponse.json(
    {
      ok: true,
      invitation: {
        code: invitation.code,
        link: buildInvitationLink(invitation.code, getRequestOrigin(request)),
        expiresAt: invitation.expiresAt.toISOString(),
        channel: invitation.channel,
      },
    },
    { status: 201 },
  );
}
