import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  AgriSphereActivityLevel,
  AgriSphereEventFormat,
  AgriSphereOpportunityStatus,
  AgriSpherePartnerTier,
} from "../src/generated/prisma/enums";
import {
  agrisphereContinents,
  agrisphereCountries,
  agrisphereEvents,
  agrisphereOpportunities,
  agrisphereOrganizations,
  agrispherePartners,
  agrisphereSectors,
  agrisphereStats,
  agrisphereTopProducers,
  agrisphereTreaties,
  type AgriSphereActivityTier,
  type AgriSphereEvent,
  type AgriSphereEventFormat as StaticAgriSphereEventFormat,
  type AgriSphereOpportunityStatus as StaticAgriSphereOpportunityStatus,
  type AgriSpherePartnerTier as StaticAgriSpherePartnerTier,
} from "../src/lib/agrisphere-data";
import { discoveryCategories, discoveryRoles } from "../src/lib/role-catalog";

function roleKeywords(role: { title: string; categoryName: string; pathway: string }) {
  return Array.from(
    new Set(
      `${role.title} ${role.categoryName} ${role.pathway}`
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((keyword) => keyword.length > 2),
    ),
  );
}

function activityLevelFromTier(tier: AgriSphereActivityTier) {
  const levels: Record<AgriSphereActivityTier, AgriSphereActivityLevel> = {
    high: AgriSphereActivityLevel.HIGH,
    medium: AgriSphereActivityLevel.MEDIUM,
    emerging: AgriSphereActivityLevel.EMERGING,
    low: AgriSphereActivityLevel.LOW,
    "no-data": AgriSphereActivityLevel.NO_DATA,
  };

  return levels[tier];
}

function opportunityStatus(status: StaticAgriSphereOpportunityStatus) {
  const statuses: Record<StaticAgriSphereOpportunityStatus, AgriSphereOpportunityStatus> = {
    active: AgriSphereOpportunityStatus.ACTIVE,
    closed: AgriSphereOpportunityStatus.CLOSED,
    draft: AgriSphereOpportunityStatus.DRAFT,
  };

  return statuses[status];
}

function eventFormat(format: StaticAgriSphereEventFormat) {
  const formats: Record<StaticAgriSphereEventFormat, AgriSphereEventFormat> = {
    virtual: AgriSphereEventFormat.VIRTUAL,
    "in-person": AgriSphereEventFormat.IN_PERSON,
    hybrid: AgriSphereEventFormat.HYBRID,
  };

  return formats[format];
}

function partnerTier(tier: StaticAgriSpherePartnerTier) {
  const tiers: Record<StaticAgriSpherePartnerTier, AgriSpherePartnerTier> = {
    institutional: AgriSpherePartnerTier.INSTITUTIONAL,
    strategic: AgriSpherePartnerTier.STRATEGIC,
    community: AgriSpherePartnerTier.COMMUNITY,
  };

  return tiers[tier];
}

function countValue(value: string) {
  const number = Number(value.replace(/[^0-9.]/g, ""));

  if (!Number.isFinite(number)) {
    return 0;
  }

  if (/m\+?$/i.test(value.trim())) {
    return Math.round(number * 1_000_000);
  }

  if (/k\+?$/i.test(value.trim())) {
    return Math.round(number * 1_000);
  }

  return Math.round(number);
}

function eventDate(value: AgriSphereEvent["startsAt"]) {
  return new Date(value);
}

