import { NextRequest, NextResponse } from "next/server";
import { DashboardItemType } from "@/generated/prisma/enums";
import { getAuthSession } from "@/lib/auth/session";
import { syncAuthenticatedUser } from "@/lib/dashboardData";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanString(value: unknown, maxLength = 160) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanStringArray(value: unknown, maxItems = 24) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(new Set(
    value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean),
  )).slice(0, maxItems);
}

function computeProfileCompletion(input: {
  country: string;
  stateProvince: string;
  city: string;
  organization: string;
  timezone: string;
  cropLivestockCount: number;
  farmSizeBand: string;
  goals: string;
}) {
  const fields = [
    input.country,
    input.stateProvince,
    input.city,
    input.organization,
    input.timezone,
    input.cropLivestockCount > 0 ? "crops" : "",
    input.farmSizeBand,
    input.goals,
  ];
  const completed = fields.filter(Boolean).length;

  return Math.max(20, Math.round((completed / fields.length) * 100));
}

export async function POST(request: NextRequest) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const country = cleanString(body.country);
  const stateProvince = cleanString(body.stateProvince);
  const city = cleanString(body.city);
  const organization = cleanString(body.organization);
  const timezone = cleanString(body.timezone, 80);
  const primaryCropsLivestock = cleanStringArray(body.primaryCropsLivestock, 5);
  const farmSizeBand = cleanString(body.farmSizeBand, 40);
  const goals = cleanString(body.goals, 600);
  const hasInterests = Array.isArray(body.interests);
  const interests = cleanStringArray(body.interests, 12);
  const selectedRoleSlugs = cleanStringArray(body.selectedRoleSlugs, 12);

  const prisma = getPrisma();
  const user = await syncAuthenticatedUser(session);
  const roles = selectedRoleSlugs.length
    ? await prisma.role.findMany({
        where: {
          slug: {
            in: selectedRoleSlugs,
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
  const orderedRoles = selectedRoleSlugs
    .map((slug) => rolesBySlug.get(slug))
    .filter((role): role is SelectedRole => Boolean(role));

  if (selectedRoleSlugs.length > 0 && orderedRoles.length === 0) {
    return NextResponse.json({ ok: false, error: "Selected roles were not found" }, { status: 400 });
  }

  const primaryRole = orderedRoles[0];
  const profileCompletion = Math.max(
    user.profile?.profileCompletion ?? 0,
    computeProfileCompletion({
      country,
      stateProvince,
      city,
      organization,
      timezone,
      cropLivestockCount: primaryCropsLivestock.length,
      farmSizeBand,
      goals,
    }),
  );

  await prisma.$transaction(async (transaction) => {
    await transaction.userProfile.upsert({
      where: { userId: user.id },
      update: {
        country: country || undefined,
        stateProvince: stateProvince || null,
        city: city || null,
        region: country || undefined,
        timezone: timezone || undefined,
        organization: organization || null,
        interests: hasInterests ? interests : undefined,
        primaryCropsLivestock,
        farmSizeBand: farmSizeBand || null,
        goals: goals || null,
        primaryRoleId: primaryRole?.id,
        primaryCategoryId: primaryRole?.categoryId,
        profileCompletion,
      },
      create: {
        userId: user.id,
        country: country || null,
        stateProvince: stateProvince || null,
        city: city || null,
        region: country || "Global IFU Network",
        timezone: timezone || "America/New_York",
        organization: organization || null,
        interests,
        primaryCropsLivestock,
        farmSizeBand: farmSizeBand || null,
        goals: goals || null,
        primaryRoleId: primaryRole?.id,
        primaryCategoryId: primaryRole?.categoryId,
        profileCompletion,
      },
    });

    if (orderedRoles.length > 0) {
      await transaction.userSelectedRole.deleteMany({
        where: { userId: user.id },
      });
      await transaction.userSelectedRole.createMany({
        data: orderedRoles.map((role, index) => ({
          userId: user.id,
          roleId: role.id,
          isPrimary: index === 0,
        })),
        skipDuplicates: true,
      });
    }
  });

  const workspaceUpdate = await prisma.workspaceItem.updateMany({
    where: {
      userId: user.id,
      title: "Complete location and role profile",
    },
    data: {
      status: profileCompletion >= 60 ? "COMPLETED" : "ACTIVE",
      progress: profileCompletion,
    },
  });

  if (workspaceUpdate.count === 0) {
    await prisma.workspaceItem.create({
      data: {
        userId: user.id,
        title: "Complete location and role profile",
        itemType: DashboardItemType.RESOURCE,
        status: profileCompletion >= 60 ? "COMPLETED" : "ACTIVE",
        progress: profileCompletion,
        notes: "Profile updated from the post-login progressive profile form.",
      },
    });
  }

  return NextResponse.json({ ok: true, profileCompletion });
}
