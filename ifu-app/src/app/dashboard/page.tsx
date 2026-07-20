import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IFUPersonalCommandCenter } from "@/components/ifu-personal-command-center";
import { getAuthSession } from "@/lib/auth/session";
import { getDashboardViewModel } from "@/lib/dashboardData";

export const metadata: Metadata = {
  title: "Welcome To My IFU Personal Command Center Dashboard | IFU Platform",
  description: "Private IFU Personal Command Center dashboard.",
};

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams?: Promise<{
    section?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = (await searchParams) ?? {};
  const session = await getAuthSession();

  if (!session) {
    const returnTo = params.section
      ? `/dashboard?section=${encodeURIComponent(params.section)}`
      : "/dashboard";

    redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  const dashboardView = await getDashboardViewModel(session);

  return (
    <IFUPersonalCommandCenter
      view={dashboardView}
      initialSectionId={params.section}
    />
  );
}
