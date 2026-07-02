import { DiscoveryCenter } from "@/components/discovery-center";
import { getDiscoveryCategories } from "@/lib/discovery-data";
import { discoveryMetrics } from "@/lib/role-catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
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
