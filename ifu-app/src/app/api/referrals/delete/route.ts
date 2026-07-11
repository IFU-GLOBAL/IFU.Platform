import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { hashReferralDeleteToken } from "@/lib/referral-delete-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function htmlResponse(title: string, body: string, status = 200) {
  return new NextResponse(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} | IFU</title>
    <style>
      :root { color-scheme: light; font-family: Arial, sans-serif; }
      body { margin: 0; background: #f4f7f2; color: #173322; }
      main { max-width: 680px; margin: 8vh auto; padding: 32px; background: white; border: 1px solid #d8e2d4; border-radius: 8px; }
      h1 { margin: 0 0 16px; font-size: 28px; }
      p { line-height: 1.55; color: #405348; }
      button, a.button { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 18px; border: 0; border-radius: 6px; background: #14532d; color: white; font-weight: 700; text-decoration: none; cursor: pointer; }
      .muted { color: #667569; font-size: 14px; }
      form { margin-top: 24px; }
    </style>
  </head>
  <body>
    <main>${body}</main>
  </body>
</html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    },
  );
}

function invalidTokenResponse() {
  return htmlResponse(
    "Referral link unavailable",
    `<h1>Referral link unavailable</h1>
    <p>This referral deletion link is invalid, expired, or has already been used.</p>
    <p class="muted">You can still contact privacy@ifuplatform.com for help with a data deletion request.</p>`,
    404,
  );
}

function tokenWhere(token: string) {
  return {
    deleteTokenHash: hashReferralDeleteToken(token),
    deleteTokenExpiresAt: {
      gte: new Date(),
    },
  };
}

async function readPostToken(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as { token?: unknown } | null;
    return typeof body?.token === "string" ? body.token.trim() : "";
  }

  const formData = await request.formData().catch(() => null);
  const token = formData?.get("token");
  return typeof token === "string" ? token.trim() : "";
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();

  if (!token) {
    return invalidTokenResponse();
  }

  const contact = await getPrisma().recommendedContact.findFirst({
    where: tokenWhere(token),
    select: {
      email: true,
      name: true,
    },
  });

  if (!contact) {
    return invalidTokenResponse();
  }

  const label = contact.email ?? contact.name;

  return htmlResponse(
    "Delete referral record",
    `<h1>Delete IFU referral record</h1>
    <p>This will permanently delete the referred-contact record for <strong>${escapeHtml(label)}</strong>. IFU will not use this referral record to send another invitation.</p>
    <form method="post">
      <input type="hidden" name="token" value="${escapeHtml(token)}" />
      <button type="submit">Delete referral record</button>
    </form>
    <p class="muted">This action only deletes the referral contact record connected to this invitation link.</p>`,
  );
}

export async function POST(request: NextRequest) {
  const token = await readPostToken(request);
  const wantsJson = request.headers.get("accept")?.includes("application/json");

  if (!token) {
    if (wantsJson) {
      return NextResponse.json({ ok: false, error: "Invalid or missing token" }, { status: 400 });
    }

    return invalidTokenResponse();
  }

  const result = await getPrisma().recommendedContact.deleteMany({
    where: tokenWhere(token),
  });

  if (result.count === 0) {
    if (wantsJson) {
      return NextResponse.json(
        { ok: false, error: "Referral deletion link is invalid, expired, or already used" },
        { status: 404 },
      );
    }

    return invalidTokenResponse();
  }

  if (wantsJson) {
    return NextResponse.json({ ok: true, deleted: result.count });
  }

  return htmlResponse(
    "Referral record deleted",
    `<h1>Referral record deleted</h1>
    <p>The referred-contact record connected to this invitation link has been permanently deleted.</p>
    <a class="button" href="/discovery">Return to IFU Discovery</a>`,
  );
}
