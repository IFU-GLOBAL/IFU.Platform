import { DiscoveryCenter } from "@/components/discovery-center";
import { getDiscoveryCategories } from "@/lib/discovery-data";
import { discoveryMetrics } from "@/lib/role-catalog";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

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
  const roleCount = categories.reduce((total, category) => total + category.roles.length, 0);

  return (
    <DiscoveryCenter
      categories={categories}
      metrics={{
        categories: categories.length || discoveryMetrics.categories,
        roles: roleCount || discoveryMetrics.roles,
        countries: discoveryMetrics.countries,
        pathways: discoveryMetrics.pathways,
      }}
    />
  );
}
