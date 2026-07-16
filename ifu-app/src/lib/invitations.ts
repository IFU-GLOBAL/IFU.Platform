import crypto from "crypto";
import type { Invitation, Prisma } from "@/generated/prisma/client";
import { AcquisitionSource, InvitationStatus } from "@/generated/prisma/enums";
import { getPrisma } from "@/lib/prisma";

export const INVITATION_TTL_DAYS = 90;

const INVITATION_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

type InvitationClient = Prisma.TransactionClient;

export type InvitationInput = {
  code?: string;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  suggestedRole?: string;
  invitedBy?: string;
  channel?: string;
  expiresAt?: Date;
  metadata?: Prisma.InputJsonValue;
};

export type AcquisitionAttributionInput = {
  userId: string;
  email?: string;
  invitationCode?: string;
  allowEmailFallback?: boolean;
  selfReportedSource?: string;
  selfReportedDetail?: string;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  firstTouchUrl?: string;
  metadata?: Prisma.InputJsonValue;
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function cleanString(value: unknown, maxLength = 160) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function normalizeEmail(value: unknown) {
  return cleanString(value, 160).toLowerCase() || null;
}

export function normalizePhone(value: unknown) {
  const raw = cleanString(value, 40);
  if (!raw) {
    return null;
  }

  const hasLeadingPlus = raw.trim().startsWith("+");
  const digits = raw.replace(/[^\d]/g, "");

  if (!digits) {
    return null;
  }

  return hasLeadingPlus ? `+${digits}` : digits;
}

export function normalizeInvitationCode(value: unknown) {
  return cleanString(value, 48).toUpperCase().replace(/\s+/g, "");
}

export function normalizeInvitationChannel(value: unknown) {
  const channel = cleanString(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return channel || "copy_link";
}

export function generateInvitationCode(prefix = "IFU") {
  const bytes = crypto.randomBytes(8);
  let token = "";

  for (let index = 0; index < 10; index += 1) {
    token += INVITATION_CODE_ALPHABET[bytes[index % bytes.length] % INVITATION_CODE_ALPHABET.length];
  }

  return `${prefix}-${token}`;
}

export function buildInvitationLink(code: string, origin?: string | null) {
  const baseUrl = (origin ?? process.env.APP_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");

  if (!baseUrl) {
    return `/i/${encodeURIComponent(code)}`;
  }

  return `${baseUrl}/i/${encodeURIComponent(code)}`;
}

export function splitInviteeName(name?: string | null) {
  const cleaned = cleanString(name, 160);

  if (!cleaned) {
    return { firstName: "", lastName: "" };
  }

  const [firstName, ...rest] = cleaned.split(/\s+/);

  return {
    firstName,
    lastName: rest.join(" "),
  };
}

function isInvitationOpen(invitation: Invitation, now = new Date()) {
  return (
    (invitation.status === InvitationStatus.PENDING || invitation.status === InvitationStatus.OPENED) &&
    invitation.expiresAt > now
  );
}

function safeInvitation(invitation: Invitation) {
  const name = splitInviteeName(invitation.name);

  return {
    code: invitation.code,
    name: invitation.name,
    firstName: name.firstName,
    lastName: name.lastName,
    email: invitation.email,
    country: invitation.country,
    suggestedRole: invitation.suggestedRole,
    invitedBy: invitation.invitedBy,
    channel: invitation.channel,
    expiresAt: invitation.expiresAt.toISOString(),
  };
}

export async function createInvitation(input: InvitationInput = {}) {
  const prisma = getPrisma();

  return prisma.$transaction(async (transaction) => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const code = normalizeInvitationCode(input.code) || generateInvitationCode();

      try {
        return await transaction.invitation.create({
          data: {
            code,
            name: cleanString(input.name, 160) || null,
            email: normalizeEmail(input.email),
            normalizedEmail: normalizeEmail(input.email),
            phone: cleanString(input.phone, 40) || null,
            normalizedPhone: normalizePhone(input.phone),
            country: cleanString(input.country, 100) || null,
            suggestedRole: cleanString(input.suggestedRole, 120) || null,
            invitedBy: cleanString(input.invitedBy, 160) || null,
            channel: normalizeInvitationChannel(input.channel),
            expiresAt: input.expiresAt ?? addDays(new Date(), INVITATION_TTL_DAYS),
            metadata: input.metadata,
          },
        });
      } catch (error) {
        const maybePrismaError = error as { code?: string };

        if (maybePrismaError.code !== "P2002" || input.code) {
          throw error;
        }
      }
    }

    throw new Error("Unable to generate a unique invitation code.");
  });
}

export async function validateInvitationCode(codeInput: string) {
  const code = normalizeInvitationCode(codeInput);

  if (!code) {
    return { mode: "organic" as const, reason: "missing_code" };
  }

  const prisma = getPrisma();

  return prisma.$transaction(async (transaction) => {
    const invitation = await transaction.invitation.findUnique({
      where: { code },
    });

    if (!invitation) {
      return { mode: "organic" as const, reason: "not_found" };
    }

    const now = new Date();

    if (invitation.expiresAt <= now) {
      if (invitation.status === InvitationStatus.PENDING || invitation.status === InvitationStatus.OPENED) {
        await transaction.invitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.EXPIRED },
        });
      }

      return { mode: "organic" as const, reason: "expired" };
    }

    if (!isInvitationOpen(invitation, now)) {
      return { mode: "organic" as const, reason: invitation.status.toLowerCase() };
    }

    const openedInvitation =
      invitation.status === InvitationStatus.PENDING || !invitation.openedAt
        ? await transaction.invitation.update({
            where: { id: invitation.id },
            data: {
              status: InvitationStatus.OPENED,
              openedAt: invitation.openedAt ?? now,
            },
          })
        : invitation;

    return {
      mode: "invited" as const,
      invitation: safeInvitation(openedInvitation),
    };
  });
}

