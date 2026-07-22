import { ApplicationStatus, DashboardItemType } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import type { AuthSession } from "@/lib/auth/session";
import { finalizeUserAcquisition } from "@/lib/invitations";
import {
  dashboardItemSeeds,
  workspaceSeedItems,
  type DashboardDrawerItem,
  type DashboardIconKey,
  type DashboardSeedItem,
  type DashboardViewModel,
} from "@/lib/dashboard-model";
import { getPrisma } from "@/lib/prisma";
import { mergeProfileCompletion } from "@/lib/profile-completion";

type DashboardMetadata = {
  actions?: string[];
  details?: string[];
  iconKey?: DashboardIconKey;
  metric?: string;
  href?: string;
  group?: DashboardSeedItem["group"];
  order?: number;
};

type DashboardUser = {
  id: string;
  email: string;
  fullName: string;
  profile: {
    country: string | null;
    stateProvince: string | null;
    city: string | null;
    region: string | null;
    timezone: string | null;
    latitude: number | null;
    longitude: number | null;
    organization: string | null;
    preferredLanguage: string | null;
    interests: string[];
    primaryCropsLivestock: string[];
    farmSizeBand: string | null;
    goals: string | null;
    profileCompletion: number;
  } | null;
  selectedRoles: Array<{
    isPrimary: boolean;
    role: {
      title: string;
      category: {
        name: string;
      };
    };
  }>;
};

function displayNameFromSession(session: AuthSession) {
  return session.name ?? session.username ?? session.email ?? "IFU member";
}

function emailFromSession(session: AuthSession) {
  return session.email ?? `${session.sub}@cognito.ifu.local`;
}

function metadataForSeed(seed: DashboardSeedItem): Prisma.InputJsonObject {
  return {
    actions: seed.actions ?? [],
    details: seed.details ?? [],
    iconKey: seed.iconKey ?? "layoutDashboard",
    metric: seed.metric ?? "",
    href: seed.href ?? "",
    group: seed.group,
    order: seed.order,
  };
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readMetadata(value: Prisma.JsonValue | null): DashboardMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const metadata = value as Record<string, unknown>;
  const iconKey = typeof metadata.iconKey === "string" ? metadata.iconKey : undefined;

  return {
    actions: readStringArray(metadata.actions),
    details: readStringArray(metadata.details),
    iconKey: iconKey as DashboardIconKey | undefined,
    metric: typeof metadata.metric === "string" ? metadata.metric : undefined,
    href: typeof metadata.href === "string" && metadata.href ? metadata.href : undefined,
    group:
      metadata.group === "menu" || metadata.group === "card" || metadata.group === "ecosystem"
        ? metadata.group
        : undefined,
    order: typeof metadata.order === "number" ? metadata.order : undefined,
  };
}

async function syncPreviewRolesForUser(userId: string, email: string) {
  const prisma = getPrisma();
  const submission = await prisma.previewSubmission.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
    select: {
      country: true,
      organization: true,
      phone: true,
      selectedRoleSlugs: true,
      roles: {
        select: {
          role: {
            select: {
              id: true,
              categoryId: true,
            },
          },
        },
      },
    },
  });

  if (!submission) {
    return;
  }

  const linkedRoles = submission.roles.map(({ role }) => role);
  const roles =
    linkedRoles.length > 0
      ? linkedRoles
      : await prisma.role.findMany({
          where: {
            slug: {
              in: submission.selectedRoleSlugs,
            },
          },
          select: {
            id: true,
            categoryId: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        });
  const primaryRole = roles[0];

  if (roles.length > 0) {
    await prisma.userSelectedRole.createMany({
      data: roles.map((role, index) => ({
        userId,
        roleId: role.id,
        isPrimary: index === 0,
      })),
      skipDuplicates: true,
    });
  }

  if (primaryRole) {
    await Promise.all([
      prisma.userSelectedRole.updateMany({
        where: {
          userId,
          roleId: primaryRole.id,
        },
        data: {
          isPrimary: true,
        },
      }),
      prisma.userSelectedRole.updateMany({
        where: {
          userId,
          roleId: {
            not: primaryRole.id,
          },
        },
        data: {
          isPrimary: false,
        },
      }),
    ]);
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { profileCompletion: true },
  });

  await prisma.userProfile.update({
    where: { userId },
    data: {
      country: submission.country ?? undefined,
      organization: submission.organization ?? undefined,
      phone: submission.phone ?? undefined,
      primaryRoleId: primaryRole?.id,
      primaryCategoryId: primaryRole?.categoryId,
      profileCompletion: primaryRole ? Math.max(profile?.profileCompletion ?? 0, 62) : undefined,
    },
  });
}