function treatyCountryCodes(treatyId: string) {
  if (treatyId === "afcfta") {
    return agrisphereCountries
      .filter((country) => country.continentCode === "africa")
      .map((country) => country.code);
  }

  if (treatyId === "usmca") {
    return ["US", "MX", "CA"];
  }

  if (treatyId === "eu-green-deal") {
    return agrisphereCountries
      .filter((country) => country.continentCode === "europe")
      .map((country) => country.code);
  }

  return [];
}

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
        isActive: true,
      },
      create: {
        slug: category.slug,
        name: category.name,
        summary: category.summary,
        sortOrder: category.sortOrder,
        isActive: true,
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
          level: role.pathway,
          description: role.summary,
          keywords: roleKeywords(role),
          isActive: true,
          sortOrder: role.sortOrder,
          categoryId,
        },
        create: {
          slug: role.slug,
          title: role.title,
          summary: role.summary,
          pathway: role.pathway,
          level: role.pathway,
          description: role.summary,
          keywords: roleKeywords(role),
          isActive: true,
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

  for (const continent of agrisphereContinents) {
    await prisma.agriSphereContinent.upsert({
      where: { code: continent.code },
      update: {
        name: continent.name,
        summary: continent.summary,
        priorityCrops: continent.priorityCrops,
        countryCount: continent.countryCount,
      },
      create: {
        code: continent.code,
        name: continent.name,
        summary: continent.summary,
        priorityCrops: continent.priorityCrops,
        countryCount: continent.countryCount,
      },
    });
  }

  for (const country of agrisphereCountries) {
    await prisma.agriSphereCountry.upsert({
      where: { code: country.code },
      update: {
        slug: country.slug,
        name: country.name,
        continentCode: country.continentCode,
        latitude: country.latitude,
        longitude: country.longitude,
        activityLevel: activityLevelFromTier(country.activityTier),
        primaryCrops: country.primaryCrops,
        opportunityCount: country.opportunityCount,
        producerRank: country.producerRank,
        summary: country.summary,
      },
      create: {
        code: country.code,
        slug: country.slug,
        name: country.name,
        continentCode: country.continentCode,
        latitude: country.latitude,
        longitude: country.longitude,
        activityLevel: activityLevelFromTier(country.activityTier),
        primaryCrops: country.primaryCrops,
        opportunityCount: country.opportunityCount,
        producerRank: country.producerRank,
        summary: country.summary,
      },
    });
  }

  const sectorIds = new Map<string, string>();

  for (const sector of agrisphereSectors) {
    const record = await prisma.agriSphereSector.upsert({
      where: { slug: sector.id },
      update: {
        name: sector.title,
        description: sector.description,
        href: sector.href,
        metadata: sector.metadata,
      },
      create: {
        slug: sector.id,
        name: sector.title,
        description: sector.description,
        href: sector.href,
        metadata: sector.metadata,
      },
      select: { id: true, slug: true },
    });

    sectorIds.set(record.slug, record.id);
  }

  for (const organization of agrisphereOrganizations) {
    await prisma.agriSphereOrganization.upsert({
      where: { slug: organization.id },
      update: {
        name: organization.title,
        type: organization.metadata[0] ?? "Organization",
        description: organization.description,
        href: organization.href,
        metadata: organization.metadata,
        verified: organization.id === "ifu-country-representatives",
      },
      create: {
        slug: organization.id,
        name: organization.title,
        type: organization.metadata[0] ?? "Organization",
        description: organization.description,
        href: organization.href,
        metadata: organization.metadata,
        verified: organization.id === "ifu-country-representatives",
      },
    });
  }

  for (const treaty of agrisphereTreaties) {
    const treatyRecord = await prisma.agriSphereTreaty.upsert({
      where: { slug: treaty.id },
      update: {
        name: treaty.title,
        type: treaty.metadata.includes("trade") ? "Trade" : "Policy",
        description: treaty.description,
        href: treaty.href,
        metadata: treaty.metadata,
      },
      create: {
        slug: treaty.id,
        name: treaty.title,
        type: treaty.metadata.includes("trade") ? "Trade" : "Policy",
        description: treaty.description,
        href: treaty.href,
        metadata: treaty.metadata,
      },
      select: { id: true },
    });

    await prisma.agriSphereTreatyCountry.deleteMany({
      where: { treatyId: treatyRecord.id },
    });
    await prisma.agriSphereTreatyCountry.createMany({
      data: treatyCountryCodes(treaty.id).map((countryCode) => ({
        treatyId: treatyRecord.id,
        countryCode,
      })),
      skipDuplicates: true,
    });
  }

  const marketAccessSectorId = sectorIds.get("market-access");

  for (const producer of agrisphereTopProducers) {
    await prisma.agriSphereProducer.upsert({
      where: { slug: producer.countryCode.toLowerCase() },
      update: {
        name: producer.countryName,
        countryCode: producer.countryCode,
        sectorId: marketAccessSectorId,
        isTopProducer: true,
        producerRank: producer.rank,
        commodities: producer.commodities,
        signal: producer.signal,
        activityLevel: activityLevelFromTier(producer.activityTier),
      },
      create: {
        slug: producer.countryCode.toLowerCase(),
        name: producer.countryName,
        countryCode: producer.countryCode,
        sectorId: marketAccessSectorId,
        isTopProducer: true,
        producerRank: producer.rank,
        commodities: producer.commodities,
        signal: producer.signal,
        activityLevel: activityLevelFromTier(producer.activityTier),
      },
    });
  }

  for (const opportunity of agrisphereOpportunities) {
    await prisma.agriSphereOpportunity.upsert({
      where: { slug: opportunity.slug },
      update: {
        title: opportunity.title,
        description: opportunity.description,
        category: opportunity.category,
        countryCode: opportunity.countryCode,
        region: opportunity.region,
        crops: opportunity.crops,
        status: opportunityStatus(opportunity.status),
        href: opportunity.href,
        metadata: opportunity.metadata,
      },
      create: {
        slug: opportunity.slug,
        title: opportunity.title,
        description: opportunity.description,
        category: opportunity.category,
        countryCode: opportunity.countryCode,
        region: opportunity.region,
        crops: opportunity.crops,
        status: opportunityStatus(opportunity.status),
        href: opportunity.href,
        metadata: opportunity.metadata,
      },
    });
  }

  for (const event of agrisphereEvents) {
    await prisma.agriSphereEvent.upsert({
      where: { slug: event.slug },
      update: {
        title: event.title,
        eventType: event.eventType,
        startsAt: eventDate(event.startsAt),
        endsAt: event.endsAt ? eventDate(event.endsAt) : null,
        format: eventFormat(event.format),
        url: event.url,
        countryCode: event.countryCode,
        metadata: event.metadata,
      },
      create: {
        slug: event.slug,
        title: event.title,
        eventType: event.eventType,
        startsAt: eventDate(event.startsAt),
        endsAt: event.endsAt ? eventDate(event.endsAt) : null,
        format: eventFormat(event.format),
        url: event.url,
        countryCode: event.countryCode,
        metadata: event.metadata,
      },
    });
  }

  for (const partner of agrispherePartners) {
    await prisma.agriSpherePartner.upsert({
      where: { slug: partner.slug },
      update: {
        name: partner.name,
        logoUrl: partner.logoUrl,
        tier: partnerTier(partner.tier),
        url: partner.url,
        sortOrder: partner.sortOrder,
        metadata: partner.metadata,
      },
      create: {
        slug: partner.slug,
        name: partner.name,
        logoUrl: partner.logoUrl,
        tier: partnerTier(partner.tier),
        url: partner.url,
        sortOrder: partner.sortOrder,
        metadata: partner.metadata,
      },
    });
  }

  const statsSnapshotCount = await prisma.agriSpherePlatformStatsSnapshot.count();

  if (statsSnapshotCount === 0) {
    const countryStat = agrisphereStats.find((stat) => stat.id === "countries");
    const farmerStat = agrisphereStats.find((stat) => stat.id === "farmers");
    const partnerStat = agrisphereStats.find((stat) => stat.id === "partners");
    const opportunityStat = agrisphereStats.find((stat) => stat.id === "opportunities");

    await prisma.agriSpherePlatformStatsSnapshot.create({
      data: {
        countryCount: countValue(countryStat?.value ?? String(agrisphereCountries.length)),
        farmerCount: countValue(farmerStat?.value ?? "0"),
        partnerCount: countValue(partnerStat?.value ?? String(agrispherePartners.length)),
        activeProjectCount: countValue(opportunityStat?.value ?? String(agrisphereOpportunities.length)),
      },
    });
  }

  const mapReadingCount = await prisma.agriSphereMapPinClusterReading.count();

  if (mapReadingCount === 0) {
    await prisma.agriSphereMapPinClusterReading.createMany({
      data: agrisphereContinents.map((continent) => ({
        clusterId: continent.code,
        rawCount: agrisphereCountries.filter((country) => country.continentCode === continent.code).length,
      })),
    });
  }

  const [
    agriSphereCountryCount,
    agriSphereContinentCount,
    agriSphereOpportunityCount,
    agriSphereOrganizationCount,
    agriSphereTreatyCount,
    agriSphereSectorCount,
    agriSphereProducerCount,
    agriSphereEventCount,
    agriSpherePartnerCount,
  ] = await Promise.all([
    prisma.agriSphereCountry.count(),
    prisma.agriSphereContinent.count(),
    prisma.agriSphereOpportunity.count(),
    prisma.agriSphereOrganization.count(),
    prisma.agriSphereTreaty.count(),
    prisma.agriSphereSector.count(),
    prisma.agriSphereProducer.count(),
    prisma.agriSphereEvent.count(),
    prisma.agriSpherePartner.count(),
  ]);

  await prisma.$disconnect();

  console.log(
    [
      `Seeded ${categoryCount} role categories and ${roleCount} roles.`,
      `Seeded AgriSphere: ${agriSphereContinentCount} continents, ${agriSphereCountryCount} countries, ${agriSphereOpportunityCount} opportunities, ${agriSphereOrganizationCount} organizations, ${agriSphereTreatyCount} treaties, ${agriSphereSectorCount} sectors, ${agriSphereProducerCount} producers, ${agriSphereEventCount} events, ${agriSpherePartnerCount} partners.`,
      `Pruned ${deletedCategories.count} old categories and ${deletedRoles.count} old roles.`,
    ].join(" "),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
