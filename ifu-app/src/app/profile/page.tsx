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
  title: "IFU Profile | IFU Platform",
  description: "Complete or edit your IFU profile details after login.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/api/auth/login?returnTo=%2Fprofile");
  }

  const prisma = getPrisma();
  const syncedUser = await syncAuthenticatedUser(session);
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: syncedUser.id },
    include: {
      profile: true,
    },
  });
  const profileCompletion = user.profile?.profileCompletion ?? 0;
  const profileIsComplete = profileCompletion >= 100;
  const cleanPendingValue = (value: string | null | undefined) =>
    value === "Profile Pending" ? "" : value ?? "";

  return (
    <IFUPage>
      <IFUSection>
        <IFUContainer size="wide" className="py-12">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <IFUSectionHeader
              eyebrow={profileIsComplete ? "Profile settings" : "Profile completion"}
              title={profileIsComplete ? "Edit your IFU profile" : "Complete your profile - unlock better matches"}
              description={
                profileIsComplete
                  ? "Your profile is complete. Keep it current so IFU can continue matching you with the right opportunities."
                  : "This post-login step is optional. Add only the details you want IFU to use for local opportunities and matching."
              }
              className="md:block"
            />
            <ProfileCompletionForm
              profileCompletion={profileCompletion}
              initial={{
                country: cleanPendingValue(user.profile?.country),
                stateProvince: cleanPendingValue(user.profile?.stateProvince),
                city: cleanPendingValue(user.profile?.city),
                organization: user.profile?.organization ?? "",
                timezone: user.profile?.timezone ?? "America/New_York",
                primaryCropsLivestock: user.profile?.primaryCropsLivestock ?? [],
                farmSizeBand: user.profile?.farmSizeBand ?? "",
                goals: user.profile?.goals ?? "",
              }}
            />
          </div>
        </IFUContainer>
      </IFUSection>
    </IFUPage>
  );
}