function dashboardItemToDrawerItem(item: {
  slug: string;
  title: string;
  type: string;
  category: string | null;
  summary: string | null;
  description: string | null;
  metadata: Prisma.JsonValue | null;
}): DashboardDrawerItem {
  const metadata = readMetadata(item.metadata);

  return {
    id: item.slug,
    title: item.title,
    type: item.category ?? item.type,
    summary: item.summary ?? "IFU dashboard item.",
    description: item.description ?? item.summary ?? "IFU dashboard item.",
    details: metadata.details,
    actions: metadata.actions,
    iconKey: metadata.iconKey,
    metric: metadata.metric,
    href: metadata.href,
  };
}

function workspaceItemToDrawerItem(item: {
  id: string;
  title: string;
  status: string;
  progress: number;
  notes: string | null;
  itemType: string;
}): DashboardDrawerItem {
  return {
    id: item.id,
    title: item.title,
    type: "Workspace Item",
    summary: `Status: ${item.status}. Progress: ${item.progress}%.`,
    description:
      item.notes ??
      "This action belongs in the user's workspace and can be updated from the command center.",
    actions: ["Move to Workspace", "Set Reminder", "Mark Complete"],
    iconKey: "checkSquare",
  };
}

async function ensureDashboardItems() {
  const prisma = getPrisma();

  await prisma.$transaction(
    dashboardItemSeeds.map((seed) =>
      prisma.dashboardItem.upsert({
        where: { slug: seed.id },
        update: {
          title: seed.title,
          type: DashboardItemType[seed.dashboardType],
          category: seed.type,
          summary: seed.summary,
          description: seed.description,
          roleTargets: [],
          actionLabel: seed.actions?.[0] ?? null,
          metadata: metadataForSeed(seed),
        },
        create: {
          slug: seed.id,
          title: seed.title,
          type: DashboardItemType[seed.dashboardType],
          category: seed.type,
          summary: seed.summary,
          description: seed.description,
          roleTargets: [],
          actionLabel: seed.actions?.[0] ?? null,
          metadata: metadataForSeed(seed),
        },
      }),
    ),
  );
}

async function ensureWorkspaceItems(userId: string) {
  const prisma = getPrisma();
  const count = await prisma.workspaceItem.count({ where: { userId } });

  if (count > 0) {
    return;
  }

  await prisma.workspaceItem.createMany({
    data: workspaceSeedItems.map((item) => ({
      userId,
      title: item.title,
      itemType: DashboardItemType.RESOURCE,
      status: "ACTIVE",
      progress: item.id === "complete-location-and-role-profile" ? 25 : 0,
      notes: item.description,
    })),
  });
}

export async function syncAuthenticatedUser(session: AuthSession) {
  const prisma = getPrisma();
  const email = emailFromSession(session);
  const fullName = displayNameFromSession(session);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      cognitoId: session.sub,
      fullName,
    },
    create: {
      cognitoId: session.sub,
      email,
      fullName,
    },
    include: {
      profile: true,
    },
  });

  if (!user.profile) {
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        country: "Profile Pending",
        stateProvince: "Profile Pending",
        city: "Profile Pending",
        region: "Global IFU Network",
        timezone: "America/New_York",
        profileCompletion: 40,
        phone: session.phoneNumber,
      },
    });
  }

  await prisma.$transaction((transaction) =>
    finalizeUserAcquisition(transaction, {
      userId: user.id,
      email,
      allowEmailFallback: true,
    }),
  );

  await syncPreviewRolesForUser(user.id, email);

  return user;
}

