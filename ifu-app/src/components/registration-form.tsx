"use client";

import { CheckCircle2, LoaderCircle, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { IFUActionButton, cn } from "@/components/ifu-ui";

type RegistrationFormState = {
  firstName: string;
  lastName: string;
  preferredDisplayName: string;
  email: string;
  mobilePhone: string;
  password: string;
  confirmPassword: string;
  country: string;
  stateProvince: string;
  city: string;
  timezone: string;
  preferredLanguage: string;
};

const initialFormState: RegistrationFormState = {
  firstName: "",
  lastName: "",
  preferredDisplayName: "",
  email: "",
  mobilePhone: "",
  password: "",
  confirmPassword: "",
  country: "",
  stateProvince: "",
  city: "",
  timezone: "",
  preferredLanguage: "English",
};

const languageOptions = [
  "English",
  "Spanish",
  "French",
  "Portuguese",
  "Arabic",
  "Mandarin",
  "Hindi",
  "Other",
];

function TextInput({
  label,
  value,
  onChange,
  required,
  type = "text",
  autoComplete,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  helper?: string;
}) {
  return (
    <label className="ifu-field-label">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        autoComplete={autoComplete}
        className="ifu-field-control ifu-input mt-2"
      />
      {helper ? <span className="mt-1 block text-xs text-[var(--ifu-muted)]">{helper}</span> : null}
    </label>
  );
}

export function RegistrationForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<RegistrationFormState>(initialFormState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const detectedLanguage = navigator.language?.split("-")[0];
    const language =
      detectedLanguage === "es"
        ? "Spanish"
        : detectedLanguage === "fr"
          ? "French"
          : detectedLanguage === "pt"
            ? "Portuguese"
            : detectedLanguage === "ar"
              ? "Arabic"
              : detectedLanguage === "zh"
                ? "Mandarin"
                : detectedLanguage === "hi"
                  ? "Hindi"
                  : "English";

    setFormState((current) => ({
      ...current,
      timezone: current.timezone || detectedTimezone || "America/New_York",
      preferredLanguage: current.preferredLanguage || language,
    }));
  }, []);

  function updateField<K extends keyof RegistrationFormState>(field: K, value: RegistrationFormState[K]) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setStatusMessage("");

    if (formState.password !== formState.confirmPassword) {
      setStatus("error");
      setStatusMessage("Password and confirmation do not match.");
      return;
    }

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formState),
    });
    const result = (await response.json()) as { ok?: boolean; error?: string; email?: string };

    if (!response.ok || !result.ok) {
      setStatus("error");
      setStatusMessage(result.error ?? "Unable to create account.");
      return;
    }

    setStatus("success");
    router.push(`/register/confirm?email=${encodeURIComponent(result.email ?? formState.email)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="ifu-card ifu-card-muted p-5">
      <fieldset className="ifu-fieldset p-4">
        <legend className="px-2">Basic identity</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="First name" value={formState.firstName} onChange={(value) => updateField("firstName", value)} required autoComplete="given-name" />
          <TextInput label="Last name" value={formState.lastName} onChange={(value) => updateField("lastName", value)} required autoComplete="family-name" />
          <TextInput label="Preferred display name" value={formState.preferredDisplayName} onChange={(value) => updateField("preferredDisplayName", value)} autoComplete="nickname" />
          <TextInput label="Email address" value={formState.email} onChange={(value) => updateField("email", value)} required type="email" autoComplete="email" />
          <TextInput label="Mobile phone" value={formState.mobilePhone} onChange={(value) => updateField("mobilePhone", value)} type="tel" autoComplete="tel" helper="Recommended. Use international format, for example +15551234567." />
          <div className="hidden sm:block" />
          <TextInput label="Password" value={formState.password} onChange={(value) => updateField("password", value)} required type="password" autoComplete="new-password" />
          <TextInput label="Confirm password" value={formState.confirmPassword} onChange={(value) => updateField("confirmPassword", value)} required type="password" autoComplete="new-password" />
        </div>
      </fieldset>

      <fieldset className="ifu-fieldset mt-6 p-4">
        <legend className="px-2">Location</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Country" value={formState.country} onChange={(value) => updateField("country", value)} required autoComplete="country-name" />
          <TextInput label="State/province" value={formState.stateProvince} onChange={(value) => updateField("stateProvince", value)} required autoComplete="address-level1" />
          <TextInput label="City" value={formState.city} onChange={(value) => updateField("city", value)} required autoComplete="address-level2" />
          <TextInput label="Time zone" value={formState.timezone} onChange={(value) => updateField("timezone", value)} required />
          <label className="ifu-field-label sm:col-span-2">
            Preferred language
            <select
              value={formState.preferredLanguage}
              onChange={(event) => updateField("preferredLanguage", event.target.value)}
              required
              className="ifu-field-control ifu-select mt-2"
            >
              {languageOptions.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="ifu-copy text-sm">
          IFU creates the Cognito account only after these registration details pass validation.
        </p>
        <IFUActionButton type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <UserPlus className="h-4 w-4" aria-hidden="true" />
          )}
          Create account
        </IFUActionButton>
      </div>

      {statusMessage ? (
        <div
          className={cn(
            "ifu-status mt-4",
            status === "success" ? "ifu-status-success" : "ifu-status-error",
          )}
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{statusMessage}</p>
        </div>
      ) : null}
    </form>
  );
}
