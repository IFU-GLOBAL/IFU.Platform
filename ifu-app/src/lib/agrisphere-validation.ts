import {
  activityTierMeta,
  agrisphereContinents,
  agrisphereCountries,
  agrisphereEvents,
  agrisphereOpportunities,
  agrisphereOrganizations,
  agrispherePartners,
  agrisphereSearchIndex,
  agrisphereSectors,
  agrisphereTopProducers,
  agrisphereTreaties,
  searchCategories,
} from "@/lib/agrisphere-data";

type ValidationResult = {
  errors: string[];
  warnings: string[];
  counts: Record<string, number>;
};

function duplicates(values: string[]) {
  const seen = new Set<string>();
  const duplicateValues = new Set<string>();

  values.forEach((value) => {
    if (seen.has(value)) {
      duplicateValues.add(value);
    }

    seen.add(value);
  });

  return [...duplicateValues];
}

function requireUnique(errors: string[], label: string, values: string[]) {
  const duplicateValues = duplicates(values);

  if (duplicateValues.length > 0) {
    errors.push(`${label} contains duplicate values: ${duplicateValues.join(", ")}`);
  }
}

export function validateAgriSphereCorpus(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const continentCodes = new Set(agrisphereContinents.map((continent) => continent.code));
  const countryCodes = new Set(agrisphereCountries.map((country) => country.code));
  const expectedTiers = ["high", "medium", "emerging", "low", "no-data"];

  requireUnique(errors, "Continent codes", agrisphereContinents.map((continent) => continent.code));
  requireUnique(errors, "Country codes", agrisphereCountries.map((country) => country.code));
  requireUnique(errors, "Country slugs", agrisphereCountries.map((country) => country.slug));
  requireUnique(errors, "Opportunity ids", agrisphereOpportunities.map((opportunity) => opportunity.id));
  requireUnique(errors, "Opportunity slugs", agrisphereOpportunities.map((opportunity) => opportunity.slug));
  requireUnique(errors, "Organization ids", agrisphereOrganizations.map((organization) => organization.id));
  requireUnique(errors, "Treaty ids", agrisphereTreaties.map((treaty) => treaty.id));
  requireUnique(errors, "Sector ids", agrisphereSectors.map((sector) => sector.id));
  requireUnique(errors, "Event ids", agrisphereEvents.map((event) => event.id));
  requireUnique(errors, "Event slugs", agrisphereEvents.map((event) => event.slug));
  requireUnique(errors, "Partner ids", agrispherePartners.map((partner) => partner.id));
  requireUnique(errors, "Partner slugs", agrispherePartners.map((partner) => partner.slug));
  requireUnique(errors, "Search result ids", agrisphereSearchIndex.map((result) => result.id));
  requireUnique(
    errors,
    "Producer ranks",
    agrisphereTopProducers.map((producer) => String(producer.rank)),
  );

  if (searchCategories.length !== 7) {
    errors.push(`Expected seven search categories, found ${searchCategories.length}`);
  }

  if (expectedTiers.some((tier) => !(tier in activityTierMeta))) {
    errors.push("Country activity metadata does not define all five required tiers");
  }

  agrisphereContinents.forEach((continent) => {
    const seededCount = agrisphereCountries.filter(
      (country) => country.continentCode === continent.code,
    ).length;

    if (!continent.code || !continent.name || continent.priorityCrops.length === 0) {
      errors.push(`Continent ${continent.code || "<missing>"} is missing required discovery data`);
    }

    if (continent.countryCount < seededCount) {
      errors.push(
        `Continent ${continent.code} declares ${continent.countryCount} countries but seeds ${seededCount}`,
      );
    }
  });

  agrisphereCountries.forEach((country) => {
    if (!/^[A-Z]{2}$/.test(country.code)) {
      errors.push(`Country ${country.name} has invalid ISO alpha-2 code ${country.code}`);
    }

    if (!continentCodes.has(country.continentCode)) {
      errors.push(`Country ${country.code} references unknown continent ${country.continentCode}`);
    }

    if (country.latitude < -90 || country.latitude > 90) {
      errors.push(`Country ${country.code} has invalid latitude ${country.latitude}`);
    }

    if (country.longitude < -180 || country.longitude > 180) {
      errors.push(`Country ${country.code} has invalid longitude ${country.longitude}`);
    }

    if (country.primaryCrops.length === 0 || !country.summary.trim()) {
      errors.push(`Country ${country.code} is missing crops or summary content`);
    }
  });

  agrisphereOpportunities.forEach((opportunity) => {
    if (!opportunity.countryCode || !countryCodes.has(opportunity.countryCode)) {
      errors.push(`Opportunity ${opportunity.slug} references an unknown country`);
    }

    if (!opportunity.title.trim() || !opportunity.description.trim() || opportunity.crops.length === 0) {
      errors.push(`Opportunity ${opportunity.slug} is missing required searchable content`);
    }
  });

  agrisphereTopProducers.forEach((producer) => {
    if (!countryCodes.has(producer.countryCode)) {
      errors.push(`Producer rank ${producer.rank} references unknown country ${producer.countryCode}`);
    }
  });

  agrisphereEvents.forEach((event) => {
    const startsAt = Date.parse(event.startsAt);
    const endsAt = event.endsAt ? Date.parse(event.endsAt) : undefined;

    if (!Number.isFinite(startsAt)) {
      errors.push(`Event ${event.slug} has an invalid start date`);
    }

    if (endsAt !== undefined && (!Number.isFinite(endsAt) || endsAt < startsAt)) {
      errors.push(`Event ${event.slug} has an invalid end date`);
    }

    if (event.countryCode && !countryCodes.has(event.countryCode)) {
      errors.push(`Event ${event.slug} references unknown country ${event.countryCode}`);
    }
  });

  const indexedCategories = new Set(agrisphereSearchIndex.map((result) => result.category));
  searchCategories.forEach((category) => {
    if (!indexedCategories.has(category.id)) {
      errors.push(`Search category ${category.id} has no indexed records`);
    }
  });

  if (!agrisphereCountries.some((country) => country.activityTier === "no-data")) {
    warnings.push("The no-data tier is defined but has no representative seed country");
  }

  return {
    errors,
    warnings,
    counts: {
      continents: agrisphereContinents.length,
      countries: agrisphereCountries.length,
      opportunities: agrisphereOpportunities.length,
      organizations: agrisphereOrganizations.length,
      treaties: agrisphereTreaties.length,
      sectors: agrisphereSectors.length,
      producers: agrisphereTopProducers.length,
      events: agrisphereEvents.length,
      partners: agrispherePartners.length,
      searchRecords: agrisphereSearchIndex.length,
    },
  };
}
