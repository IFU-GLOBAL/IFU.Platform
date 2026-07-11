"use client";

import { LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  IFUActionButton,
  IFUActionLink,
  IFUCard,
  cn,
} from "@/components/ifu-ui";

type ProfileFormInitial = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  stateProvince: string;
  city: string;
  organization: string;
  timezone: string;
  selectedRoleSlugs: string[];
  interests: string[];
};

type RoleOption = {
  slug: string;
  title: string;
  categoryName: string;
};

type ProfileCompletionFormProps = {
  initial: ProfileFormInitial;
  roles: RoleOption[];
};

const interestOptions = [
  "Funding",
  "Markets",
  "Training",
  "Technology",
  "Research",
  "Policy",
  "Sustainability",
  "Investment",
  "Partnerships",
  "Youth and education",
];

function TextInput({
  label,
  value,
  onChange,
  required,
  readOnly,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  readOnly?: boolean;
  type?: string;
}) {
  return (
    <label className="ifu-field-label">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        readOnly={readOnly}
        className="ifu-field-control ifu-input mt-2"
      />
    </label>
  );
}

export function ProfileCompletionForm({ initial, roles }: ProfileCompletionFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState(initial);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  function updateField<K extends keyof ProfileFormInitial>(field: K, value: ProfileFormInitial[K]) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function toggleInterest(value: string) {
    setFormState((current) => ({
      ...current,
      interests: current.interests.includes(value)
        ? current.interests.filter((item) => item !== value)
        : [...current.interests, value],
    }));
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
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Full name" value={formState.fullName} onChange={(value) => updateField("fullName", value)} required />
          <TextInput label="Email" value={formState.email} onChange={() => undefined} type="email" readOnly />
          <TextInput label="Phone" value={formState.phone} onChange={(value) => updateField("phone", value)} />
          <TextInput label="Country" value={formState.country} onChange={(value) => updateField("country", value)} required />
          <TextInput label="State or province" value={formState.stateProvince} onChange={(value) => updateField("stateProvince", value)} />
          <TextInput label="City" value={formState.city} onChange={(value) => updateField("city", value)} />
          <TextInput label="Organization" value={formState.organization} onChange={(value) => updateField("organization", value)} />
          <TextInput label="Timezone" value={formState.timezone} onChange={(value) => updateField("timezone", value)} />
        </div>

        <label className="ifu-field-label mt-6">
          IFU roles
          <select
            multiple
            size={10}
            value={formState.selectedRoleSlugs}
            onChange={(event) =>
              updateField(
                "selectedRoleSlugs",
                Array.from(event.currentTarget.selectedOptions, (option) => option.value),
              )
            }
            required
            className="ifu-field-control ifu-select mt-2 min-h-56"
          >
            {roles.map((role) => (
              <option key={role.slug} value={role.slug}>
                {role.categoryName} - {role.title}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="ifu-fieldset mt-6 p-4">
          <legend className="px-2">Interests</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {interestOptions.map((option) => (
              <label key={option} className="flex items-center gap-3 rounded-[var(--ifu-radius)] border border-[var(--ifu-border-soft)] bg-white px-3 py-3 text-sm font-medium text-[var(--ifu-muted-strong)]">
                <input
                  type="checkbox"
                  checked={formState.interests.includes(option)}
                  onChange={() => toggleInterest(option)}
                  className="ifu-checkbox"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <IFUActionLink href="/dashboard" variant="outline">
            Back to dashboard
          </IFUActionLink>
          <IFUActionButton type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            Save profile
          </IFUActionButton>
        </div>

        {statusMessage ? (
          <div
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
