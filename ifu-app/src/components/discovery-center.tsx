"use client";

import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Globe2,
  Handshake,
  LoaderCircle,
  Mail,
  MessageCircle,
  Search,
  Send,
  Share2,
  Sprout,
  UserRound,
  UserPlus,
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
import { GTranslateWidget } from "@/components/gtranslate-widget";
import {
  discoveryPersonas,
  type DiscoveryCategory,
  type DiscoveryPersona,
  type DiscoveryRole,
} from "@/lib/role-catalog";

type Metrics = {
  categories: number;
  roles: number;
  countries: string;
  ecosystems: number;
};

type DiscoveryCenterProps = {
  categories: DiscoveryCategory[];
  metrics: Metrics;
  initialPersonaSlug?: string;
  initialRoleSlugs?: string[];
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
  privacyConsent: boolean;
  referralConsent: boolean;
  website: string;
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
  privacyConsent: false,
  referralConsent: false,
  website: "",
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
  { label: "About Us", href: "/about-us/" },
  { label: "Platforms", href: "/platforms/" },
  { label: "Programs", href: "/programs/" },
  { label: "Insights", href: "/insights/" },
  { label: "Foundation", href: "/foundation/" },
  { label: "Gallery", href: "/gallery/" },
];

const cognitoLoginHref = "/api/auth/login?returnTo=%2Fprofile";
const cognitoRegisterHref = "/register";
const discoveryShareUrl = "https://ifuplatform.com/discovery";
const invitationShareText =
  "You are invited to preview the International Farm Union platform and choose the IFU role pathway that fits you.";

const socialLinks = [
  { label: "Facebook", shortLabel: "f", href: "https://facebook.com/IFUPlatform" },
  { label: "X", shortLabel: "x", href: "https://x.com/IFUPlatform" },
  { label: "Instagram", shortLabel: "ig", href: "https://instagram.com/IFUPlatform" },
  { label: "YouTube", shortLabel: "yt", href: "https://youtube.com/@IFUPlatform" },
];

const impactStats = [
  { value: "190+", label: "Countries Served", icon: Globe2 },
  { value: "2M+", label: "Farmers Empowered", icon: Users },
  { value: "500+", label: "Partners", icon: Handshake },
  { value: "50+", label: "Country Programs", icon: Sprout },
];

const allRolesPersona: DiscoveryPersona = {
  slug: "all",
  label: "Show me every IFU role",
  prompt: "Search across all 260 role pathways",
  description: "Use the full catalog if you already know the role name or want to compare every pathway.",
  categorySlugs: [],
};

const roleJourneySteps = ["Your role", "Your value", "Apply"];

