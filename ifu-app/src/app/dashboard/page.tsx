import type { Metadata } from "next";
import { ArrowLeft, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import {
  IFUActionLink,
  IFUContainer,
  IFUHero,
  IFUPage,
  IFUSection,
  IFUStatCard,
} from "@/components/ifu-ui";
import { getAuthSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard | IFU Platform",
  description: "Private IFU platform dashboard.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login?returnTo=/dashboard");
  }

  const displayName = session.name ?? session.username ?? session.email ?? "IFU member";

  return (
    <IFUPage>
      <IFUHero
        eyebrow="Private dashboard"
        title={<>Welcome, {displayName}</>}
        description="Your Cognito session is active for the IFU platform."
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <IFUActionLink href="/" variant="ghost" icon={ArrowLeft}>
            Discovery center
          </IFUActionLink>
          <IFUActionLink href="/api/auth/logout" variant="light" icon={LogOut}>
            Sign out
          </IFUActionLink>
        </div>
      </IFUHero>

      <IFUSection>
        <IFUContainer className="grid gap-5 py-10 lg:grid-cols-3">
          <IFUStatCard
            icon={UserRound}
            label="User"
            value={session.email ?? session.username ?? session.sub}
          />
          <IFUStatCard icon={ShieldCheck} label="Session" value="Authenticated" />
          <IFUStatCard
            icon={ShieldCheck}
            label="Expires"
            value={new Date(session.expiresAt).toLocaleString()}
          />
        </IFUContainer>
      </IFUSection>
    </IFUPage>
  );
}
