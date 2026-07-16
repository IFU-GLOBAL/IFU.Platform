"use client";

import {
  ArrowRight,
  BadgeCheck,
  Globe2,
  Handshake,
  Mail,
  MessageCircle,
  Search,
  Share2,
  Sprout,
  UserRound,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { RegistrationForm } from "@/components/registration-form";
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

const navItems = [
  { label: "About Us", href: "/about-us/" },
  { label: "Platforms", href: "/platforms/" },
  { label: "Programs", href: "/programs/" },
  { label: "Insights", href: "/insights/" },
  { label: "Foundation", href: "/foundation/" },
  { label: "Gallery", href: "/gallery/" },
];

const cognitoLoginHref = "/api/auth/login?returnTo=%2Fdashboard";
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
  { value: "190+", label: "Countries", icon: Globe2 },
  { value: "2M+", label: "Farmers", icon: Users },
  { value: "500+", label: "Partners", icon: Handshake },
  { value: "50+", label: "Programs", icon: Sprout },
];

const allRolesPersona: DiscoveryPersona = {
  slug: "all",
  label: "Show me every IFU role",
  prompt: "Search across all 260 role pathways",
  description: "Use the full catalog if you already know the role name or want to compare every pathway.",
  categorySlugs: [],
};

const roleJourneySteps = ["Your role", "Your value", "Apply"];
const rolePageSize = 40;

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
    text: "Registrations create an early map of contributors, referrals, and implementation partners across regions.",
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
  const [visibleRoleCount, setVisibleRoleCount] = useState(rolePageSize);
  const [selectedRoleSlugs, setSelectedRoleSlugs] = useState<string[]>(initialRoleSlugs);

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
  const roleShareUrl = selectedRoleSlugs.length > 0
    ? `${discoveryShareUrl}?role=${encodeURIComponent(selectedRoleSlugs.join(","))}#role-matrix`
    : discoveryShareUrl;
  const encodedShareText = encodeURIComponent(`${invitationShareText} ${roleShareUrl}`);
  const shareLinks = [
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent("IFU invitation")}&body=${encodedShareText}`,
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
  const visibleRoles = filteredRoles.slice(0, visibleRoleCount);
  const hasMoreRoles = visibleRoles.length < filteredRoles.length;

  useEffect(() => {
    setVisibleRoleCount(rolePageSize);
  }, [categoryFilter, query, selectedPersonaSlug]);

  function toggleRole(slug: string) {
    setSelectedRoleSlugs((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  }

  function selectPersona(slug: string) {
    setSelectedPersonaSlug(slug);
    setCategoryFilter("all");
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
            <Link href="#ifu-registration" className="ifu-static-join">
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
              One platform. 10 ecosystems. Global agricultural reach. In less than a minute, choose your role and discover how IFU connects you to global opportunities, knowledge, funding, markets, training, and partnerships.
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
            <p className="ifu-static-facts__eyebrow">2030 vision</p>
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
            description={`This app currently includes ${metrics.categories} role categories, ${metrics.roles} seeded roles, ${metrics.countries} official placeholder country reach, and ${metrics.ecosystems} ecosystem pathways for early access discovery.`}
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
                  <span className="sr-only">Search IFU roles</span>
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ifu-muted)]" aria-hidden="true" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search roles, levels, ecosystems, or keywords"
                    aria-label="Search IFU roles"
                    className="ifu-field-control ifu-input h-12 !pl-12 pr-4"
                  />
                </label>

                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  aria-label="Filter IFU roles by category"
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
                  Showing <strong>{visibleRoles.length}</strong> of <strong>{filteredRoles.length}</strong> roles for <strong>{selectedPersona.label}</strong>
                </p>
                <p>
                  Search and filters still cover the full 260-role catalog.
                </p>
              </div>

              <div className="ifu-table-shell mt-4">
                <div className="ifu-role-table-scroll">
                  <table className="ifu-table ifu-role-table">
                    <caption className="sr-only">
                      IFU role selection table. Select one or more roles before registration.
                    </caption>
                    <thead className="sticky top-0 z-10">
                      <tr>
                        <th className="w-14">Select</th>
                        <th>Role</th>
                        <th>Level</th>
                        <th>Preview value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRoles.map((role) => {
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

              {hasMoreRoles ? (
                <div className="mt-4 flex justify-center">
                  <IFUActionButton
                    type="button"
                    variant="outline"
                    onClick={() => setVisibleRoleCount((current) => current + rolePageSize)}
                  >
                    Show {Math.min(rolePageSize, filteredRoles.length - visibleRoles.length)} more roles
                  </IFUActionButton>
                </div>
              ) : null}
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
                          aria-label={`Remove ${role.title} from selected roles`}
                          className="ifu-chip px-3 py-2"
                        >
                          {role.title}
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                    <div className="mt-5 grid gap-3">
                      <IFUActionLink href="#ifu-registration" icon={UserPlus}>
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
                      <IFUActionLink href="#ifu-registration" variant="outline" icon={UserPlus}>
                        Create IFU account
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

      <IFUSection id="ifu-registration">
        <IFUContainer size="wide" className="py-12">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="grid content-start gap-4">
              <IFUSectionHeader
                eyebrow="IFU registration"
                title="Create your IFU account"
                description="Create your account to enter the IFU dashboard. Profile details and role matching continue after login."
                className="md:block"
                action={
                  <IFUActionLink href="/login?returnTo=%2Fdashboard" variant="outline">
                    Already have an account?
                  </IFUActionLink>
                }
              />
              <IFUInset className="px-4 py-3 text-sm text-[var(--ifu-muted)]">
                {selectedRoles.length > 0 ? (
                  <>
                    <span className="font-semibold text-[var(--ifu-heading)]">
                      {selectedRoles.length} selected role{selectedRoles.length === 1 ? "" : "s"}
                    </span>{" "}
                    will be attached to this account: {selectedRoles.map((role) => role.title).join(", ")}.
                  </>
                ) : (
                  "Select one or more Discovery roles above before registering to attach them to your account."
                )}
              </IFUInset>
            </div>

            <RegistrationForm
              selectedRoleSlugs={selectedRoleSlugs}
              initialUtm={{
                utmSource: "discovery",
                utmCampaign: selectedRoleSlugs.join(","),
                utmMedium: "role-matrix",
              }}
            />
          </div>
        </IFUContainer>
      </IFUSection>
    </IFUPage>
  );
}
