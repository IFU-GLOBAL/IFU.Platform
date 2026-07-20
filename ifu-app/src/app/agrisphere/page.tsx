import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "AgriSphere Global Agricultural Intelligence",
  description:
    "Explore IFU AgriSphere country activity, agricultural search, live statistics, top producers, and ecosystem destinations.",
  alternates: {
    canonical: "/agrisphere",
  },
  openGraph: {
    title: "AgriSphere Global Agricultural Intelligence",
    description:
      "Explore IFU AgriSphere country activity, agricultural search, live statistics, top producers, and ecosystem destinations.",
    url: "/agrisphere",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

const dashboardAgriSpherePath = "/dashboard?section=agrisphere-dashboard";

export default async function AgriSpherePage() {
  const session = await getAuthSession();

  if (!session) {
    redirect(`/login?returnTo=${encodeURIComponent(dashboardAgriSpherePath)}`);
  }

  redirect(dashboardAgriSpherePath);
}