async function findInvitationForAttribution(
  transaction: InvitationClient,
  input: Pick<AcquisitionAttributionInput, "email" | "invitationCode" | "allowEmailFallback">,
) {
  const code = normalizeInvitationCode(input.invitationCode);
  const normalizedEmail = normalizeEmail(input.email);
  const now = new Date();

  if (code) {
    const invitation = await transaction.invitation.findUnique({
      where: { code },
    });

    if (invitation && isInvitationOpen(invitation, now)) {
      return invitation;
    }

    if (
      invitation &&
      invitation.expiresAt <= now &&
      (invitation.status === InvitationStatus.PENDING || invitation.status === InvitationStatus.OPENED)
    ) {
      await transaction.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
    }
  }

  if (!input.allowEmailFallback || !normalizedEmail) {
    return null;
  }

  return transaction.invitation.findFirst({
    where: {
      normalizedEmail,
      status: {
        in: [InvitationStatus.PENDING, InvitationStatus.OPENED],
      },
      expiresAt: {
        gt: now,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function finalizeUserAcquisition(
  transaction: InvitationClient,
  input: AcquisitionAttributionInput,
) {
  const invitation = await findInvitationForAttribution(transaction, input);
  const existing = await transaction.userAcquisition.findUnique({
    where: { userId: input.userId },
  });

  if (invitation) {
    const now = new Date();

    await transaction.invitation.update({
      where: { id: invitation.id },
      data: {
        status: InvitationStatus.REGISTERED,
        registeredAt: invitation.registeredAt ?? now,
        registeredUserId: input.userId,
      },
    });

    return transaction.userAcquisition.upsert({
      where: { userId: input.userId },
      update: {
        source: AcquisitionSource.INVITATION,
        invitationId: invitation.id,
        invitedBy: invitation.invitedBy,
        inviteChannel: invitation.channel,
        selfReportedSource: cleanString(input.selfReportedSource, 120) || undefined,
        selfReportedDetail: cleanString(input.selfReportedDetail, 300) || undefined,
        utmSource: cleanString(input.utmSource, 120) || undefined,
        utmCampaign: cleanString(input.utmCampaign, 120) || undefined,
        utmMedium: cleanString(input.utmMedium, 120) || undefined,
        firstTouchUrl: cleanString(input.firstTouchUrl, 300) || undefined,
        metadata: input.metadata ?? undefined,
      },
      create: {
        userId: input.userId,
        source: AcquisitionSource.INVITATION,
        invitationId: invitation.id,
        invitedBy: invitation.invitedBy,
        inviteChannel: invitation.channel,
        selfReportedSource: cleanString(input.selfReportedSource, 120) || null,
        selfReportedDetail: cleanString(input.selfReportedDetail, 300) || null,
        utmSource: cleanString(input.utmSource, 120) || null,
        utmCampaign: cleanString(input.utmCampaign, 120) || null,
        utmMedium: cleanString(input.utmMedium, 120) || null,
        firstTouchUrl: cleanString(input.firstTouchUrl, 300) || null,
        metadata: input.metadata,
      },
    });
  }

  if (existing?.source === AcquisitionSource.INVITATION) {
    return existing;
  }

  return transaction.userAcquisition.upsert({
    where: { userId: input.userId },
    update: {
      source: AcquisitionSource.ORGANIC,
      selfReportedSource: cleanString(input.selfReportedSource, 120) || undefined,
      selfReportedDetail: cleanString(input.selfReportedDetail, 300) || undefined,
      utmSource: cleanString(input.utmSource, 120) || undefined,
      utmCampaign: cleanString(input.utmCampaign, 120) || undefined,
      utmMedium: cleanString(input.utmMedium, 120) || undefined,
      firstTouchUrl: cleanString(input.firstTouchUrl, 300) || undefined,
      metadata: input.metadata ?? undefined,
    },
    create: {
      userId: input.userId,
      source: AcquisitionSource.ORGANIC,
      selfReportedSource: cleanString(input.selfReportedSource, 120) || null,
      selfReportedDetail: cleanString(input.selfReportedDetail, 300) || null,
      utmSource: cleanString(input.utmSource, 120) || null,
      utmCampaign: cleanString(input.utmCampaign, 120) || null,
      utmMedium: cleanString(input.utmMedium, 120) || null,
      firstTouchUrl: cleanString(input.firstTouchUrl, 300) || null,
      metadata: input.metadata,
    },
  });
}
