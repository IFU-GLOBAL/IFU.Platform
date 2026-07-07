"use client";

import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Globe2,
  Handshake,
  Languages,
  LoaderCircle,
  Play,
  Search,
  Send,
  Sprout,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  IFUActionButton,
  IFUActionLink,
  IFUCard,
  IFUContainer,
  IFUInset,
  IFUPage,
  IFUSection,
  IFUSectionHeader,
  cn,
} from "@/components/ifu-ui";
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

const navItems = [
  { label: "About Us", href: "#welcome" },
  { label: "Platforms", href: "#role-matrix" },
  { label: "Programs", href: "#preview-application" },
  { label: "Insights", href: "#role-matrix" },
  { label: "Foundation", href: "#welcome" },
  { label: "Gallery", href: "#role-matrix" },
];

const impactStats = [
  { value: "190+", label: "Countries", icon: Globe2 },
  { value: "2M+", label: "Farmers", icon: Users },
  { value: "500+", label: "Partners", icon: Handshake },
  { value: "50+", label: "Projects", icon: Sprout },
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
    <IFUPage>
      <div className="ifu-static-topbar">
        <IFUContainer size="wide" className="ifu-static-topbar__inner">
          <div className="ifu-static-socials" aria-label="Social links">
            {["f", "x", "ig", "yt"].map((label) => (
              <a key={label} href="#welcome" aria-label={label}>
                {label}
              </a>
            ))}
          </div>
          <div className="ifu-static-language">
            <Languages className="h-4 w-4" aria-hidden="true" />
            <span>Global Language</span>
            <span className="ifu-static-language__select">English</span>
          </div>
        </IFUContainer>
      </div>

      <header className="ifu-static-header">
        <IFUContainer size="wide" className="ifu-static-header__inner">
          <Link href="/" className="ifu-static-logo" aria-label="International Farm Union home">
            <Image
              src="/LOGO-USE-WEB2.png"
              alt="International Farm Union"
              width={169}
              height={86}
              priority
              unoptimized
            />
          </Link>

          <nav className="ifu-static-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ifu-static-auth">
            <UserRound className="h-5 w-5" aria-hidden="true" />
            <Link href="/login">Login</Link>
            <span aria-hidden="true">|</span>
            <Link href="#preview-application" className="ifu-static-join">
              Join IFU
            </Link>
          </div>
        </IFUContainer>
      </header>

      <section className="ifu-static-hero" aria-labelledby="ifu-static-hero-title">
        <IFUContainer size="wide" className="ifu-static-hero__inner">
          <div className="ifu-static-hero__content">
            <h1 id="ifu-static-hero-title" className="ifu-static-title">
              <span>Uniting Farms.</span>
              <span className="ifu-static-title__green">United Future.</span>
            </h1>
            <p className="ifu-static-hero__copy">
              The International Farm Union Global Platform connects farmers, cooperatives, researchers, development institutions and buyers through AI-powered insights, real-time agricultural data, market access, and global collaboration tools.
            </p>
            <div className="ifu-static-hero__actions">
              <IFUActionLink href="#role-matrix" variant="primary" icon={ArrowRight} className="ifu-static-hero-button">
                Explore Platforms
              </IFUActionLink>
              <IFUActionLink href="#welcome" variant="ghost" icon={Play} className="ifu-static-hero-button ifu-static-hero-button-outline">
                Watch Video
              </IFUActionLink>
            </div>
          </div>
        </IFUContainer>
      </section>

      <section className="ifu-static-facts" aria-label="IFU reach">
        <IFUContainer size="wide">
          <div className="ifu-static-facts__bar">
            {impactStats.map((stat) => (
              <div key={stat.label} className="ifu-static-fact">
                <span className="ifu-static-fact__icon">
                  <stat.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="ifu-static-fact__content">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </span>
              </div>
            ))}
          </div>
        </IFUContainer>
      </section>

      <IFUSection id="welcome" className="ifu-welcome-section">
        <IFUContainer size="wide" className="py-14 lg:py-20">
          <div className="ifu-welcome-grid">
            <div className="ifu-welcome-copy">
              <h2 className="ifu-static-section-title">Welcome To IFU</h2>
              <p>
                The International Farm Union (IFU) is a global agricultural platform designed to connect farmers, cooperatives, researchers, development institutions, and buyers through a unified system that drives productivity, sustainability, and inclusive economic growth.
              </p>
              <p>
                At the core of IFU is a transformative model that integrates technology, data, and global trade to expand market access, strengthen rural economies, and improve livelihoods for farming communities worldwide.
              </p>
              <p>
                This preview center brings that same ecosystem into the platform app, helping visitors find roles, select pathways, and request guided follow-up before public rollout.
              </p>
              <IFUActionLink href="#preview-application" variant="primary" icon={ArrowRight} className="ifu-static-discover">
                Discover More
              </IFUActionLink>
            </div>

            <div className="ifu-welcome-images" aria-label="IFU field imagery">
              <Image
                src="/images/static-site/farmer-field.jpg"
                alt="Farmer harvesting crops in a field"
                width={408}
                height={612}
                className="ifu-welcome-images__primary"
                unoptimized
              />
              <Image
                src="/images/static-site/tractor-field.jpg"
                alt="Farmer driving a tractor"
                width={876}
                height={630}
                className="ifu-welcome-images__secondary"
                unoptimized
              />
            </div>
          </div>
        </IFUContainer>
      </IFUSection>

      <IFUSection>
        <IFUContainer size="wide" className="py-12 lg:py-16">
          <IFUSectionHeader
            eyebrow="Role-based preview"
            title="A coordinated ecosystem for agriculture"
            description={`This app currently includes ${metrics.categories} role categories, ${metrics.roles} seeded roles, ${metrics.countries} country reach, and ${metrics.pathways} pathways for early access discovery.`}
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <IFUCard tone="muted" className="p-6">
              <BadgeCheck className="ifu-icon h-6 w-6" aria-hidden="true" />
              <h2 className="mt-4 text-2xl font-bold text-[var(--ifu-heading)]">
                You are invited to preview the IFU ecosystem before public rollout.
              </h2>
              <p className="ifu-copy mt-4">
                This center helps IFU understand where each person, organization, or partner fits: learning, leadership, coordination, funding, data, marketplace participation, or community impact.
              </p>
            </IFUCard>

            <div className="grid gap-4 sm:grid-cols-2">
              {whyItems.map((item) => (
                <IFUCard key={item.title} className="p-5">
                  <item.icon className="ifu-icon h-5 w-5" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-bold text-[var(--ifu-heading)]">{item.title}</h3>
                  <p className="ifu-copy mt-2 text-sm">{item.text}</p>
                </IFUCard>
              ))}
            </div>
          </div>
        </IFUContainer>
      </IFUSection>

      <IFUSection tone="muted" id="role-matrix">
        <IFUContainer size="wide" className="py-12">
          <IFUSectionHeader
            eyebrow="Role matrix"
            title="Search and select your IFU roles"
            action={
              <IFUInset className="px-4 py-3 text-sm text-[var(--ifu-muted)]">
              <span className="font-semibold text-[var(--ifu-heading)]">{selectedRoles.length}</span> selected
              </IFUInset>
            }
          />

          <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_280px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ifu-muted)]" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search roles, pathways, categories, or keywords"
                className="ifu-field-control ifu-input h-12 !pl-12 pr-4"              />
            </label>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="ifu-field-control ifu-select h-12"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="ifu-table-shell mt-5">
            <div className="max-h-[560px] overflow-auto">
              <table className="ifu-table">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th className="w-14">Select</th>
                    <th>Role</th>
                    <th>Category</th>
                    <th>Pathway</th>
                    <th>Preview value</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((role) => {
                    const selected = selectedRoleSlugs.includes(role.slug);

                    return (
                      <tr key={role.slug} className={selected ? "bg-[var(--ifu-selected)]" : "bg-white"}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleRole(role.slug)}
                            aria-label={`Select ${role.title}`}
                            className="ifu-checkbox"
                          />
                        </td>
                        <td className="font-semibold text-[var(--ifu-heading)]">
                          {role.title}
                        </td>
                        <td className="text-[var(--ifu-muted)]">
                          {role.categoryName}
                        </td>
                        <td>
                          <span className="ifu-chip px-2 py-1">
                            {role.pathway}
                          </span>
                        </td>
                        <td className="text-[var(--ifu-muted)]">
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
            <IFUCard className="mt-5 p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-[var(--ifu-heading)]">Selected roles</h3>
                <IFUActionButton
                  type="button"
                  onClick={() => setSelectedRoleSlugs([])}
                  variant="outline"
                  className="ifu-button-compact"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear
                </IFUActionButton>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedRoles.map((role) => (
                  <button
                    key={role.slug}
                    type="button"
                    onClick={() => toggleRole(role.slug)}
                    className="ifu-chip px-3 py-2"
                  >
                    {role.title}
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </IFUCard>
          ) : null}
        </IFUContainer>
      </IFUSection>

      <IFUSection id="preview-application">
        <IFUContainer size="wide" className="py-12">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <IFUSectionHeader
              eyebrow="Preview application"
              title="Share your contact and contribution interests"
              description="IFU will reach out to coordinate preview invitations, leadership pathways, referrals, and recommended follow-up."
              className="md:block"
            />

            <form onSubmit={handleSubmit} className="ifu-card ifu-card-muted p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput label="First name" value={formState.firstName} onChange={(value) => updateField("firstName", value)} required />
                <TextInput label="Last name" value={formState.lastName} onChange={(value) => updateField("lastName", value)} required />
                <TextInput label="Email" type="email" value={formState.email} onChange={(value) => updateField("email", value)} required />
                <TextInput label="Phone" value={formState.phone} onChange={(value) => updateField("phone", value)} />
                <TextInput label="Country" value={formState.country} onChange={(value) => updateField("country", value)} />
                <TextInput label="Organization" value={formState.organization} onChange={(value) => updateField("organization", value)} />
                <TextInput label="Current role or title" value={formState.roleOrTitle} onChange={(value) => updateField("roleOrTitle", value)} className="sm:col-span-2" />
              </div>

              <fieldset className="ifu-fieldset mt-6 p-4">
                <legend className="px-2">Leadership and contribution interest</legend>
                <label className="ifu-field-label mt-2">
                  Leadership interest
                  <select
                    value={formState.leadershipInterest}
                    onChange={(event) => updateField("leadershipInterest", event.target.value)}
                    className="ifu-field-control ifu-select mt-2"
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
                    <label key={option} className="flex items-center gap-3 rounded-[var(--ifu-radius)] border border-[var(--ifu-border-soft)] bg-white px-3 py-3 text-sm font-medium text-[var(--ifu-muted-strong)]">
                      <input
                        type="checkbox"
                        checked={formState.contributionInterests.includes(option)}
                        onChange={() => toggleContribution(option)}
                        className="ifu-checkbox"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="ifu-fieldset mt-6 p-4">
                <legend className="px-2">Referral tracking</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="ifu-field-label">
                    How did you hear about IFU?
                    <select
                      value={formState.referralSource}
                      onChange={(event) => updateField("referralSource", event.target.value)}
                      className="ifu-field-control ifu-select mt-2"
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

              <fieldset className="ifu-fieldset mt-6 p-4">
                <legend className="px-2">Recommended contact or friend</legend>
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextInput label="Name" value={formState.recommendedContactName} onChange={(value) => updateField("recommendedContactName", value)} />
                  <TextInput label="Email" type="email" value={formState.recommendedContactEmail} onChange={(value) => updateField("recommendedContactEmail", value)} />
                  <TextInput label="Relationship" value={formState.recommendedContactRelationship} onChange={(value) => updateField("recommendedContactRelationship", value)} />
                </div>
              </fieldset>

              <label className="ifu-field-label mt-6">
                Message
                <textarea
                  value={formState.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  rows={5}
                  className="ifu-field-control ifu-textarea mt-2"
                />
              </label>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="ifu-copy text-sm">
                  {selectedRoles.length} role{selectedRoles.length === 1 ? "" : "s"} attached to this application.
                </p>
                <IFUActionButton
                  type="submit"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden="true" />
                  )}
                  Submit preview application
                </IFUActionButton>
              </div>

              {statusMessage ? (
                <div
                  className={cn(
                    "ifu-status mt-4",
                    status === "success"
                      ? "ifu-status-success"
                      : "ifu-status-error",
                  )}
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <p>{statusMessage}</p>
                </div>
              ) : null}
            </form>
          </div>
        </IFUContainer>
      </IFUSection>
    </IFUPage>
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
    <label className={`ifu-field-label ${className}`}>
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="ifu-field-control ifu-input mt-2"
      />
    </label>
  );
}
