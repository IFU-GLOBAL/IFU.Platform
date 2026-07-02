import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { parsePreviewApplicationPayload } from "@/lib/preview-application";
import { sendPreviewConfirmationEmail } from "@/lib/ses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parsePreviewApplicationPayload(body);

  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const prisma = getPrisma();
  const payload = parsed.payload;

  try {
    const roles = await prisma.role.findMany({
      where: {
        slug: {
          in: payload.selectedRoleSlugs,
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
      },
    });

    const submission = await prisma.previewSubmission.create({
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone || null,
        country: payload.country || null,
        organization: payload.organization || null,
        roleOrTitle: payload.roleOrTitle || null,
        selectedRoleSlugs: payload.selectedRoleSlugs,
        leadershipInterest: payload.leadershipInterest || null,
        contributionInterests: payload.contributionInterests,
        referralSource: payload.referralSource || null,
        referralDetail: payload.referralDetail || null,
        recommendedContactName: payload.recommendedContactName || null,
        recommendedContactEmail: payload.recommendedContactEmail || null,
        recommendedContactRelationship: payload.recommendedContactRelationship || null,
        message: payload.message || null,
        roles: {
          create: roles.map((role) => ({
            role: {
              connect: {
                id: role.id,
              },
            },
          })),
        },
      },
    });

    try {
      const emailResult = await sendPreviewConfirmationEmail({
        to: payload.email,
        firstName: payload.firstName,
        selectedRoleTitles:
          roles.length > 0 ? roles.map((role) => role.title) : payload.selectedRoleSlugs,
      });

      await prisma.previewSubmission.update({
        where: { id: submission.id },
        data: {
          emailStatus: emailResult.status,
          emailMessageId: emailResult.messageId,
          emailError: emailResult.error,
        },
      });

      return NextResponse.json(
        { ok: true, id: submission.id, emailStatus: emailResult.status },
        { status: 201 },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "SES send failed";

      await prisma.previewSubmission.update({
        where: { id: submission.id },
        data: {
          emailStatus: "failed",
          emailError: message,
        },
      });

      return NextResponse.json(
        { ok: true, id: submission.id, emailStatus: "failed", emailError: message },
        { status: 201 },
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to store submission";
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : undefined;

    return NextResponse.json({ ok: false, error: message, code }, { status: 500 });
  }
}
