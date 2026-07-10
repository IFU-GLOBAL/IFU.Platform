export type PreviewApplicationPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  organization?: string;
  roleOrTitle?: string;
  selectedRoleSlugs: string[];
  leadershipInterest?: string;
  contributionInterests: string[];
  referralSource?: string;
  referralDetail?: string;
  recommendedContactName?: string;
  recommendedContactEmail?: string;
  recommendedContactRelationship?: string;
  message?: string;
  privacyConsent: boolean;
  referralConsent: boolean;
  website?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanBoolean(value: unknown) {
  return value === true;
}

export function parsePreviewApplicationPayload(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return { ok: false as const, error: "Request body must be a JSON object" };
  }

  const body = value as Record<string, unknown>;
  const payload: PreviewApplicationPayload = {
    firstName: cleanString(body.firstName),
    lastName: cleanString(body.lastName),
    email: cleanString(body.email).toLowerCase(),
    phone: cleanString(body.phone),
    country: cleanString(body.country),
    organization: cleanString(body.organization),
    roleOrTitle: cleanString(body.roleOrTitle),
    selectedRoleSlugs: cleanStringArray(body.selectedRoleSlugs),
    leadershipInterest: cleanString(body.leadershipInterest),
    contributionInterests: cleanStringArray(body.contributionInterests),
    referralSource: cleanString(body.referralSource),
    referralDetail: cleanString(body.referralDetail),
    recommendedContactName: cleanString(body.recommendedContactName),
    recommendedContactEmail: cleanString(body.recommendedContactEmail).toLowerCase(),
    recommendedContactRelationship: cleanString(body.recommendedContactRelationship),
    message: cleanString(body.message),
    privacyConsent: cleanBoolean(body.privacyConsent),
    referralConsent: cleanBoolean(body.referralConsent),
    website: cleanString(body.website),
  };

  if (payload.website) {
    return { ok: true as const, payload, spam: true as const };
  }

  if (!payload.firstName || !payload.lastName) {
    return { ok: false as const, error: "First and last name are required" };
  }

  if (!emailPattern.test(payload.email)) {
    return { ok: false as const, error: "A valid email is required" };
  }

  if (!payload.country) {
    return { ok: false as const, error: "Country is required" };
  }

  if (!payload.privacyConsent) {
    return { ok: false as const, error: "Privacy consent is required" };
  }

  if (payload.recommendedContactEmail && !emailPattern.test(payload.recommendedContactEmail)) {
    return { ok: false as const, error: "Recommended contact email is invalid" };
  }

  const hasReferral =
    payload.recommendedContactName ||
    payload.recommendedContactEmail ||
    payload.recommendedContactRelationship;

  if (hasReferral && !payload.recommendedContactEmail) {
    return { ok: false as const, error: "Recommended contact email is required when sharing a referral" };
  }

  if (hasReferral && !payload.referralConsent) {
    return { ok: false as const, error: "Referral consent is required when sharing a referral" };
  }

  if (payload.selectedRoleSlugs.length === 0) {
    return { ok: false as const, error: "Select at least one role" };
  }

  return { ok: true as const, payload };
}
