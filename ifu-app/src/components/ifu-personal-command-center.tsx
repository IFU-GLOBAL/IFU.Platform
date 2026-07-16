"use client";

import {
  Archive,
  BadgeDollarSign,
  BriefcaseBusiness,
  CheckSquare,
  FileText,
  Globe2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Map,
  MessageSquareText,
  Network,
  PanelsTopLeft,
  Route,
  SearchCheck,
  Settings,
  ShieldCheck,
  ShoppingBasket,
  Sprout,
  Star,
  Tractor,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { IFUActionLink, cn } from "@/components/ifu-ui";
import { MiniGeoGlobalMap } from "@/components/mini-geo-global-map";
import { SlideOverDrawer } from "@/components/slide-over-drawer";
import type {
  DashboardDrawerItem,
  DashboardIconKey,
  DashboardViewModel,
} from "@/lib/dashboard-model";

const iconMap = {
  archive: Archive,
  badgeDollarSign: BadgeDollarSign,
  briefcaseBusiness: BriefcaseBusiness,
  checkSquare: CheckSquare,
  fileText: FileText,
  globe: Globe2,
  graduationCap: GraduationCap,
  layoutDashboard: LayoutDashboard,
  map: Map,
  messageSquareText: MessageSquareText,
  network: Network,
  panelsTopLeft: PanelsTopLeft,
  route: Route,
  searchCheck: SearchCheck,
  settings: Settings,
  shieldCheck: ShieldCheck,
  shoppingBasket: ShoppingBasket,
  sprout: Sprout,
  star: Star,
  tractor: Tractor,
  usersRound: UsersRound,
} satisfies Record<DashboardIconKey, typeof LayoutDashboard>;

type IFUPersonalCommandCenterProps = {
  view: DashboardViewModel;
};

type SectionPageConfig = {
  eyebrow: string;
  title: string;
  description: string;
  steps: string[];
};

function getIcon(iconKey?: DashboardIconKey) {
  return iconMap[iconKey ?? "layoutDashboard"] ?? LayoutDashboard;
}

const HOME_SECTION_ID = "dashboard-home";
const WORKSPACE_SECTION_ID = "workspace";
const GLOBAL_MAP_SECTION_ID = "global-map";

const commonFilterTerms = new Set([
  "dashboard",
  "recommended",
  "opportunities",
  "opportunity",
  "section",
  "platform",
  "workspace",
]);

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 3 && !commonFilterTerms.has(term));
}

function itemMatchesSection(item: DashboardDrawerItem, section: DashboardDrawerItem) {
  const text = `${item.id} ${item.title} ${item.type} ${item.summary} ${item.description}`.toLowerCase();
  const terms = tokenize(`${section.id} ${section.title} ${section.type}`);

  return terms.some((term) => text.includes(term));
}

function getRelatedItems(
  items: DashboardDrawerItem[],
  section: DashboardDrawerItem,
  limit: number,
) {
  if (section.id === HOME_SECTION_ID) {
    return items.slice(0, limit);
  }

  const matches = items.filter((item) => itemMatchesSection(item, section));
  return (matches.length > 0 ? matches : items).slice(0, limit);
}

const sectionPages: Record<string, SectionPageConfig> = {
  [WORKSPACE_SECTION_ID]: {
    eyebrow: "Workspace",
    title: "My IFU Workspace",
    description:
      "Review active profile, funding, marketplace, and training tasks in one operating queue.",
    steps: ["Confirm profile details", "Pick one active opportunity", "Move ready items to submission"],
  },
  "daily-journey": {
    eyebrow: "Daily journey",
    title: "My Daily Journey",
    description:
      "Work through a short sequence of priority actions based on profile status, role, and current IFU opportunities.",
    steps: ["Review today's match", "Save or dismiss", "Complete one profile improvement"],
  },
  "recommended-pathway": {
    eyebrow: "Recommended pathway",
    title: "Recommended Pathway",
    description:
      "Follow a role-based route from onboarding into training, opportunities, funding, and network actions.",
    steps: ["Set primary role", "Complete profile", "Start training", "Review opportunities", "Connect with IFU network"],
  },
};

