#!/usr/bin/env tsx

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { discoveryCategories, discoveryRoles } from "../src/lib/role-catalog";

type Check = {
  status: "pass" | "fail";
  message: string;
};

const checks: Check[] = [];

function addCheck(status: Check["status"], message: string) {
  checks.push({ status, message });
}

function compareSets(label: string, expectedValues: string[], actualValues: string[]) {
  const expected = new Set(expectedValues);
  const actual = new Set(actualValues);
  const missing = expectedValues.filter((value) => !actual.has(value));
  const extra = actualValues.filter((value) => !expected.has(value));

  if (missing.length === 0 && extra.length === 0) {
    addCheck("pass", `${label} slugs match (${expectedValues.length}).`);
    return;
  }

  addCheck(
    "fail",
    `${label} slugs differ. Missing: ${missing.join(", ") || "none"}. Extra: ${extra.join(", ") || "none"}.`,
  );
}

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required for database role-catalog audit.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const [dbCategories, dbRoles] = await Promise.all([
      prisma.roleCategory.findMany({
        orderBy: { sortOrder: "asc" },
        select: {
          slug: true,
          name: true,
          sortOrder: true,
        },
      }),
      prisma.role.findMany({
        orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
        select: {
          slug: true,
          title: true,
          sortOrder: true,
          category: {
            select: {
              slug: true,
            },
          },
        },
      }),
    ]);

    compareSets(
      "Role category",
      discoveryCategories.map((category) => category.slug),
      dbCategories.map((category) => category.slug),
    );
    compareSets(
      "Role",
      discoveryRoles.map((role) => role.slug),
      dbRoles.map((role) => role.slug),
    );

    const dbCategoryBySlug = new Map(dbCategories.map((category) => [category.slug, category]));
    const dbRoleBySlug = new Map(dbRoles.map((role) => [role.slug, role]));

    for (const category of discoveryCategories) {
      const dbCategory = dbCategoryBySlug.get(category.slug);

      if (!dbCategory) {
        continue;
      }

      if (dbCategory.name !== category.name) {
        addCheck("fail", `Category ${category.slug} name mismatch: database "${dbCategory.name}" vs catalog "${category.name}".`);
      }

      if (dbCategory.sortOrder !== category.sortOrder) {
        addCheck("fail", `Category ${category.slug} sort order mismatch: database ${dbCategory.sortOrder} vs catalog ${category.sortOrder}.`);
      }
    }

    for (const role of discoveryRoles) {
      const dbRole = dbRoleBySlug.get(role.slug);

      if (!dbRole) {
        continue;
      }

      if (dbRole.title !== role.title) {
        addCheck("fail", `Role ${role.slug} title mismatch: database "${dbRole.title}" vs catalog "${role.title}".`);
      }

      if (dbRole.category.slug !== role.categorySlug) {
        addCheck("fail", `Role ${role.slug} category mismatch: database "${dbRole.category.slug}" vs catalog "${role.categorySlug}".`);
      }

      if (dbRole.sortOrder !== role.sortOrder) {
        addCheck("fail", `Role ${role.slug} sort order mismatch: database ${dbRole.sortOrder} vs catalog ${role.sortOrder}.`);
      }
    }

    if (!checks.some((check) => check.status === "fail")) {
      addCheck(
        "pass",
        `Database role catalog matches source catalog: ${discoveryCategories.length} categories and ${discoveryRoles.length} roles.`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }

  for (const check of checks) {
    console.log(`${check.status.toUpperCase()} ${check.message}`);
  }

  const failures = checks.filter((check) => check.status === "fail");

  if (failures.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
