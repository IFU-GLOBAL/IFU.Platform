"use client";

import { CheckCircle2, LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  IFUActionButton,
  IFUActionLink,
  IFUCard,
  cn,
} from "@/components/ifu-ui";
import type { DiscoveryCategory } from "@/lib/role-catalog";

type ProfileFormInitial = {
  country: string;
  stateProvince: string;
  city: string;
  organization: string;
  phone: string;
  preferredLanguage: string;
  interests: string[];
  timezone: string;
  primaryCropsLivestock: string[];
  farmSizeBand: string;
  goals: string;
  selectedRoleSlugs: string[];
};

type ProfileCompletionFormProps = {
  initial: ProfileFormInitial;
  profileCompletion: number;
  roleCategories: DiscoveryCategory[];
};

const cropLivestockOptions = [
  "Corn",
  "Rice",
  "Wheat",
  "Soybeans",
  "Coffee",
  "Cocoa",
  "Cotton",
  "Fruits",
  "Vegetables",
  "Dairy",
  "Beef cattle",
  "Poultry",
  "Aquaculture",
  "Other",
];

const farmSizeOptions = [
  { label: "Select a band", value: "" },
  { label: "<1 ha", value: "<1 ha" },
  { label: "1-5 ha", value: "1-5 ha" },
  { label: "5-20 ha", value: "5-20 ha" },
  { label: "20+ ha", value: "20+ ha" },
];

const preferredLanguageOptions = [
  { label: "Select a language", value: "" },
  { label: "English", value: "English" },
  { label: "French", value: "French" },
  { label: "Spanish", value: "Spanish" },
  { label: "Portuguese", value: "Portuguese" },
  { label: "Arabic", value: "Arabic" },
  { label: "Other", value: "Other" },
];

const interestOptions = [
  "Market access",
  "Funding",
  "Training",
  "Data intelligence",
  "Trade or export",
  "Insurance or risk",
  "Sustainability",
  "Cooperative leadership",
  "Technology",
  "Food security",
  "Partnerships",
  "Volunteering",
];

function TextInput({
  label,
  value,
  onChange,
  helper,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper: string;
  type?: string;
}) {
  return (
    <label className="ifu-field-label">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="ifu-field-control ifu-input mt-2"
      />
      <span className="mt-1 block text-xs text-[var(--ifu-muted)]">{helper}</span>
    </label>
  );
}

