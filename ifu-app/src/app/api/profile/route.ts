import { NextRequest, NextResponse } from "next/server";
import { DashboardItemType } from "@/generated/prisma/enums";
import { getAuthSession } from "@/lib/auth/session";
import { syncAuthenticatedUser } from "@/lib/dashboardData";
import { getPrisma } from "@/lib/prisma";
import { mergeProfileCompletion } from "@/lib/profile-completion";

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
  const phone = cleanString(body.phone, 40);
  const preferredLanguage = cleanString(body.preferredLanguage, 80);
  const timezone = cleanString(body.timezone, 80);
  const primaryCropsLivestock = cleanStringArray(body.primaryCropsLivestock, 5);
  const farmSizeBand = cleanString(body.farmSizeBand, 40);
  const goals = cleanString(body.goals, 600);
  const hasInterests = Array.isArray(body.interests);
  const interests = cleanStringArray(body.interests, 12);
  const selectedRoleSlugs = cleanStringArray(body.selectedRoleSlugs, 12);

  if (selectedRoleSlugs.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Select one IFU role before saving your profile." },
      { status: 400 },
    );
  }

  if (selectedRoleSlugs.length > 1) {
    return NextResponse.json(
      { ok: false, error: "Your profile can have only one IFU role." },
      { status: 400 },
    );
  }

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
  const primaryRole = orderedRoles[0];

  if (!primaryRole) {
    return NextResponse.json(
      { ok: false, error: "Select a valid IFU role before saving your profile." },
      { status: 400 },
    );
  }

  const profileCompletion = mergeProfileCompletion(
    user.profile?.profileCompletion,
    {
      selectedRoleCount: selectedRoleSlugs.length,
      country,
      stateProvince,
      city,
      organization,
      preferredLanguage,
      interestCount: interests.length,
      timezone,
      cropLivestockCount: primaryCropsLivestock.length,
      farmSizeBand,
      goals,
    },
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
        phone: phone || null,
        preferredLanguage: preferredLanguage || null,
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
        phone: phone || null,
        preferredLanguage: preferredLanguage || null,
        interests,
        primaryCropsLivestock,
        farmSizeBand: farmSizeBand || null,
        goals: goals || null,
        primaryRoleId: primaryRole?.id,
        primaryCategoryId: primaryRole?.categoryId,
        profileCompletion,
      },
    });

    await transaction.userSelectedRole.deleteMany({
      where: { userId: user.id },
    });
    await transaction.userSelectedRole.create({
      data: {
        userId: user.id,
        roleId: primaryRole.id,
        isPrimary: true,
      },
    });
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
