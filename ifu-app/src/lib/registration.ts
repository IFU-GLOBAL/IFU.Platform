const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export type RegistrationPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  consentTerms: boolean;
  marketingOptIn: boolean;
  ageConfirmed: boolean;
};

function cleanString(value: unknown, maxLength = 160) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanBoolean(value: unknown) {
  return value === true || value === "true";
}

export function parseRegistrationPayload(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return { ok: false as const, error: "Request body must be a JSON object" };
  }

  const body = value as Record<string, unknown>;
  const payload: RegistrationPayload = {
    firstName: cleanString(body.firstName, 80),
    lastName: cleanString(body.lastName, 80),
    email: cleanString(body.email, 160).toLowerCase(),
    password: cleanString(body.password, 256),
    confirmPassword: cleanString(body.confirmPassword, 256),
    consentTerms: cleanBoolean(body.consentTerms),
    marketingOptIn: cleanBoolean(body.marketingOptIn),
    ageConfirmed: cleanBoolean(body.ageConfirmed),
  };

  if (!payload.firstName || !payload.lastName) {
    return { ok: false as const, error: "First and last name are required" };
  }

  if (!emailPattern.test(payload.email)) {
    return { ok: false as const, error: "A valid email address is required" };
  }

  if (payload.password.length < 8) {
    return { ok: false as const, error: "Password must be at least 8 characters" };
  }

  if (payload.password !== payload.confirmPassword) {
    return { ok: false as const, error: "Password and confirmation do not match" };
  }

  if (!payload.consentTerms) {
    return { ok: false as const, error: "Terms, privacy notice, and data storage consent are required" };
  }

  if (!payload.ageConfirmed) {
    return { ok: false as const, error: "Age confirmation is required" };
  }

  return { ok: true as const, payload };
}
