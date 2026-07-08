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

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login?returnTo=/dashboard");
  }

  const dashboardView = await getDashboardViewModel(session);

  return (
    <IFUPersonalCommandCenter
      view={dashboardView}
    />
  );
}
