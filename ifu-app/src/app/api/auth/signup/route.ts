import {
  CodeDeliveryFailureException,
  InvalidPasswordException,
  InvalidParameterException,
  NotAuthorizedException,
  UsernameExistsException,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextResponse } from "next/server";
import { signUpCognitoUser } from "@/lib/auth/cognito-user-pool";
import { createAuthSession, setAuthSessionCookie } from "@/lib/auth/session";
import { finalizeUserAcquisition } from "@/lib/invitations";
import { getPrisma } from "@/lib/prisma";
import { parseRegistrationPayload } from "@/lib/registration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cognitoErrorMessage(error: unknown) {
  const errorCode = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code)
    : null;

  if (error instanceof UsernameExistsException) {
    return { status: 409, message: "An account already exists for this email address" };
  }

  if (error instanceof InvalidPasswordException) {
    return { status: 400, message: error.message || "Password does not meet Cognito policy" };
  }

  if (error instanceof InvalidParameterException) {
    return { status: 400, message: error.message || "Registration details are invalid" };
  }

  if (error instanceof CodeDeliveryFailureException) {
    return { status: 502, message: "Cognito created the user but could not send the confirmation code" };
  }

  if (error instanceof NotAuthorizedException) {
    return { status: 500, message: "Cognito app client is not authorized for signup" };
  }

  if (errorCode === "P1000" || errorCode === "P1001") {
    return {
      status: 503,
      message: "The registration database is not reachable with the configured credentials.",
    };
  }

  return {
    status: 500,
    message: "Unable to create account.",
  };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseRegistrationPayload(body);

  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  try {
    const payload = parsed.payload;
    const prisma = getPrisma();
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { ok: false, error: "An account already exists for this email address" },
        { status: 409 },
      );
    }

    const roles = payload.selectedRoleSlugs.length
      ? await prisma.role.findMany({
          where: {
            slug: {
              in: payload.selectedRoleSlugs,
            },
          },
          select: {
            id: true,
            slug: true,
            categoryId: true,
          },
        })
      : [];
    type SelectedRole = (typeof roles)[number];
    const rolesBySlug = new Map(roles.map((role) => [role.slug, role]));
    const orderedRoles = payload.selectedRoleSlugs
      .map((slug) => rolesBySlug.get(slug))
      .filter((role): role is SelectedRole => Boolean(role));
    const primaryRole = orderedRoles[0];

    if (payload.selectedRoleSlugs.length > 0 && orderedRoles.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Selected IFU roles were not found. Refresh Discovery and try again." },
        { status: 400 },
      );
    }

    const cognitoResult = await signUpCognitoUser({
      email: payload.email,
      password: payload.password,
      firstName: payload.firstName,
      lastName: payload.lastName,
    });
    const fullName = `${payload.firstName} ${payload.lastName}`.trim();
    const now = new Date();

    await prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          cognitoId: cognitoResult.userSub,
          email: payload.email,
          fullName,
          firstName: payload.firstName,
          lastName: payload.lastName,
          termsAccepted: true,
          termsAcceptedAt: now,
          marketingOptIn: payload.marketingOptIn,
          marketingOptInAt: payload.marketingOptIn ? now : null,
          ageConfirmedAt: now,
          profile: {
            create: {
              primaryRoleId: primaryRole?.id,
              primaryCategoryId: primaryRole?.categoryId,
              profileCompletion: primaryRole ? 40 : 20,
            },
          },
        },
      });

      if (orderedRoles.length > 0) {
        await transaction.userSelectedRole.createMany({
          data: orderedRoles.map((role, index) => ({
            userId: user.id,
            roleId: role.id,
            isPrimary: index === 0,
          })),
          skipDuplicates: true,
        });
      }

      await finalizeUserAcquisition(transaction, {
        userId: user.id,
        email: payload.email,
        invitationCode: payload.invitationCode,
        allowEmailFallback: false,
        selfReportedSource: payload.selfReportedSource,
        selfReportedDetail: payload.selfReportedDetail,
        utmSource: payload.utmSource,
        utmCampaign: payload.utmCampaign,
        utmMedium: payload.utmMedium,
        firstTouchUrl: payload.firstTouchUrl,
      });
    });

    const session = createAuthSession({
      sub: cognitoResult.userSub,
      email: payload.email,
      name: fullName,
      username: payload.email,
    });
    const response = NextResponse.json(
      {
        ok: true,
        email: payload.email,
        confirmed: cognitoResult.confirmed,
        redirectTo: "/dashboard",
        delivery: cognitoResult.delivery
          ? {
              destination: cognitoResult.delivery.Destination,
              medium: cognitoResult.delivery.DeliveryMedium,
              attribute: cognitoResult.delivery.AttributeName,
            }
          : null,
      },
      { status: 201 },
    );

    setAuthSessionCookie(response, session);

    return response;
  } catch (error) {
    console.error("Cognito signup failed:", error);
    const mapped = cognitoErrorMessage(error);

    return NextResponse.json({ ok: false, error: mapped.message }, { status: mapped.status });
  }
}
