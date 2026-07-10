import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { parsePreviewApplicationPayload } from "@/lib/preview-application";
import {
  sendPreviewConfirmationEmail,
  sendReferralInvitationEmail,
} from "@/lib/ses";

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

  if ("spam" in parsed && parsed.spam) {
    return NextResponse.json({ ok: true, emailStatus: "skipped" }, { status: 201 });
  }

  const prisma = getPrisma();
  const payload = parsed.payload;
  const now = new Date();
  const deleteAfter = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const appBaseUrl =
    process.env.APP_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://ifuplatform.com";

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
        privacyConsentAccepted: payload.privacyConsent,
        privacyConsentAcceptedAt: payload.privacyConsent ? now : null,
        referralConsentAccepted: payload.referralConsent,
        referralConsentAcceptedAt: payload.referralConsent ? now : null,
        roles: {
          create: roles.map((role) => ({
            role: {
              connect: {
                id: role.id,
              },
            },
          })),
        },
        recommendedContacts: payload.recommendedContactEmail
          ? {
              create: {
                name:
                  payload.recommendedContactName ||
                  payload.recommendedContactEmail,
                email: payload.recommendedContactEmail,
                relationship: payload.recommendedContactRelationship || null,
                consentConfirmed: payload.referralConsent,
                consentConfirmedAt: payload.referralConsent ? now : null,
                deleteAfter,
              },
            }
          : undefined,
        referralSources:
          payload.referralSource || payload.referralDetail
            ? {
                create: {
                  source: payload.referralSource || "Unspecified",
                  detail: payload.referralDetail || null,
                },
              }
            : undefined,
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

      if (payload.recommendedContactEmail && payload.referralConsent) {
        try {
          const referralEmailResult = await sendReferralInvitationEmail({
            to: payload.recommendedContactEmail,
            referredName: payload.recommendedContactName,
            referrerName: `${payload.firstName} ${payload.lastName}`.trim(),
            discoveryUrl: `${appBaseUrl}/discovery`,
            deleteUrl: `${appBaseUrl}/privacy#delete-request`,
          });

          await prisma.recommendedContact.updateMany({
            where: {
              previewSubmissionId: submission.id,
              email: payload.recommendedContactEmail,
            },
            data: {
              oneTimeInviteStatus: referralEmailResult.status,
              oneTimeInviteMessageId: referralEmailResult.messageId,
              oneTimeInviteError: referralEmailResult.error,
              oneTimeInviteSentAt:
                referralEmailResult.status === "sent" ? new Date() : null,
            },
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Referral email send failed";

          await prisma.recommendedContact.updateMany({
            where: {
              previewSubmissionId: submission.id,
              email: payload.recommendedContactEmail,
            },
            data: {
              oneTimeInviteStatus: "failed",
              oneTimeInviteError: message,
            },
          });
        }
      }

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
