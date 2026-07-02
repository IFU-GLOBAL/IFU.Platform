"use client";

import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Globe2,
  Handshake,
  LoaderCircle,
  Search,
  Send,
  Sprout,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { DiscoveryCategory, DiscoveryRole } from "@/lib/role-catalog";

type Metrics = {
  categories: number;
  roles: number;
  countries: string;
  pathways: number;
};

type DiscoveryCenterProps = {
  categories: DiscoveryCategory[];
  metrics: Metrics;
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  organization: string;
  roleOrTitle: string;
  leadershipInterest: string;
  contributionInterests: string[];
  referralSource: string;
  referralDetail: string;
  recommendedContactName: string;
  recommendedContactEmail: string;
  recommendedContactRelationship: string;
  message: string;
};

const initialFormState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
  organization: "",
  roleOrTitle: "",
  leadershipInterest: "",
  contributionInterests: [],
  referralSource: "",
  referralDetail: "",
  recommendedContactName: "",
  recommendedContactEmail: "",
  recommendedContactRelationship: "",
  message: "",
};

const contributionOptions = [
  "Advisory council",
  "Training or mentoring",
  "Country or regional coordination",
  "Data and research support",
  "Funding or sponsorship",
  "Pilot program participation",
];

const referralOptions = [
  "IFU team member",
  "Friend or colleague",
  "Partner organization",
  "Conference or event",
  "Social media",
  "Search engine",
  "News or media",
  "Other",
];

const whyItems = [
  {
    title: "Connect the whole agricultural cycle",
    text: "IFU links production, learning, data, trade, funding, and impact so participants can move through one coordinated ecosystem.",
    icon: Sprout,
  },
  {
    title: "Match people to the right pathway",
    text: "Role-based discovery helps farmers, institutions, buyers, educators, and partners find the most useful starting point.",
    icon: Users,
  },
  {
    title: "Make collaboration more actionable",
    text: "Selected roles give IFU a practical signal for introductions, invitations, leadership interest, and follow-up priorities.",
    icon: Handshake,
  },
  {
    title: "Build trust before launch",
    text: "Preview submissions create an early map of contributors, referrals, and implementation partners across regions.",
    icon: BadgeCheck,
  },
];

