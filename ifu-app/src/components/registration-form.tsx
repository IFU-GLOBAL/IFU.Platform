"use client";

import { BadgeCheck, CheckCircle2, LoaderCircle, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { IFUActionButton, cn } from "@/components/ifu-ui";
import { ORGANIC_REFERRAL_OPTIONS } from "@/lib/acquisition-options";

type RegistrationFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  consentTerms: boolean;
  marketingOptIn: boolean;
  ageConfirmed: boolean;
  invitationCode: string;
  selfReportedSource: string;
  selfReportedDetail: string;
  utmSource: string;
  utmCampaign: string;
  utmMedium: string;
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
  invitationCode: "",
  selfReportedSource: "",
  selfReportedDetail: "",
  utmSource: "",
  utmCampaign: "",
  utmMedium: "",
};

type InvitationPreview = {
  code: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  country?: string | null;
  suggestedRole?: string | null;
  invitedBy?: string | null;
  channel?: string | null;
  expiresAt: string;
};

type InvitationLookupResult =
  | {
      ok?: boolean;
      mode: "invited";
      invitation: InvitationPreview;
    }
  | {
      ok?: boolean;
      mode: "organic";
      reason?: string;
    };

type RegistrationFormProps = {
  initialInvitationCode?: string;
  initialUtm?: {
    utmSource?: string;
    utmCampaign?: string;
    utmMedium?: string;
  };
};

const signupTimeoutMs = 30000;

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

export function RegistrationForm({ initialInvitationCode = "", initialUtm }: RegistrationFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<RegistrationFormState>({
    ...initialFormState,
    invitationCode: initialInvitationCode,
    utmSource: initialUtm?.utmSource ?? "",
    utmCampaign: initialUtm?.utmCampaign ?? "",
    utmMedium: initialUtm?.utmMedium ?? "",
  });
  const [invitationMode, setInvitationMode] = useState<"checking" | "invited" | "organic">(
    initialInvitationCode ? "checking" : "organic",
  );
  const [invitation, setInvitation] = useState<InvitationPreview | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!initialInvitationCode) {
      setInvitationMode("organic");
      return;
    }

    let isActive = true;

    async function loadInvitation() {
      setInvitationMode("checking");

      try {
        const response = await fetch(`/api/invitations/${encodeURIComponent(initialInvitationCode)}`);
        const result = (await response.json()) as InvitationLookupResult;

        if (!isActive) {
          return;
        }

        if (response.ok && result.mode === "invited") {
          setInvitation(result.invitation);
          setInvitationMode("invited");
          setFormState((current) => ({
            ...current,
            invitationCode: result.invitation.code,
            firstName: current.firstName || result.invitation.firstName || "",
            lastName: current.lastName || result.invitation.lastName || "",
            email: current.email || result.invitation.email || "",
          }));
          return;
        }
      } catch {
        // Invitation validation should never block registration.
      }

      if (isActive) {
        setInvitation(null);
        setInvitationMode("organic");
        setFormState((current) => ({ ...current, invitationCode: "" }));
      }
    }

    loadInvitation();

    return () => {
      isActive = false;
    };
  }, [initialInvitationCode]);

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

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), signupTimeoutMs);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          ...formState,
          firstTouchUrl: window.location.href,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        email?: string;
        redirectTo?: string;
      };

      if (!response.ok || !result.ok) {
        setStatus("error");
        setStatusMessage(result.error ?? "Unable to create account.");
        return;
      }

      setStatus("success");
      router.push(result.redirectTo ?? "/dashboard");
    } catch (error) {
      setStatus("error");
      setStatusMessage(
        error instanceof DOMException && error.name === "AbortError"
          ? "Account creation timed out. Check the registration logs and try again."
          : "Unable to create account. Check the registration logs and try again.",
      );
    } finally {
      window.clearTimeout(timeout);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ifu-card ifu-card-muted p-5">
      <div className="mb-5 rounded-[var(--ifu-radius)] border border-[var(--ifu-border-soft)] bg-white p-4">
        <div className="flex gap-3">
          <BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-[var(--ifu-primary)]" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ifu-primary)]">
              {invitationMode === "invited" ? "Invited access" : "IFU registration"}
            </p>
            <h2 className="mt-1 text-xl font-bold text-[var(--ifu-heading)]">
              {invitationMode === "invited"
                ? "You've been selected - complete your preview access"
                : "Join farmers and agriculture partners in the IFU network"}
            </h2>
            <p className="ifu-copy mt-2 text-sm">
              {invitationMode === "checking"
                ? "Checking invitation details..."
                : invitationMode === "invited"
                  ? `This invitation${invitation?.invitedBy ? ` from ${invitation.invitedBy}` : ""} will be attached to your account attribution. You can edit any prefilled identity fields.`
                  : "Create your account, then add optional profile details after your first login."}
            </p>
          </div>
        </div>
      </div>

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

      {invitationMode === "organic" ? (
        <fieldset className="ifu-fieldset mt-5 p-4">
          <legend className="px-2">Referral tracking</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="ifu-field-label">
              How did you hear about IFU?
              <select
                value={formState.selfReportedSource}
                onChange={(event) => updateField("selfReportedSource", event.target.value)}
                className="ifu-field-control ifu-select mt-2"
              >
                <option value="">Select one</option>
                {ORGANIC_REFERRAL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <TextInput
              label="Referral detail"
              value={formState.selfReportedDetail}
              onChange={(value) => updateField("selfReportedDetail", value)}
            />
          </div>
        </fieldset>
      ) : null}

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
