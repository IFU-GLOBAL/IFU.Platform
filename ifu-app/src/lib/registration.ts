const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const e164PhonePattern = /^\+[1-9]\d{7,14}$/;

export type RegistrationPayload = {
  firstName: string;
  lastName: string;
  preferredDisplayName?: string;
  email: string;
  mobilePhone?: string;
  password: string;
  confirmPassword: string;
  country: string;
  stateProvince: string;
  city: string;
  timezone: string;
  preferredLanguage: string;
};

function cleanString(value: unknown, maxLength = 160) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function parseRegistrationPayload(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return { ok: false as const, error: "Request body must be a JSON object" };
  }

  const body = value as Record<string, unknown>;
  const payload: RegistrationPayload = {
    firstName: cleanString(body.firstName, 80),
    lastName: cleanString(body.lastName, 80),
    preferredDisplayName: cleanString(body.preferredDisplayName, 120),
    email: cleanString(body.email, 160).toLowerCase(),
    mobilePhone: cleanString(body.mobilePhone, 40),
    password: cleanString(body.password, 256),
    confirmPassword: cleanString(body.confirmPassword, 256),
    country: cleanString(body.country, 120),
    stateProvince: cleanString(body.stateProvince, 120),
    city: cleanString(body.city, 120),
    timezone: cleanString(body.timezone, 80),
    preferredLanguage: cleanString(body.preferredLanguage, 80),
  };

  if (!payload.firstName || !payload.lastName) {
    return { ok: false as const, error: "First and last name are required" };
  }

  if (!emailPattern.test(payload.email)) {
    return { ok: false as const, error: "A valid email address is required" };
  }

  if (payload.mobilePhone && !e164PhonePattern.test(payload.mobilePhone)) {
    return {
      ok: false as const,
      error: "Mobile phone must use international format, for example +15551234567",
    };
  }

  if (payload.password.length < 8) {
    return { ok: false as const, error: "Password must be at least 8 characters" };
  }

  if (payload.password !== payload.confirmPassword) {
    return { ok: false as const, error: "Password and confirmation do not match" };
  }

  if (!payload.country || !payload.stateProvince || !payload.city) {
    return { ok: false as const, error: "Country, state/province, and city are required" };
  }

  if (!payload.timezone) {
    return { ok: false as const, error: "Time zone is required" };
  }

  if (!payload.preferredLanguage) {
    return { ok: false as const, error: "Preferred language is required" };
  }

  return { ok: true as const, payload };
}
