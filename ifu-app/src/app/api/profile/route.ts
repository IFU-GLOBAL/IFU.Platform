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
  fullName: string;
  phone: string;
  country: string;
  stateProvince: string;
  city: string;
  organization: string;
  timezone: string;
  selectedRoleCount: number;
  interestCount: number;
}) {
  const fields = [
    input.fullName,
    input.phone,
    input.country,
    input.stateProvince,
    input.city,
    input.organization,
    input.timezone,
    input.selectedRoleCount > 0 ? "roles" : "",
    input.interestCount > 0 ? "interests" : "",
  ];
  const completed = fields.filter(Boolean).length;

  return Math.round((completed / fields.length) * 100);
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

  const fullName = cleanString(body.fullName);
  const phone = cleanString(body.phone, 40);
  const country = cleanString(body.country);
  const stateProvince = cleanString(body.stateProvince);
  const city = cleanString(body.city);
  const organization = cleanString(body.organization);
  const timezone = cleanString(body.timezone, 80) || "America/New_York";
  const interests = cleanStringArray(body.interests, 12);
  const selectedRoleSlugs = cleanStringArray(body.selectedRoleSlugs, 12);

  if (!fullName) {
    return NextResponse.json({ ok: false, error: "Full name is required" }, { status: 400 });
  }

  if (!country) {
    return NextResponse.json({ ok: false, error: "Country is required" }, { status: 400 });
  }

  if (selectedRoleSlugs.length === 0) {
    return NextResponse.json({ ok: false, error: "Select at least one IFU role" }, { status: 400 });
  }

  const prisma = getPrisma();
  const user = await syncAuthenticatedUser(session);
  const roles = await prisma.role.findMany({
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
  });
  type SelectedRole = (typeof roles)[number];
  const rolesBySlug = new Map(roles.map((role) => [role.slug, role]));
  const orderedRoles = selectedRoleSlugs
    .map((slug) => rolesBySlug.get(slug))
    .filter((role): role is SelectedRole => Boolean(role));

  if (orderedRoles.length === 0) {
    return NextResponse.json({ ok: false, error: "Selected roles were not found" }, { status: 400 });
  }

  const primaryRole = orderedRoles[0];
  const profileCompletion = computeProfileCompletion({
    fullName,
    phone,
    country,
    stateProvince,
    city,
    organization,
    timezone,
    selectedRoleCount: orderedRoles.length,
    interestCount: interests.length,
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { fullName },
    }),
    prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        country,
        stateProvince: stateProvince || null,
        city: city || null,
        region: country,
        timezone,
        organization: organization || null,
        phone: phone || null,
        interests,
        primaryRoleId: primaryRole.id,
        primaryCategoryId: primaryRole.categoryId,
        profileCompletion,
      },
      create: {
        userId: user.id,
        country,
        stateProvince: stateProvince || null,
        city: city || null,
        region: country,
        timezone,
        organization: organization || null,
        phone: phone || null,
        interests,
        primaryRoleId: primaryRole.id,
        primaryCategoryId: primaryRole.categoryId,
        profileCompletion,
      },
    }),
    prisma.userSelectedRole.deleteMany({
      where: { userId: user.id },
    }),
    prisma.userSelectedRole.createMany({
      data: orderedRoles.map((role, index) => ({
        userId: user.id,
        roleId: role.id,
        isPrimary: index === 0,
      })),
      skipDuplicates: true,
    }),
  ]);

  const workspaceUpdate = await prisma.workspaceItem.updateMany({
    where: {
      userId: user.id,
      title: "Complete location and role profile",
    },
    data: {
      status: "COMPLETED",
      progress: 100,
    },
  });

  if (workspaceUpdate.count === 0) {
    await prisma.workspaceItem.create({
      data: {
        userId: user.id,
        title: "Complete location and role profile",
        itemType: DashboardItemType.RESOURCE,
        status: "COMPLETED",
        progress: 100,
        notes: "Profile completed from the post-login profile form.",
      },
    });
  }

  return NextResponse.json({ ok: true, profileCompletion });
}