const whyItems = [
  {
    title: "Connect the whole agricultural cycle",
    text: "IFU links production, learning, data, trade, funding, and impact so participants can move through one coordinated ecosystem.",
    icon: Sprout,
  },
  {
    title: "Match people to the right role",
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
  const haystack = `${role.title} ${role.summary} ${role.pathway} ${role.categoryName} ${role.level} ${role.ecosystems.join(" ")} ${role.personaLabel}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function DiscoveryCenter({
  categories,
  metrics,
  initialPersonaSlug,
  initialRoleSlugs = [],
}: DiscoveryCenterProps) {
  const normalizedInitialPersonaSlug =
    initialPersonaSlug === "all" || discoveryPersonas.some((persona) => persona.slug === initialPersonaSlug)
      ? initialPersonaSlug
      : undefined;
  const [query, setQuery] = useState("");
  const [selectedPersonaSlug, setSelectedPersonaSlug] = useState(
    normalizedInitialPersonaSlug ??
      (initialRoleSlugs.length > 0 ? "all" : discoveryPersonas[0]?.slug ?? "all"),
  );
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedRoleSlugs, setSelectedRoleSlugs] = useState<string[]>(initialRoleSlugs);
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const roles = useMemo(() => categories.flatMap((category) => category.roles), [categories]);
  const rolesBySlug = useMemo(() => new Map(roles.map((role) => [role.slug, role])), [roles]);
  const personaOptions = useMemo(() => discoveryPersonas, []);
  const selectablePersonaOptions = useMemo(() => [allRolesPersona, ...discoveryPersonas], []);
  const selectedPersona =
    selectablePersonaOptions.find((persona) => persona.slug === selectedPersonaSlug) ?? allRolesPersona;
  const selectedRoles = selectedRoleSlugs
    .map((slug) => rolesBySlug.get(slug))
    .filter((role): role is DiscoveryRole => Boolean(role));
  const primarySelectedRole = selectedRoles[0];
  const referralHasData = Boolean(
    formState.recommendedContactName ||
      formState.recommendedContactEmail ||
      formState.recommendedContactRelationship,
  );
  const roleShareUrl = selectedRoleSlugs.length > 0
    ? `${discoveryShareUrl}?role=${encodeURIComponent(selectedRoleSlugs.join(","))}#role-matrix`
    : discoveryShareUrl;
  const encodedShareText = encodeURIComponent(`${invitationShareText} ${roleShareUrl}`);
  const shareLinks = [
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent("IFU preview invitation")}&body=${encodedShareText}`,
      icon: Mail,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(roleShareUrl)}`,
      icon: Share2,
      external: true,
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedShareText}`,
      icon: MessageCircle,
      external: true,
    },
  ];

  const filteredRoles = roles.filter((role) => {
    const matchesPersona = selectedPersonaSlug === "all" || role.personaSlug === selectedPersonaSlug;
    const matchesCategory = categoryFilter === "all" || role.categorySlug === categoryFilter;
    const matchesQuery = query.trim() === "" || includesSearch(role, query.trim());

    return matchesPersona && matchesCategory && matchesQuery;
  });

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
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

  function selectPersona(slug: string) {
    setSelectedPersonaSlug(slug);
    setCategoryFilter("all");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setStatusMessage("");

    if (formState.website) {
      setStatus("success");
      setStatusMessage("Application submitted.");
      return;
    }

    if (!formState.privacyConsent) {
      setStatus("error");
      setStatusMessage("Privacy consent is required before IFU can review your preview application.");
      return;
    }

    if (referralHasData && !formState.referralConsent) {
      setStatus("error");
      setStatusMessage("Referral consent is required when recommending another contact.");
      return;
    }

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
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                aria-label={`${link.label} placeholder`}
                target="_blank"
                rel="noreferrer"
              >
                {link.shortLabel}
              </a>
            ))}
          </div>
          <GTranslateWidget id="discovery" />
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
            <Link href={cognitoLoginHref}>Login</Link>
            <span aria-hidden="true">|</span>
            <Link href={cognitoRegisterHref} className="ifu-static-join">
              Join IFU
            </Link>
          </div>
        </IFUContainer>
      </header>

      <section className="ifu-static-hero" aria-labelledby="ifu-static-hero-title">
        <IFUContainer size="wide" className="ifu-static-hero__inner">
          <div className="ifu-static-hero__content">
            <p className="ifu-eyebrow text-white/80">IFU Role-Based Discovery & Education Center</p>
            <h1 id="ifu-static-hero-title" className="ifu-static-title">
              <span>You Are Invited To Preview The Future Of Global Agriculture -</span>
              <span className="ifu-static-title__green">IFU Platform</span>
            </h1>
            <p className="ifu-static-hero__copy">
              One platform. 10 ecosystems. 190+ countries. Built for everyone in agriculture. In less than a minute, choose your role and discover how IFU connects you to global opportunities, knowledge, funding, markets, training, and partnerships.
            </p>
            <div className="ifu-static-hero__actions">
              <IFUActionLink href="#role-matrix" variant="primary" icon={ArrowRight} className="ifu-static-hero-button">
                Choose Your IFU Role
              </IFUActionLink>
              <IFUActionLink href="/invitation" variant="ghost" icon={ArrowRight} className="ifu-static-hero-button ifu-static-hero-button-outline">
                Read Invitation Letter
              </IFUActionLink>
            </div>
          </div>
        </IFUContainer>
      </section>

      <section className="ifu-static-facts" aria-label="IFU reach">
        <IFUContainer size="wide">
          <div className="ifu-static-facts__bar">
            <p className="ifu-static-facts__eyebrow">Our 2030 Vision</p>
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
            description={`This app currently includes ${metrics.categories} role categories, ${metrics.roles} seeded roles, ${metrics.countries} country reach, and ${metrics.ecosystems} ecosystems for early access discovery.`}
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
              <IFUActionLink href="/invitation" variant="outline" icon={ArrowRight} className="mt-6">
                Read invitation letter
              </IFUActionLink>
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

      <IFUSection tone="muted" id="role-matrix" className="ifu-role-section">
        <IFUContainer size="wide" className="py-10 lg:py-12">
          <IFUSectionHeader
            eyebrow="Role matrix"
            title="Who are you in agriculture?"
            description="Choose the plain-language path that sounds most like you. IFU will show the most relevant roles first, while search still reaches the full role catalog."
            action={
              <IFUInset className="px-4 py-3 text-sm text-[var(--ifu-muted)]">
                <span className="font-semibold text-[var(--ifu-heading)]">{selectedRoles.length}</span> selected
              </IFUInset>
            }
          />

          <div className="ifu-role-steps mt-5" aria-label="Preview flow">
            {roleJourneySteps.map((step, index) => (
              <span key={step} className="ifu-role-step">
                <strong>{index + 1}</strong>
                {step}
              </span>
            ))}
          </div>

          <div className="ifu-persona-grid mt-6" aria-label="Choose your IFU persona">
            {personaOptions.map((persona) => {
              const active = selectedPersona.slug === persona.slug;

              return (
                <button
                  key={persona.slug}
                  type="button"
                  onClick={() => selectPersona(persona.slug)}
                  className={cn("ifu-persona-button", active && "ifu-persona-button-active")}
                  aria-pressed={active}
                >
                  <span className="ifu-persona-label">{persona.label}</span>
                  <span className="ifu-persona-prompt">{persona.prompt}</span>
                </button>
              );
            })}
          </div>

          <div className="ifu-role-workbench mt-6">
            <div className="ifu-role-list-panel">
              <div className="ifu-role-filter-row">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ifu-muted)]" aria-hidden="true" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search roles, levels, ecosystems, or keywords"
                    className="ifu-field-control ifu-input h-12 !pl-12 pr-4"
                  />
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

              <div className="ifu-role-filter-summary">
                <p>
                  Showing <strong>{filteredRoles.length}</strong> roles for <strong>{selectedPersona.label}</strong>
                </p>
                <p>
                  Level indicates typical career stage: Foundation, Professional, or Leadership. It does not limit which roles you may select.
                </p>
              </div>

              <div className="ifu-table-shell mt-4">
                <div className="ifu-role-table-scroll">
                  <table className="ifu-table ifu-role-table">
                    <thead className="sticky top-0 z-10">
                      <tr>
                        <th className="w-14">Select</th>
                        <th>Role</th>
                        <th>Level</th>
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
                            <td>
                              <p className="font-semibold text-[var(--ifu-heading)]">{role.title}</p>
                              <p className="mt-1 text-xs font-semibold text-[var(--ifu-muted)]">{role.categoryName}</p>
                              <div className="ifu-role-ecosystems mt-2">
                                {role.ecosystems.slice(0, 3).map((ecosystem) => (
                                  <span key={ecosystem}>{ecosystem}</span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <span className="ifu-chip px-2 py-1">{role.level}</span>
                            </td>
                            <td className="text-[var(--ifu-muted)]">
                              {role.summary}
                            </td>
                          </tr>
                        );
                      })}
                      {filteredRoles.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center text-[var(--ifu-muted)]">
                            No matching roles found.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="ifu-role-side-column">
              <aside className="ifu-role-selection-panel">
                <p className="ifu-eyebrow text-[var(--ifu-primary)]">Role selected</p>
                {primarySelectedRole ? (
                  <>
                    <h3 className="mt-2 text-2xl font-bold text-[var(--ifu-heading)]">
                      {primarySelectedRole.title}
                    </h3>
                    <p className="ifu-copy mt-3">{primarySelectedRole.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="ifu-chip px-3 py-2">{primarySelectedRole.level}</span>
                      {primarySelectedRole.ecosystems.map((ecosystem) => (
                        <span key={ecosystem} className="ifu-chip px-3 py-2">
                          {ecosystem}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="mt-2 text-2xl font-bold text-[var(--ifu-heading)]">
                      Select one role to see your IFU value.
                    </h3>
                    <p className="ifu-copy mt-3">{selectedPersona.description}</p>
                  </>
                )}

                {selectedRoles.length > 0 ? (
                  <div className="mt-5">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="text-sm font-bold text-[var(--ifu-heading)]">Selected roles</h4>
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
                    <div className="mt-5 grid gap-3">
                      <IFUActionLink href={cognitoRegisterHref} icon={UserPlus}>
                        Register
                      </IFUActionLink>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {shareLinks.map((link) => (
                          <IFUActionLink
                            key={link.label}
                            href={link.href}
                            variant="outline"
                            icon={link.icon}
                            target={link.external ? "_blank" : undefined}
                            rel={link.external ? "noreferrer" : undefined}
                            ariaLabel={`Share IFU invitation by ${link.label}`}
                            className="ifu-button-compact"
                          >
                            {link.label}
                          </IFUActionLink>
                        ))}
                      </div>
                      <IFUActionLink href="#preview-application" variant="outline" icon={Send}>
                        Share contact interests
                      </IFUActionLink>
                    </div>
                  </div>
                ) : null}
              </aside>

              <button
                type="button"
                onClick={() => selectPersona(allRolesPersona.slug)}
                className={cn(
                  "ifu-persona-button ifu-persona-button-sidebar",
                  selectedPersona.slug === allRolesPersona.slug && "ifu-persona-button-active",
                )}
                aria-pressed={selectedPersona.slug === allRolesPersona.slug}
              >
                <span className="ifu-persona-label">{allRolesPersona.label}</span>
                <span className="ifu-persona-prompt">{allRolesPersona.prompt}</span>
              </button>
            </div>
          </div>
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
                <TextInput label="Country" value={formState.country} onChange={(value) => updateField("country", value)} required />
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
                <p className="ifu-copy mt-2 text-sm">
                  Know someone who belongs in the IFU community? Please share their details only if they have agreed to be contacted by IFU. We will send them a single invitation mentioning that you recommended them, and nothing more unless they respond.
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextInput label="Name" value={formState.recommendedContactName} onChange={(value) => updateField("recommendedContactName", value)} />
                  <TextInput label="Email" type="email" value={formState.recommendedContactEmail} onChange={(value) => updateField("recommendedContactEmail", value)} />
                  <TextInput label="Relationship" value={formState.recommendedContactRelationship} onChange={(value) => updateField("recommendedContactRelationship", value)} />
                </div>
                <label className="ifu-consent-row mt-4">
                  <input
                    type="checkbox"
                    checked={formState.referralConsent}
                    onChange={(event) => updateField("referralConsent", event.target.checked)}
                    required={referralHasData}
                    className="ifu-checkbox"
                  />
                  <span>
                    I confirm this person has agreed to receive a one-time invitation from IFU, and I understand they can decline or ask for their details to be deleted.
                  </span>
                </label>
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

              <label className="ifu-honeypot" aria-hidden="true">
                Website
                <input
                  value={formState.website}
                  onChange={(event) => updateField("website", event.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>

              <label className="ifu-consent-row mt-6">
                <input
                  type="checkbox"
                  checked={formState.privacyConsent}
                  onChange={(event) => updateField("privacyConsent", event.target.checked)}
                  required
                  className="ifu-checkbox"
                />
                <span>
                  I agree that the International Farm Union (IFU) may store and process the information I have provided in order to review my application, contact me about my selected role, and send me updates about the IFU Platform launch. I understand my data will never be sold, I may withdraw consent at any time, and I can request deletion of my data by emailing privacy@ifuplatform.com. I have read the{" "}
                  <Link href="/privacy" className="font-bold text-[var(--ifu-primary-deep)] underline">
                    IFU Privacy Notice
                  </Link>
                  .
                </span>
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