export async function getDashboardUser(session: AuthSession): Promise<DashboardUser> {
  const prisma = getPrisma();
  const user = await syncAuthenticatedUser(session);

  return prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    include: {
      profile: {
        select: {
          country: true,
          stateProvince: true,
          city: true,
          region: true,
          timezone: true,
          latitude: true,
          longitude: true,
          organization: true,
          preferredLanguage: true,
          interests: true,
          primaryCropsLivestock: true,
          farmSizeBand: true,
          goals: true,
          profileCompletion: true,
        },
      },
      selectedRoles: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        take: 1,
        include: {
          role: {
            select: {
              title: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getDashboardViewModel(session: AuthSession): Promise<DashboardViewModel> {
  const prisma = getPrisma();

  await ensureDashboardItems();

  const user = await getDashboardUser(session);
  await ensureWorkspaceItems(user.id);

  const [dashboardItems, workspaceItems] = await Promise.all([
    prisma.dashboardItem.findMany({
      orderBy: [{ type: "asc" }, { title: "asc" }],
      select: {
        slug: true,
        title: true,
        type: true,
        category: true,
        summary: true,
        description: true,
        metadata: true,
      },
    }),
    prisma.workspaceItem.findMany({
      where: { userId: user.id },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 6,
      select: {
        id: true,
        title: true,
        status: true,
        progress: true,
        notes: true,
        itemType: true,
      },
    }),
  ]);

  const grouped = dashboardItems.reduce(
    (accumulator, item) => {
      const metadata = readMetadata(item.metadata);
      const group = metadata.group ?? "menu";
      const drawerItem = dashboardItemToDrawerItem(item);

      accumulator[group].push({ item: drawerItem, order: metadata.order ?? 999 });

      return accumulator;
    },
    {
      menu: [] as Array<{ item: DashboardDrawerItem; order: number }>,
      card: [] as Array<{ item: DashboardDrawerItem; order: number }>,
      ecosystem: [] as Array<{ item: DashboardDrawerItem; order: number }>,
    },
  );

  const selectedRole = user.selectedRoles[0]?.role;
  const profileCompletion = mergeProfileCompletion(
    user.profile?.profileCompletion,
    {
      selectedRoleCount: user.selectedRoles.length,
      country: user.profile?.country,
      stateProvince: user.profile?.stateProvince,
      city: user.profile?.city,
      organization: user.profile?.organization,
      preferredLanguage: user.profile?.preferredLanguage,
      interestCount: user.profile?.interests.length ?? 0,
      timezone: user.profile?.timezone,
      cropLivestockCount: user.profile?.primaryCropsLivestock.length ?? 0,
      farmSizeBand: user.profile?.farmSizeBand,
      goals: user.profile?.goals,
    },
  );

  return {
    profile: {
      fullName: user.fullName,
      email: user.email,
      role: selectedRole?.title ?? "Member Candidate",
      category: selectedRole?.category.name ?? "IFU Platform Member",
      city: user.profile?.city ?? "Profile Pending",
      stateProvince: user.profile?.stateProvince ?? "Profile Pending",
      region: user.profile?.region ?? "Global IFU Network",
      country: user.profile?.country ?? "Profile Pending",
      timezone: user.profile?.timezone ?? "America/New_York",
      latitude: user.profile?.latitude ?? undefined,
      longitude: user.profile?.longitude ?? undefined,
      profileCompletion,
      sessionExpiresAt: new Date(session.expiresAt).toLocaleString(),
    },
    menu: grouped.menu.sort((a, b) => a.order - b.order).map(({ item }) => item),
    cards: grouped.card.sort((a, b) => a.order - b.order).map(({ item }) => item),
    ecosystemItems: grouped.ecosystem.sort((a, b) => a.order - b.order).map(({ item }) => item),
    workspaceItems: workspaceItems.map(workspaceItemToDrawerItem),
  };
}

export async function recordDashboardAction(session: AuthSession, input: {
  action: string;
  item: DashboardDrawerItem;
}) {
  const prisma = getPrisma();
  const user = await syncAuthenticatedUser(session);
  const dashboardItem = await prisma.dashboardItem.findUnique({
    where: { slug: input.item.id },
    select: { id: true, type: true },
  });

  const normalizedAction = input.action.toLowerCase();
  let result = "activity_logged";

  if (normalizedAction.includes("bookmark") || normalizedAction.includes("save")) {
    await prisma.bookmark.create({
      data: {
        userId: user.id,
        dashboardItemId: dashboardItem?.id,
        title: input.item.title,
        itemType: dashboardItem?.type ?? DashboardItemType.RESOURCE,
        notes: input.action,
      },
    });
    result = "bookmark_created";
  } else if (
    normalizedAction.includes("workspace") ||
    normalizedAction.includes("task") ||
    normalizedAction.includes("continue") ||
    normalizedAction.includes("complete")
  ) {
    await prisma.workspaceItem.create({
      data: {
        userId: user.id,
        dashboardItemId: dashboardItem?.id,
        title: input.item.title,
        itemType: dashboardItem?.type ?? DashboardItemType.RESOURCE,
        status: normalizedAction.includes("complete") ? "COMPLETED" : "ACTIVE",
        progress: normalizedAction.includes("complete") ? 100 : 25,
        notes: input.action,
      },
    });
    result = "workspace_item_created";
  } else if (normalizedAction.includes("apply") || normalizedAction.includes("submit")) {
    await prisma.application.create({
      data: {
        userId: user.id,
        title: input.item.title,
        type: input.item.type,
        status: ApplicationStatus.DRAFT,
        step: input.action,
      },
    });
    result = "application_created";
  }

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: `DASHBOARD_ACTION_${input.action.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`,
      entityType: "DashboardItem",
      entityId: dashboardItem?.id ?? input.item.id,
      metadata: {
        itemTitle: input.item.title,
        result,
      },
    },
  });

  return { ok: true, result };
}
