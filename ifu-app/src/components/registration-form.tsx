"use client";

import { CheckCircle2, LoaderCircle, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { IFUActionButton, cn } from "@/components/ifu-ui";

type RegistrationFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  consentTerms: boolean;
  marketingOptIn: boolean;
  ageConfirmed: boolean;
};

const initialFormState: RegistrationFormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  consentTerms: false,
  marketingOptIn: false,
  ageConfirmed: false,
};

function TextInput({
  label,
  value,
  onChange,
  required,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  autoComplete?: string;
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
    </label>
  );
}

function ConsentCheckbox({
  checked,
  onChange,
  required,
  title,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  title: string;
  children: string;
}) {
  return (
    <label className="flex gap-3 rounded-[var(--ifu-radius)] border border-[var(--ifu-border-soft)] bg-white px-3 py-3 text-sm text-[var(--ifu-muted-strong)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        required={required}
        className="ifu-checkbox mt-0.5 shrink-0"
      />
      <span>
        <span className="block font-semibold text-[var(--ifu-text)]">{title}</span>
        <span className="mt-1 block leading-6">{children}</span>
      </span>
    </label>
  );
}

export function RegistrationForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<RegistrationFormState>(initialFormState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

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
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="First name"
          value={formState.firstName}
          onChange={(value) => updateField("firstName", value)}
          required
          autoComplete="given-name"
        />
        <TextInput
          label="Last name"
          value={formState.lastName}
          onChange={(value) => updateField("lastName", value)}
          required
          autoComplete="family-name"
        />
        <TextInput
          label="Email address"
          value={formState.email}
          onChange={(value) => updateField("email", value)}
          required
          type="email"
          autoComplete="email"
        />
        <div className="hidden sm:block" />
        <TextInput
          label="Password"
          value={formState.password}
          onChange={(value) => updateField("password", value)}
          required
          type="password"
          autoComplete="new-password"
        />
        <TextInput
          label="Confirm password"
          value={formState.confirmPassword}
          onChange={(value) => updateField("confirmPassword", value)}
          required
          type="password"
          autoComplete="new-password"
        />
      </div>

      <div className="mt-5 grid gap-3">
        <ConsentCheckbox
          title="Consent + Terms"
          checked={formState.consentTerms}
          onChange={(checked) => updateField("consentTerms", checked)}
          required
        >
          I agree to the Terms of Service and Privacy Notice, and consent to IFU storing my information to provide the platform. My data is never sold, and I can request deletion anytime.
        </ConsentCheckbox>
        <ConsentCheckbox
          title="Marketing opt-in"
          checked={formState.marketingOptIn}
          onChange={(checked) => updateField("marketingOptIn", checked)}
        >
          Send me opportunity alerts and IFU updates.
        </ConsentCheckbox>
        <ConsentCheckbox
          title="Age attestation"
          checked={formState.ageConfirmed}
          onChange={(checked) => updateField("ageConfirmed", checked)}
          required
        >
          I confirm I am 16 or older.
        </ConsentCheckbox>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="ifu-copy text-sm">
          Profile details move to the skippable prompt after first login.
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
