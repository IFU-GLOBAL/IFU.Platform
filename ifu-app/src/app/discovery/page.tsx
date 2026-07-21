import { DiscoveryCenter } from "@/components/discovery-center";
import { getDiscoveryCategories } from "@/lib/discovery-data";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "IFU Role-Based Discovery & Education Center",
  description:
    "Preview the IFU Platform role-based discovery and education center for global agriculture.",
};

type DiscoveryPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function buildCallbackQuery(params: Record<string, string | string[] | undefined>) {
  const callbackParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => callbackParams.append(key, item));
      return;
    }

    if (value) {
      callbackParams.set(key, value);
    }
  });

  return callbackParams.toString();
}

export default async function DiscoveryPage({ searchParams }: DiscoveryPageProps) {
  const params = (await searchParams) ?? {};

  if (params.code || params.error) {
    redirect(`/api/auth/callback?${buildCallbackQuery(params)}`);
  }

  const categories = await getDiscoveryCategories();
  const persona = typeof params.persona === "string" ? params.persona : undefined;
  const roleParam = params.role;
  const initialRoleSlugs = Array.isArray(roleParam)
    ? roleParam
    : typeof roleParam === "string"
      ? roleParam.split(",").filter(Boolean)
      : [];

  return (
    <DiscoveryCenter
      categories={categories}
      initialPersonaSlug={persona}
      initialRoleSlugs={initialRoleSlugs}
    />
  );
}