function DashboardSectionPage({
  page,
  cards,
  ecosystemItems,
  workspaceItems,
  onSelectItem,
}: {
  page: SectionPageConfig;
  cards: DashboardDrawerItem[];
  ecosystemItems: DashboardDrawerItem[];
  workspaceItems: DashboardDrawerItem[];
  onSelectItem: (item: DashboardDrawerItem) => void;
}) {
  const metrics = [
    {
      label: "Next actions",
      value: String(workspaceItems.length),
      helper: "Workspace items ready for follow-up",
      iconKey: "checkSquare" as const,
    },
    {
      label: "Recommendations",
      value: String(cards.length),
      helper: "Role-based opportunities and resources",
      iconKey: "star" as const,
    },
    {
      label: "Ecosystems",
      value: String(ecosystemItems.length),
      helper: "Connected IFU operating pathways",
      iconKey: "sprout" as const,
    },
  ];
  const primaryWorkspaceItems = workspaceItems.slice(0, 5);
  const primaryCards = cards.slice(0, 4);
  const primaryEcosystemItems = ecosystemItems.slice(0, 6);

  return (
    <section className="rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white p-4 shadow-[var(--ifu-shadow)]">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="max-w-3xl">
          <p className="ifu-eyebrow text-[var(--ifu-primary)]">{page.eyebrow}</p>
          <h2 className="mt-1 text-2xl font-bold leading-tight text-[var(--ifu-heading)]">
            {page.title}
          </h2>
          <p className="mt-2 text-sm leading-5 text-[var(--ifu-muted-strong)]">
            {page.description}
          </p>
        </div>
        <span className="rounded-[var(--ifu-radius)] bg-[var(--ifu-chip)] px-3 py-2 text-xs font-bold uppercase leading-tight text-[var(--ifu-primary-deep)]">
          Personalized
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = getIcon(metric.iconKey);

          return (
            <div
              key={metric.label}
              className="rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-[var(--ifu-surface-muted)] p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase leading-tight text-[var(--ifu-muted)]">
                    {metric.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold leading-tight text-[var(--ifu-heading)]">
                    {metric.value}
                  </p>
                </div>
                <Icon className="h-5 w-5 text-[var(--ifu-primary)]" />
              </div>
              <p className="mt-2 text-xs font-semibold leading-tight text-[var(--ifu-muted-strong)]">
                {metric.helper}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <article className="rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white p-4 shadow-[var(--ifu-shadow)]">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--ifu-radius)] bg-[var(--ifu-chip)] text-[var(--ifu-primary-deep)]">
              <BriefcaseBusiness className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-lg font-bold leading-tight text-[var(--ifu-heading)]">
                Active Workspace
              </h3>
              <p className="mt-1 text-sm leading-5 text-[var(--ifu-muted)]">
                Open tasks, profile actions, and saved next steps stay grouped here.
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-2">
            {primaryWorkspaceItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem(item)}
                className="flex items-center gap-2 rounded-[var(--ifu-radius)] bg-[var(--ifu-surface-muted)] px-3 py-2 text-left text-sm font-semibold leading-tight text-[var(--ifu-muted-strong)] transition hover:bg-white"
              >
                <CheckSquare className="h-4 w-4 shrink-0 text-[var(--ifu-primary)]" />
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white p-4 shadow-[var(--ifu-shadow)]">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--ifu-radius)] bg-[var(--ifu-chip)] text-[var(--ifu-primary-deep)]">
              <Star className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-lg font-bold leading-tight text-[var(--ifu-heading)]">
                Recommended Resources
              </h3>
              <p className="mt-1 text-sm leading-5 text-[var(--ifu-muted)]">
                Role-based cards connect this page to opportunities, training, funding, and market actions.
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-2">
            {primaryCards.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem(item)}
                className="rounded-[var(--ifu-radius)] bg-[var(--ifu-surface-muted)] px-3 py-2 text-left text-sm font-semibold leading-tight text-[var(--ifu-muted-strong)] transition hover:bg-white"
              >
                <span className="block text-[var(--ifu-heading)]">{item.title}</span>
                <span className="mt-1 block text-xs font-medium text-[var(--ifu-muted)]">
                  {item.summary}
                </span>
              </button>
            ))}
          </div>
        </article>
      </div>

      <div className="mt-4 rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-[var(--ifu-surface-muted)] p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="ifu-eyebrow text-[var(--ifu-primary)]">Connected ecosystems</p>
            <h3 className="mt-1 text-lg font-bold leading-tight text-[var(--ifu-heading)]">
              IFU operating pathways
            </h3>
          </div>
          <Sprout className="hidden h-8 w-8 text-[var(--ifu-primary)] sm:block" />
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {primaryEcosystemItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className="rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white px-3 py-2 text-left text-sm font-bold leading-tight text-[var(--ifu-heading)] transition hover:border-[var(--ifu-primary)]"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-[#03182d] p-4 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">Action flow</p>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {page.steps.map((step, index) => (
            <div key={step} className="rounded-[var(--ifu-radius)] bg-white/8 p-3">
              <span className="text-xs font-bold text-[#9fe28d]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-1 text-sm font-semibold leading-tight">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IFUPersonalCommandCenter({ view }: IFUPersonalCommandCenterProps) {
  const [activeSectionId, setActiveSectionId] = useState(view.menu[0]?.id ?? HOME_SECTION_ID);
  const [drawerItem, setDrawerItem] = useState<DashboardDrawerItem | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const { profile } = view;
  const activeSection =
    view.menu.find((item) => item.id === activeSectionId) ?? view.menu[0];
  const activeSectionPage = activeSection ? sectionPages[activeSection.id] : undefined;
  const activeCards = activeSection
    ? getRelatedItems(
        view.cards,
        activeSection,
        activeSection.id === HOME_SECTION_ID ? view.cards.length : 6,
      )
    : [];
  const activeEcosystemItems = activeSection
    ? getRelatedItems(
        view.ecosystemItems,
        activeSection,
        activeSection.id === HOME_SECTION_ID ? view.ecosystemItems.length : 6,
      )
    : [];
  const activeWorkspaceItems = activeSection?.id === WORKSPACE_SECTION_ID
    ? view.workspaceItems
    : activeSection
      ? getRelatedItems(view.workspaceItems, activeSection, 4)
      : [];
  const ActiveSectionIcon = getIcon(activeSection?.iconKey);

  const sessionSummary = useMemo(
    () => ({
      id: "session-summary",
      title: "Authenticated IFU Session",
      type: "Session",
      summary: "Cognito-backed access is active for this private dashboard.",
      description:
        "The dashboard is protected by the IFU auth session and loads the member profile from PostgreSQL.",
      details: [
        `Member: ${profile.email ?? profile.fullName}`,
        `Role: ${profile.role}`,
        profile.sessionExpiresAt ? `Session expires: ${profile.sessionExpiresAt}` : "Session active",
      ],
      actions: ["Review Session", "Update Profile", "Close"],
      iconKey: "shieldCheck" as const,
    }),
    [profile],
  );

  async function persistDrawerAction(action: string, item: DashboardDrawerItem) {
    setActionStatus("Saving action...");

    try {
      const response = await fetch("/api/dashboard", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ action, item }),
      });
      const result = (await response.json()) as { ok?: boolean; result?: string; error?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Dashboard action failed");
      }

      setActionStatus(`Saved: ${result.result ?? "activity logged"}`);
    } catch (error) {
      setActionStatus(error instanceof Error ? error.message : "Dashboard action failed");
    }
  }

  function selectSection(sectionId: string) {
    setActiveSectionId(sectionId);
    setDrawerItem(null);
    setActionStatus(null);
  }

  if (!activeSection) {
    return null;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--ifu-band)] text-[var(--ifu-ink)]">
      <div className="grid min-h-screen min-w-0 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="min-w-0 bg-[#03182d] text-white lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
          <div className="border-b border-white/12 p-3 lg:p-4">
            <Image
              src="/images/ifu-logo-hero.png"
              alt="International Farm Union"
              width={610}
              height={176}
              priority
              unoptimized
              className="h-auto w-40"
            />
            <p className="mt-3 text-[0.68rem] font-bold uppercase leading-tight text-white/58">
              My IFU Personal Command Center
            </p>
          </div>
          <nav
            className="flex min-w-0 gap-1.5 overflow-x-auto p-2 lg:grid lg:gap-1 lg:overflow-visible"
            aria-label="Dashboard sections"
          >
            {view.menu.map((item, index) => {
              const Icon = getIcon(item.iconKey);
              const active = item.id === activeSection.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectSection(item.id)}
                  className={cn(
                    "flex min-h-9 min-w-48 items-center gap-2 rounded-[var(--ifu-radius)] px-2.5 py-1.5 text-left text-[0.82rem] font-semibold leading-tight transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:min-w-0",
                    active
                      ? "bg-white text-[#03182d]"
                      : "text-white/76 hover:bg-white/10 hover:text-white",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active ? "text-[var(--ifu-primary)]" : "text-[#7fc36e]")} />
                  <span className="min-w-0 flex-1">{item.title}</span>
                  <span className={cn("text-[0.68rem]", active ? "text-[#03182d]/48" : "text-white/34")}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="relative overflow-hidden border-b border-[var(--ifu-border)] bg-white">
            <div className="absolute inset-y-0 right-0 hidden w-[38%] lg:block">
              <Image
                src="/images/static-site/farmer-field.jpg"
                alt=""
                fill
                priority
                sizes="38vw"
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/72 to-white/8" />
            </div>

            <div className="relative z-10 max-w-6xl px-4 py-4 sm:px-5 lg:px-6">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div className="max-w-4xl">
                  <p className="ifu-eyebrow text-[var(--ifu-primary)]">Private dashboard</p>
                  <h1 className="mt-2 max-w-full break-words text-2xl font-bold leading-tight text-[var(--ifu-heading)] md:text-3xl">
                    Welcome To My IFU Personal Command Center Dashboard
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-5 text-[var(--ifu-muted-strong)]">
                    My personalized command center where I can save my bookmark, view my
                    opportunities, resources, tools, training, fundings, my network, my community,
                    and all my connections across the IFU global platform.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDrawerItem(sessionSummary)}
                    className="ifu-button ifu-button-outline bg-white"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Session
                  </button>
                  <IFUActionLink href="/api/auth/logout" variant="primary" icon={LogOut}>
                    Sign out
                  </IFUActionLink>
                </div>
              </div>
            </div>
          </header>

          <div className="grid max-w-6xl gap-4 px-4 py-4 sm:px-5 lg:px-6">
            {actionStatus ? (
              <div className="rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white px-3 py-2 text-sm font-semibold leading-tight text-[var(--ifu-muted-strong)]">
                {actionStatus}
              </div>
            ) : null}

            <section className="rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white p-4 shadow-[var(--ifu-shadow)]">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div className="flex min-w-0 gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--ifu-radius)] bg-[var(--ifu-chip)] text-[var(--ifu-primary-deep)]">
                    <ActiveSectionIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="ifu-eyebrow text-[var(--ifu-primary)]">{activeSection.type}</p>
                    <h2 className="mt-1 break-words text-2xl font-bold leading-tight text-[var(--ifu-heading)]">
                      {activeSection.title}
                    </h2>
                    <p className="mt-2 max-w-4xl text-sm leading-5 text-[var(--ifu-muted-strong)]">
                      {activeSection.description}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {activeSection.actions?.slice(0, 2).map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => persistDrawerAction(action, activeSection)}
                      className="ifu-button ifu-button-primary"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {activeSectionPage ? (
              <DashboardSectionPage
                page={activeSectionPage}
                cards={activeCards}
                ecosystemItems={activeEcosystemItems}
                workspaceItems={activeWorkspaceItems}
                onSelectItem={setDrawerItem}
              />
            ) : (
              <>
                {activeSection.id === HOME_SECTION_ID || activeSection.id === GLOBAL_MAP_SECTION_ID ? (
                  <MiniGeoGlobalMap profile={profile} onSelect={setDrawerItem} />
                ) : null}

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {activeCards.map((card) => {
                    const Icon = getIcon(card.iconKey);

                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setDrawerItem(card)}
                        className="group flex min-h-40 flex-col justify-between rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white p-4 text-left shadow-[var(--ifu-shadow)] transition hover:-translate-y-0.5 hover:border-[var(--ifu-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ifu-primary)]"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--ifu-radius)] bg-[var(--ifu-chip)] text-[var(--ifu-primary-deep)]">
                              <Icon className="h-4 w-4" />
                            </span>
                            {card.metric ? (
                              <span className="rounded-[var(--ifu-radius)] bg-[#f7efe1] px-2.5 py-1 text-xs font-bold text-[#7a4a12]">
                                {card.metric}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-3 text-xs font-bold uppercase leading-tight text-[var(--ifu-primary-deep)]">
                            {card.type}
                          </p>
                          <h2 className="mt-1 text-lg font-bold leading-tight text-[var(--ifu-heading)]">
                            {card.title}
                          </h2>
                          <p className="mt-2 text-sm leading-5 text-[var(--ifu-muted)]">
                            {card.summary}
                          </p>
                        </div>
                        <span className="mt-4 text-sm font-bold leading-tight text-[var(--ifu-primary-deep)]">
                          Open drawer
                        </span>
                      </button>
                    );
                  })}
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.65fr)]">
                  <div className="rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white p-4 shadow-[var(--ifu-shadow)]">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                      <div>
                        <p className="ifu-eyebrow text-[var(--ifu-primary)]">IFU ecosystem</p>
                        <h2 className="mt-1 text-xl font-bold leading-tight text-[var(--ifu-heading)]">
                          Powered By 10 Unified Ecosystems
                        </h2>
                        <p className="mt-1 text-sm leading-5 text-[var(--ifu-muted)]">
                          One Engine - One Platform - One Agricultural World. Everything You Need - All
                          In One Place.
                        </p>
                      </div>
                      <Globe2 className="hidden h-10 w-10 text-[var(--ifu-primary)] sm:block" />
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {activeEcosystemItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setDrawerItem(item)}
                          className="rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-[var(--ifu-surface-muted)] px-2.5 py-2 text-left text-[0.82rem] font-bold leading-tight text-[var(--ifu-heading)] transition hover:border-[var(--ifu-primary)] hover:bg-white"
                        >
                          <Sprout className="mb-1 h-4 w-4 text-[var(--ifu-primary)]" />
                          {item.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white p-4 shadow-[var(--ifu-shadow)]">
                    <p className="ifu-eyebrow text-[var(--ifu-primary)]">Workspace snapshot</p>
                    <h2 className="mt-1 text-xl font-bold leading-tight text-[var(--ifu-heading)]">
                      Next Actions
                    </h2>
                    <div className="mt-3 grid gap-2">
                      {activeWorkspaceItems.map((item, index) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setDrawerItem(item)}
                          className={cn(
                            "flex items-center gap-2 rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-[var(--ifu-surface-muted)] p-2.5 text-left text-[0.82rem] font-semibold leading-tight text-[var(--ifu-muted-strong)] transition hover:bg-white",
                            index === 0 && "border-[var(--ifu-primary)] bg-[var(--ifu-selected)]",
                          )}
                        >
                          <CheckSquare className="h-4 w-4 shrink-0 text-[var(--ifu-primary)]" />
                          <span>{item.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        </section>
      </div>

      <SlideOverDrawer
        item={drawerItem}
        onClose={() => setDrawerItem(null)}
        onAction={persistDrawerAction}
      />
    </main>
  );
}
