import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IFUPersonalCommandCenter } from "@/components/ifu-personal-command-center";
import { getAuthSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Welcome To My IFU Personal Command Center Dashboard | IFU Platform",
  description: "Private IFU Personal Command Center dashboard.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login?returnTo=/dashboard");
  }

  const authenticatedSession = session;
  const displayName =
    authenticatedSession.name ??
    authenticatedSession.username ??
    authenticatedSession.email ??
    "IFU member";

  return (
    <IFUPersonalCommandCenter
      profile={{
        fullName: displayName,
        email: authenticatedSession.email,
        role: "Member Candidate",
        category: "IFU Platform Member",
        city: "Profile Pending",
        stateProvince: "Profile Pending",
        region: "Global IFU Network",
        country: "Profile Pending",
        timezone: "America/New_York",
        profileCompletion: 62,
        sessionExpiresAt: new Date(authenticatedSession.expiresAt).toLocaleString(),
      }}
    />
  );
}