export function ProfileCompletionForm({
  initial,
  profileCompletion,
  roleCategories,
}: ProfileCompletionFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState(initial);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const profileIsComplete = profileCompletion >= 100;
  const progressLabel = profileIsComplete ? "Profile complete" : `${profileCompletion}% complete`;

  useEffect(() => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (detectedTimezone) {
      setFormState((current) => ({
        ...current,
        timezone: current.timezone || detectedTimezone,
      }));
    }
  }, []);

  function updateField<K extends keyof ProfileFormInitial>(field: K, value: ProfileFormInitial[K]) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function toggleArrayField(
    field: "interests" | "primaryCropsLivestock",
    value: string,
    maxItems: number,
  ) {
    setFormState((current) => {
      const currentValues = current[field];
      const isSelected = currentValues.includes(value);

      if (!isSelected && currentValues.length >= maxItems) {
        return current;
      }

      return {
        ...current,
        [field]: isSelected
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  }

  function updatePrimaryRole(slug: string) {
    updateField("selectedRoleSlugs", slug ? [slug] : []);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setStatusMessage("");

    const response = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formState),
    });
    const result = (await response.json()) as { ok?: boolean; error?: string };

    if (!response.ok || !result.ok) {
      setStatus("error");
      setStatusMessage(result.error ?? "Unable to save profile");
      return;
    }

    setStatus("success");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <IFUCard className="p-5">
      <form onSubmit={handleSubmit} aria-busy={status === "submitting"}>
        <div className="mb-5">
          <p className="ifu-eyebrow">Progressive profile</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--ifu-text)]">
            {profileIsComplete ? "Edit your IFU profile" : "Complete your profile - unlock better matches"}
          </h2>
          <div className="mt-4 rounded-[var(--ifu-radius)] border border-[var(--ifu-border-soft)] bg-white p-3">
            <div className="flex items-center justify-between gap-3 text-sm font-bold leading-tight text-[var(--ifu-heading)]">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--ifu-primary)]" aria-hidden="true" />
                {progressLabel}
              </span>
              <span>{profileCompletion}%</span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--ifu-surface-muted)]"
              role="progressbar"
              aria-label="Profile completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={profileCompletion}
            >
              <div
                className="h-full rounded-full bg-[var(--ifu-primary)]"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="ifu-field-label sm:col-span-2">
            Primary IFU role
            <select
              value={formState.selectedRoleSlugs[0] ?? ""}
              onChange={(event) => updatePrimaryRole(event.target.value)}
              className="ifu-field-control ifu-select mt-2"
            >
              <option value="">Select your primary IFU role</option>
              {roleCategories.map((category) => (
                <optgroup key={category.slug} label={category.name}>
                  {category.roles.map((role) => (
                    <option key={role.slug} value={role.slug}>
                      {role.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <span className="mt-1 block text-xs text-[var(--ifu-muted)]">
              This controls the role shown in the dashboard and helps IFU match your pathway.
            </span>
          </label>
          <TextInput
            label="Country"
            value={formState.country}
            onChange={(value) => updateField("country", value)}
            helper="Add your country to connect with the right IFU regional context."
          />
          <TextInput
            label="State or province"
            value={formState.stateProvince}
            onChange={(value) => updateField("stateProvince", value)}
            helper="Add your region to surface nearby opportunities."
          />
          <TextInput
            label="City"
            value={formState.city}
            onChange={(value) => updateField("city", value)}
            helper="Add your city to power the welcome bar and local context."
          />
          <TextInput
            label="Organization or farm name"
            value={formState.organization}
            onChange={(value) => updateField("organization", value)}
            helper="Tell us your organization to improve partner matching."
          />
          <TextInput
            label="Contact phone"
            value={formState.phone}
            onChange={(value) => updateField("phone", value)}
            helper="Optional. This is not used for login."
            type="tel"
          />
          <label className="ifu-field-label">
            Preferred language
            <select
              value={formState.preferredLanguage}
              onChange={(event) => updateField("preferredLanguage", event.target.value)}
              className="ifu-field-control ifu-select mt-2"
            >
              {preferredLanguageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-[var(--ifu-muted)]">
              Used for future communications and localized onboarding.
            </span>
          </label>
          <label className="ifu-field-label">
            Farm size band
            <select
              value={formState.farmSizeBand}
              onChange={(event) => updateField("farmSizeBand", event.target.value)}
              className="ifu-field-control ifu-select mt-2"
            >
              {farmSizeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-[var(--ifu-muted)]">
              Choose a band to get scale-appropriate resources.
            </span>
          </label>
        </div>

        <fieldset className="ifu-fieldset mt-6 p-4">
          <legend className="px-2">Interests</legend>
          <p className="ifu-copy mb-3 text-sm">
            Choose the IFU areas you want surfaced in your dashboard. Choose up to 6.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {interestOptions.map((option) => {
              const checked = formState.interests.includes(option);
              const disabled = !checked && formState.interests.length >= 6;

              return (
                <label
                  key={option}
                  className={cn(
                    "flex items-center gap-3 rounded-[var(--ifu-radius)] border border-[var(--ifu-border-soft)] bg-white px-3 py-3 text-sm font-medium text-[var(--ifu-muted-strong)]",
                    disabled ? "opacity-50" : "",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleArrayField("interests", option, 6)}
                    className="ifu-checkbox"
                  />
                  {option}
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="ifu-fieldset mt-6 p-4">
          <legend className="px-2">Primary crops or livestock</legend>
          <p className="ifu-copy mb-3 text-sm">
            Tell us your crops - get buyer requests that match. Choose up to 5.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {cropLivestockOptions.map((option) => {
              const checked = formState.primaryCropsLivestock.includes(option);
              const disabled = !checked && formState.primaryCropsLivestock.length >= 5;

              return (
                <label
                  key={option}
                  className={cn(
                    "flex items-center gap-3 rounded-[var(--ifu-radius)] border border-[var(--ifu-border-soft)] bg-white px-3 py-3 text-sm font-medium text-[var(--ifu-muted-strong)]",
                    disabled ? "opacity-50" : "",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleArrayField("primaryCropsLivestock", option, 5)}
                    className="ifu-checkbox"
                  />
                  {option}
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="ifu-field-label mt-6">
          What are you hoping to achieve?
          <textarea
            value={formState.goals}
            onChange={(event) => updateField("goals", event.target.value)}
            rows={4}
            className="ifu-field-control ifu-input mt-2 min-h-28 resize-y"
          />
          <span className="mt-1 block text-xs text-[var(--ifu-muted)]">
            Share your goals to tune training, funding, market, and network recommendations.
          </span>
        </label>

        <input type="hidden" name="timezone" value={formState.timezone} />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <IFUActionLink href="/dashboard" variant="outline">
            {profileIsComplete ? "Back to dashboard" : "Skip for now"}
          </IFUActionLink>
          <IFUActionButton type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            {profileIsComplete ? "Save profile" : "Save and continue"}
          </IFUActionButton>
        </div>

        {statusMessage ? (
          <div
            role={status === "error" ? "alert" : "status"}
            aria-live={status === "error" ? "assertive" : "polite"}
            className={cn(
              "ifu-status mt-4",
              status === "success" ? "ifu-status-success" : "ifu-status-error",
            )}
          >
            <p>{statusMessage}</p>
          </div>
        ) : null}
      </form>
    </IFUCard>
  );
}
