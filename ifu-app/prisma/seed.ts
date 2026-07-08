import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { discoveryCategories, discoveryRoles } from "../src/lib/role-catalog";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  const categorySlugs = discoveryCategories.map((category) => category.slug);
  const roleSlugs = discoveryRoles.map((role) => role.slug);

  for (const category of discoveryCategories) {
    await prisma.roleCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        summary: category.summary,
        sortOrder: category.sortOrder,
      },
      create: {
        slug: category.slug,
        name: category.name,
        summary: category.summary,
        sortOrder: category.sortOrder,
      },
    });
  }

  const categories = await prisma.roleCategory.findMany({
    select: { id: true, slug: true },
  });
  const categoryIds = new Map(categories.map((category) => [category.slug, category.id]));

  for (const category of discoveryCategories) {
    const categoryId = categoryIds.get(category.slug);

    if (!categoryId) {
      throw new Error(`Missing category id for ${category.slug}`);
    }

    for (const role of category.roles) {
      await prisma.role.upsert({
        where: { slug: role.slug },
        update: {
          title: role.title,
          summary: role.summary,
          pathway: role.pathway,
          sortOrder: role.sortOrder,
          categoryId,
        },
        create: {
          slug: role.slug,
          title: role.title,
          summary: role.summary,
          pathway: role.pathway,
          sortOrder: role.sortOrder,
          categoryId,
        },
      });
    }
  }

  const deletedRoles = await prisma.role.deleteMany({
    where: {
      slug: {
        notIn: roleSlugs,
      },
    },
  });

  const deletedCategories = await prisma.roleCategory.deleteMany({
    where: {
      slug: {
        notIn: categorySlugs,
      },
    },
  });

  const [categoryCount, roleCount] = await Promise.all([
    prisma.roleCategory.count(),
    prisma.role.count(),
  ]);

  await prisma.$disconnect();

  console.log(
    `Seeded ${categoryCount} role categories and ${roleCount} roles. Pruned ${deletedCategories.count} old categories and ${deletedRoles.count} old roles.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