function includesSearch(role: DiscoveryRole, query: string) {
  const haystack = `${role.title} ${role.summary} ${role.pathway} ${role.categoryName}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function DiscoveryCenter({ categories, metrics }: DiscoveryCenterProps) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedRoleSlugs, setSelectedRoleSlugs] = useState<string[]>([]);
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const roles = useMemo(() => categories.flatMap((category) => category.roles), [categories]);
  const rolesBySlug = useMemo(() => new Map(roles.map((role) => [role.slug, role])), [roles]);
  const selectedRoles = selectedRoleSlugs
    .map((slug) => rolesBySlug.get(slug))
    .filter((role): role is DiscoveryRole => Boolean(role));

  const filteredRoles = roles.filter((role) => {
    const matchesCategory = categoryFilter === "all" || role.categorySlug === categoryFilter;
    const matchesQuery = query.trim() === "" || includesSearch(role, query.trim());

    return matchesCategory && matchesQuery;
  });

  function updateField(field: keyof FormState, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function toggleContribution(value: string) {
    setFormState((current) => ({
      ...current,
      contributionInterests: current.contributionInterests.includes(value)
        ? current.contributionInterests.filter((item) => item !== value)
        : [...current.contributionInterests, value],
    }));
  }

  function toggleRole(slug: string) {
    setSelectedRoleSlugs((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setStatusMessage("");

    const response = await fetch("/api/preview-applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formState,
        selectedRoleSlugs,
      }),
    });

    const result = (await response.json()) as {
      ok?: boolean;
      error?: string;
      emailStatus?: string;
    };

    if (!response.ok || !result.ok) {
      setStatus("error");
      setStatusMessage(result.error ?? "Unable to submit the preview application");
      return;
    }

    setStatus("success");
    setStatusMessage(
      result.emailStatus === "sent"
        ? "Application submitted and confirmation email sent."
        : "Application submitted. Email confirmation is pending SES configuration.",
    );
    setFormState(initialFormState);
    setSelectedRoleSlugs([]);
  }

  return (
    <main className="min-h-screen bg-[#f6f8f4] text-[#18231d]">
      <section className="bg-[#102f24] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-14">
          <div className="flex flex-col justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="flex w-72 items-center justify-center sm:w-96">
                <Image
                  src="/images/ifu-logo-hero.png"
                  alt="International Farm Union logo"
                  width={610}
                  height={176}
                  priority
                  unoptimized
                  className="h-auto w-full"
                />
              </div>
              
              <div>
                <p className="text-md font-medium uppercase tracking-[0.18em] text-[#b9d66c]">
                  Preview invitation
                </p>
                <p className="mt-1 text-sm text-white/75">Early access role discovery</p>
              </div>
            </div>

            <div>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                IFU Role-Based Discovery & Education Center
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/78">
                Explore the IFU ecosystem by role, select the pathways that fit your work, and submit a preview application for guided follow-up.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#preview-application"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#b9d66c] px-5 text-sm font-semibold text-[#102f24] transition hover:bg-[#cbe780]"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Start preview application
              </a>
              <a
                href="#role-matrix"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Browse roles
              </a>
            </div>
          </div>

          <div className="grid gap-4 self-end sm:grid-cols-2">
            <MetricCard label="Role categories" value={String(metrics.categories)} icon={Building2} />
            <MetricCard label="Seeded roles" value={String(metrics.roles)} icon={Users} />
            <MetricCard label="Country reach" value={metrics.countries} icon={Globe2} />
            <MetricCard label="Pathways" value={String(metrics.pathways)} icon={ArrowRight} />
          </div>
        </div>
      </section>

      <section className="border-b border-[#dce4d7] bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">   
          <div className="flex min-h-64 flex-col justify-center rounded-md border border-[#d7e2d1] bg-[#f9fbf6] p-6">
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-[#16241c] sm:text-5xl lg:text-6xl">
              Why IFU Matters
            </h1> 
          </div>        


          <div className="grid gap-4 sm:grid-cols-2">
            {whyItems.map((item) => (
              <div key={item.title} className="rounded-md border border-[#d7e2d1] bg-white p-5">
                <item.icon className="h-5 w-5 text-[#357244]" aria-hidden="true" />
                <h3 className="mt-4 text-base font-semibold text-[#16241c]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5d695f]">{item.text}</p>
              </div>
            ))}
          </div>
                      <div className="rounded-md border border-[#d7e2d1] bg-[#f9fbf6] p-6">
              <h2 className="mt-3 text-2xl font-semibold text-[#16241c]">
                You are invited to preview the IFU ecosystem before public rollout.
              </h2>
            <p className="mt-4 leading-7 text-[#536157]">
              This center helps IFU understand where each person, organization, or partner fits: learning, leadership, coordination, funding, data, marketplace participation, or community impact.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#eef4ec]" id="role-matrix">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#587126]">
                Role matrix
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-[#16241c]">Search and select your IFU roles</h2>
            </div>
            <div className="rounded-md border border-[#cfddc8] bg-white px-4 py-3 text-sm text-[#536157]">
              <span className="font-semibold text-[#16241c]">{selectedRoles.length}</span> selected
            </div>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_280px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#66746a]" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search roles, pathways, categories, or keywords"
                className="h-12 w-full rounded-md border border-[#cbd9c5] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#4d8c58] focus:ring-4 focus:ring-[#4d8c58]/15"
              />
            </label>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-12 rounded-md border border-[#cbd9c5] bg-white px-4 text-sm outline-none transition focus:border-[#4d8c58] focus:ring-4 focus:ring-[#4d8c58]/15"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 overflow-hidden rounded-md border border-[#cfddc8] bg-white">
            <div className="max-h-[560px] overflow-auto">
              <table className="min-w-[920px] w-full border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-[#f8faf6] text-xs uppercase tracking-[0.08em] text-[#66746a]">
                  <tr>
                    <th className="w-14 border-b border-[#dce4d7] px-4 py-3">Select</th>
                    <th className="border-b border-[#dce4d7] px-4 py-3">Role</th>
                    <th className="border-b border-[#dce4d7] px-4 py-3">Category</th>
                    <th className="border-b border-[#dce4d7] px-4 py-3">Pathway</th>
                    <th className="border-b border-[#dce4d7] px-4 py-3">Preview value</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((role) => {
                    const selected = selectedRoleSlugs.includes(role.slug);

                    return (
                      <tr key={role.slug} className={selected ? "bg-[#f0f7e7]" : "bg-white"}>
                        <td className="border-b border-[#edf1ea] px-4 py-3 align-top">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleRole(role.slug)}
                            aria-label={`Select ${role.title}`}
                            className="h-4 w-4 rounded border-[#9caf95] text-[#2f6f3d] focus:ring-[#2f6f3d]"
                          />
                        </td>
                        <td className="border-b border-[#edf1ea] px-4 py-3 align-top font-medium text-[#16241c]">
                          {role.title}
                        </td>
                        <td className="border-b border-[#edf1ea] px-4 py-3 align-top text-[#536157]">
                          {role.categoryName}
                        </td>
                        <td className="border-b border-[#edf1ea] px-4 py-3 align-top">
                          <span className="rounded-md bg-[#e8f2e2] px-2 py-1 text-xs font-semibold text-[#315f3a]">
                            {role.pathway}
                          </span>
                        </td>
                        <td className="border-b border-[#edf1ea] px-4 py-3 align-top text-[#536157]">
                          {role.summary}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {selectedRoles.length > 0 ? (
            <div className="mt-5 rounded-md border border-[#cfddc8] bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-[#16241c]">Selected roles</h3>
                <button
                  type="button"
                  onClick={() => setSelectedRoleSlugs([])}
                  className="inline-flex items-center gap-1 rounded-md border border-[#d7e2d1] px-3 py-2 text-xs font-semibold text-[#536157] transition hover:bg-[#f8faf6]"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedRoles.map((role) => (
                  <button
                    key={role.slug}
                    type="button"
                    onClick={() => toggleRole(role.slug)}
                    className="inline-flex items-center gap-2 rounded-md bg-[#e8f2e2] px-3 py-2 text-xs font-medium text-[#315f3a]"
                  >
                    {role.title}
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-white" id="preview-application">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#587126]">
                Preview application
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-[#16241c]">Share your contact and contribution interests</h2>
              <p className="mt-4 leading-7 text-[#536157]">
                IFU will reach out to coordinate preview invitations, leadership pathways, referrals, and recommended follow-up.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-md border border-[#d7e2d1] bg-[#f9fbf6] p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="First name" value={formState.firstName} onChange={(value) => updateField("firstName", value)} required />
                <TextInput label="Last name" value={formState.lastName} onChange={(value) => updateField("lastName", value)} required />
                <TextInput label="Email" type="email" value={formState.email} onChange={(value) => updateField("email", value)} required />
                <TextInput label="Phone" value={formState.phone} onChange={(value) => updateField("phone", value)} />
                <TextInput label="Country" value={formState.country} onChange={(value) => updateField("country", value)} />
                <TextInput label="Organization" value={formState.organization} onChange={(value) => updateField("organization", value)} />
                <TextInput label="Current role or title" value={formState.roleOrTitle} onChange={(value) => updateField("roleOrTitle", value)} className="sm:col-span-2" />
              </div>

              <fieldset className="mt-6 rounded-md border border-[#d7e2d1] bg-white p-4">
                <legend className="px-2 text-sm font-semibold text-[#16241c]">Leadership and contribution interest</legend>
                <label className="mt-2 block text-sm font-medium text-[#3c4a40]">
                  Leadership interest
                  <select
                    value={formState.leadershipInterest}
                    onChange={(event) => updateField("leadershipInterest", event.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-[#cbd9c5] bg-white px-3 text-sm outline-none focus:border-[#4d8c58] focus:ring-4 focus:ring-[#4d8c58]/15"
                  >
                    <option value="">Select one</option>
                    <option value="Interested in leadership">Interested in leadership</option>
                    <option value="Interested later">Interested later</option>
                    <option value="Contributor only">Contributor only</option>
                    <option value="Not sure yet">Not sure yet</option>
                  </select>
                </label>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {contributionOptions.map((option) => (
                    <label key={option} className="flex items-center gap-3 rounded-md border border-[#e3eadf] bg-[#fbfdf9] px-3 py-3 text-sm text-[#3c4a40]">
                      <input
                        type="checkbox"
                        checked={formState.contributionInterests.includes(option)}
                        onChange={() => toggleContribution(option)}
                        className="h-4 w-4 rounded border-[#9caf95] text-[#2f6f3d] focus:ring-[#2f6f3d]"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-6 rounded-md border border-[#d7e2d1] bg-white p-4">
                <legend className="px-2 text-sm font-semibold text-[#16241c]">Referral tracking</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-[#3c4a40]">
                    How did you hear about IFU?
                    <select
                      value={formState.referralSource}
                      onChange={(event) => updateField("referralSource", event.target.value)}
                      className="mt-2 h-11 w-full rounded-md border border-[#cbd9c5] bg-white px-3 text-sm outline-none focus:border-[#4d8c58] focus:ring-4 focus:ring-[#4d8c58]/15"
                    >
                      <option value="">Select one</option>
                      {referralOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <TextInput label="Referral detail" value={formState.referralDetail} onChange={(value) => updateField("referralDetail", value)} />
                </div>
              </fieldset>

              <fieldset className="mt-6 rounded-md border border-[#d7e2d1] bg-white p-4">
                <legend className="px-2 text-sm font-semibold text-[#16241c]">Recommended contact or friend</legend>
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextInput label="Name" value={formState.recommendedContactName} onChange={(value) => updateField("recommendedContactName", value)} />
                  <TextInput label="Email" type="email" value={formState.recommendedContactEmail} onChange={(value) => updateField("recommendedContactEmail", value)} />
                  <TextInput label="Relationship" value={formState.recommendedContactRelationship} onChange={(value) => updateField("recommendedContactRelationship", value)} />
                </div>
              </fieldset>

              <label className="mt-6 block text-sm font-medium text-[#3c4a40]">
                Message
                <textarea
                  value={formState.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  rows={5}
                  className="mt-2 w-full rounded-md border border-[#cbd9c5] bg-white px-3 py-3 text-sm outline-none focus:border-[#4d8c58] focus:ring-4 focus:ring-[#4d8c58]/15"
                />
              </label>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#536157]">
                  {selectedRoles.length} role{selectedRoles.length === 1 ? "" : "s"} attached to this application.
                </p>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#245f35] px-5 text-sm font-semibold text-white transition hover:bg-[#1d4f2c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "submitting" ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden="true" />
                  )}
                  Submit preview application
                </button>
              </div>

              {statusMessage ? (
                <div
                  className={`mt-4 flex items-start gap-2 rounded-md border px-4 py-3 text-sm ${
                    status === "success"
                      ? "border-[#cfe2bf] bg-[#f0f7e7] text-[#315f3a]"
                      : "border-[#f0c7b8] bg-[#fff5f0] text-[#8a3b23]"
                  }`}
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <p>{statusMessage}</p>
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-md border border-white/15 bg-white/10 p-5">
      <Icon className="h-5 w-5 text-[#b9d66c]" aria-hidden="true" />
      <p className="mt-5 text-4xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-white/70">{label}</p>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block text-sm font-medium text-[#3c4a40] ${className}`}>
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-2 h-11 w-full rounded-md border border-[#cbd9c5] bg-white px-3 text-sm outline-none focus:border-[#4d8c58] focus:ring-4 focus:ring-[#4d8c58]/15"
      />
    </label>
  );
}
