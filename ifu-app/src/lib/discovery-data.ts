import { getPrisma } from "@/lib/prisma";
import { discoveryCategories, type DiscoveryCategory } from "@/lib/role-catalog";

export async function getDiscoveryCategories(): Promise<DiscoveryCategory[]> {
  try {
    const categories = await getPrisma().roleCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        roles: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (categories.length === 0) {
      return discoveryCategories;
    }

    return categories.map((category) => ({
      slug: category.slug,
      name: category.name,
      summary: category.summary,
      sortOrder: category.sortOrder,
      roles: category.roles.map((role) => ({
        slug: role.slug,
        title: role.title,
        summary: role.summary,
        pathway: role.pathway,
        categorySlug: category.slug,
        categoryName: category.name,
        sortOrder: role.sortOrder,
      })),
    }));
  } catch {
    return discoveryCategories;
  }
}
