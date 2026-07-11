import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  IFUContainer,
  IFUPage,
  IFUSection,
  IFUSectionHeader,
} from "@/components/ifu-ui";
import { ProfileCompletionForm } from "@/components/profile-completion-form";
import { getAuthSession } from "@/lib/auth/session";
import { syncAuthenticatedUser } from "@/lib/dashboardData";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Complete IFU Profile | IFU Platform",
  description: "Complete your IFU profile after login.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/api/auth/login?returnTo=%2Fprofile");
  }

  const prisma = getPrisma();
  const syncedUser = await syncAuthenticatedUser(session);
  const [user, roles] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: syncedUser.id },
      include: {
        profile: true,
        selectedRoles: {
          include: {
            role: {
              select: {
                slug: true,
              },
            },
          },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
      },
    }),
    prisma.role.findMany({
      where: { isActive: true },
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }, { title: "asc" }],
      select: {
        slug: true,
        title: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const selectedRoleSlugs = user.selectedRoles.map(({ role }) => role.slug);

  return (
    <IFUPage>
      <IFUSection>
        <IFUContainer size="wide" className="py-12">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <IFUSectionHeader
              eyebrow="Profile completion"
              title="Complete your IFU profile"
              description="Country, role, organization, and interest details personalize the private IFU command center after login."
              className="md:block"
            />
            <ProfileCompletionForm
              initial={{
                fullName: user.fullName,
                email: user.email,
                phone: user.profile?.phone ?? session.phoneNumber ?? "",
                country: user.profile?.country === "Profile Pending" ? "" : user.profile?.country ?? "",
                stateProvince: user.profile?.stateProvince === "Profile Pending" ? "" : user.profile?.stateProvince ?? "",
                city: user.profile?.city === "Profile Pending" ? "" : user.profile?.city ?? "",
                organization: user.profile?.organization ?? "",
                timezone: user.profile?.timezone ?? "America/New_York",
                selectedRoleSlugs,
                interests: user.profile?.interests ?? [],
              }}
              roles={roles.map((role) => ({
                slug: role.slug,
                title: role.title,
                categoryName: role.category.name,
              }))}
            />
          </div>
        </IFUContainer>
      </IFUSection>
    </IFUPage>
  );
}
