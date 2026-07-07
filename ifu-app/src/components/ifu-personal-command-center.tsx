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
import { MiniGeoGlobalMap, type DashboardProfile } from "@/components/mini-geo-global-map";
import { SlideOverDrawer, type DashboardDrawerItem } from "@/components/slide-over-drawer";

type DashboardNavigationItem = DashboardDrawerItem & {
  icon: typeof LayoutDashboard;
};

type DashboardCard = DashboardDrawerItem & {
  metric: string;
  icon: typeof LayoutDashboard;
};

const dashboardMenu: DashboardNavigationItem[] = [
  {
    id: "dashboard-home",
    title: "Dashboard Home",
    type: "Menu Section",
    summary: "Overview of the user's IFU command center.",
    description:
      "Dashboard Home consolidates the user's profile, recommended next actions, saved items, current opportunities, and IFU ecosystem entry points.",
    actions: ["Open Overview", "Save Current View", "Continue"],
    icon: LayoutDashboard,
  },
  {
    id: "workspace",
    title: "My IFU Workspace",
    type: "Workspace",
    summary: "Active IFU tasks, saved workflows, notes, and next actions.",
    description:
      "The workspace keeps applications, training, marketplace listings, expert requests, documents, and reminders in one operating area.",
    details: ["Current action plan", "In-progress training", "Saved opportunities"],
    actions: ["Continue Workspace", "Add Task", "Mark Complete"],
    icon: BriefcaseBusiness,
  },
  {
    id: "daily-journey",
    title: "My Daily Journey",
    type: "Journey",
    summary: "Today priority actions and recommended tasks.",
    description:
      "Daily Journey gives the member a clear sequence of short actions based on role, country, profile status, and current IFU opportunities.",
    actions: ["Mark Complete", "Set Reminder", "Move to Workspace"],
    icon: Route,
  },
  {
    id: "recommended-pathway",
    title: "Recommended Pathway",
    type: "Pathway",
    summary: "Role-based sequence for onboarding, training, and contribution.",
    description:
      "Recommended Pathway maps the member from profile setup to role-specific opportunities, certifications, funding, and community connections.",
    actions: ["View Pathway", "Save Pathway", "Update Role"],
    icon: SearchCheck,
  },
  {
    id: "top-opportunities",
    title: "Top Opportunities",
    type: "Opportunities",
    summary: "Matched grants, buyers, events, partnerships, and project openings.",
    description:
      "Top Opportunities is personalized from the member's role, location, category, and selected interests across the IFU ecosystem.",
    actions: ["Open Opportunity", "Save to Bookmarks", "Apply"],
    icon: Star,
  },
  {
    id: "recommended-training",
    title: "Recommended Training",
    type: "Training",
    summary: "Courses and certifications from AgriAcademie.",
    description:
      "Recommended Training routes members to skill-building modules, courses, certifications, and practical learning resources.",
    actions: ["Start Training", "Continue Course", "Save Course"],
    icon: GraduationCap,
  },
  {
    id: "funding-opportunities",
    title: "Funding Opportunities",
    type: "Funding",
    summary: "Grants, donor programs, loans, investors, and climate finance.",
    description:
      "Funding Opportunities surfaces financing pathways and keeps document requests close to applications and workspace items.",
    actions: ["Apply Now", "Upload Documents", "Move to Workspace"],
    icon: BadgeDollarSign,
  },
  {
    id: "marketplace-opportunities",
    title: "Marketplace Opportunities",
    type: "Marketplace",
    summary: "Buyer requests, seller listings, export openings, and agritourism offers.",
    description:
      "Marketplace Opportunities connects producers, buyers, cooperatives, exporters, and partners to structured demand and supply signals.",
    actions: ["View Buyer", "Submit Product", "Post Listing"],
    icon: ShoppingBasket,
  },
  {
    id: "expert-network",
    title: "Expert Network",
    type: "Network",
    summary: "Specialists, mentors, advisors, and technical contacts.",
    description:
      "Expert Network helps the member connect with agronomists, veterinarians, export consultants, finance advisors, and certification specialists.",
    actions: ["Connect", "Message", "Schedule"],
    icon: Network,
  },
  {
    id: "agrinexus-community",
    title: "AgriNexus Community",
    type: "Community",
    summary: "IFU member groups, discussions, and regional collaboration spaces.",
    description:
      "AgriNexus Community supports discussions, peer introductions, group coordination, and country or regional collaboration.",
    actions: ["Open Community", "Join Group", "Message Members"],
    icon: UsersRound,
  },
  {
    id: "agritourism",
    title: "Agritourism",
    type: "Tourism",
    summary: "Rural experiences, farm visits, and community tourism opportunities.",
    description:
      "Agritourism connects farm-based experiences, cultural routes, rural destinations, and partner opportunities across IFU regions.",
    actions: ["Explore Listings", "Create Offer", "Save"],
    icon: Tractor,
  },
  {
    id: "global-map",
    title: "Global Map",
    type: "Map",
    summary: "Country-level agricultural intelligence and IFU ecosystem context.",
    description:
      "Global Map gives members a lightweight entry into country dashboards, regional signals, and nearby IFU connections.",
    actions: ["Open Map", "Save Region", "View Country"],
    icon: Map,
  },
  {
    id: "intelligence-hub",
    title: "Intelligence Hub",
    type: "Data",
    summary: "Market signals, analytics, research, and country intelligence.",
    description:
      "Intelligence Hub brings together market trends, production signals, research resources, and future QuickSight analytics.",
    actions: ["View Signals", "Save Report", "Request Data"],
    icon: PanelsTopLeft,
  },
  {
    id: "bookmarks",
    title: "My IFU Bookmarks / Saved Items",
    type: "Bookmarks",
    summary: "Saved resources, opportunities, training, contacts, and documents.",
    description:
      "Bookmarks keep every saved item accessible from the command center, so members can return to important resources quickly.",
    actions: ["Open Saved Items", "Move to Workspace", "Remove Saved Item"],
    icon: Archive,
  },
  {
    id: "applications",
    title: "My Applications",
    type: "Applications",
    summary: "Funding, training, leadership, marketplace, and membership requests.",
    description:
      "Applications tracks submitted and draft requests, current steps, missing documents, and status updates.",
    actions: ["Continue Application", "Upload Document", "Submit"],
    icon: CheckSquare,
  },
  {
    id: "messages",
    title: "My Messages",
    type: "Messages",
    summary: "Member, expert, partner, and IFU team communication.",
    description:
      "Messages centralizes communication tied to opportunities, expert introductions, community groups, and application follow-up.",
    actions: ["Open Inbox", "Start Message", "Schedule"],
    icon: MessageSquareText,
  },
  {
    id: "documents",
    title: "My Documents",
    type: "Documents",
    summary: "Uploaded files, certificates, forms, and required application records.",
    description:
      "Documents will connect to private storage and help members manage files used across applications, funding, training, and marketplace workflows.",
    actions: ["Upload Document", "View Files", "Attach to Application"],
    icon: FileText,
  },
  {
    id: "settings",
    title: "My Settings",
    type: "Settings",
    summary: "Profile, privacy, notification, role, and account preferences.",
    description:
      "Settings gives members control over profile completion, preferred role, location, communication preferences, and account details.",
    actions: ["Edit Profile", "Update Notifications", "Manage Account"],
    icon: Settings,
  },
];

const dashboardCards: DashboardCard[] = [
  {
    ...dashboardMenu[2],
    metric: "3 next steps",
    icon: Route,
  },
  {
    ...dashboardMenu[4],
    title: "Top Opportunities For You",
    metric: "12 matches",
    icon: Star,
  },
  {
    ...dashboardMenu[5],
    metric: "4 courses",
    icon: GraduationCap,
  },
  {
    ...dashboardMenu[6],
    metric: "7 programs",
    icon: BadgeDollarSign,
  },
  {
    ...dashboardMenu[7],
    metric: "9 listings",
    icon: ShoppingBasket,
  },
  {
    ...dashboardMenu[8],
    metric: "18 experts",
    icon: Network,
  },
];

const ecosystemItems: DashboardDrawerItem[] = [
  {
    id: "agrisphere",
    title: "AgriSphere",
    type: "IFU Ecosystem",
    summary: "Member discovery, onboarding, profiles, and role-based navigation.",
    description:
      "AgriSphere is the gateway that helps users identify who they are, where they are, what they need, and which IFU pathway fits them.",
    actions: ["Open AgriSphere", "Save Ecosystem", "Continue"],
  },
  {
    id: "agrinexus",
    title: "AgriNexus",
    type: "IFU Ecosystem",
    summary: "Community, networking, regional groups, and expert collaboration.",
    description:
      "AgriNexus connects members, organizations, communities, and specialists for practical collaboration across agriculture.",
    actions: ["Open Community", "Join Group", "Message"],
  },
  {
    id: "agriacademie",
    title: "AgriAcademie",
    type: "IFU Ecosystem",
    summary: "Training, certification, courses, and learning pathways.",
    description:
      "AgriAcademie supports structured agricultural education, certification, video training, and member learning progress.",
    actions: ["Start Training", "View Courses", "Save"],
  },
  {
    id: "agriexchange",
    title: "AgriExchange",
    type: "IFU Ecosystem",
    summary: "Marketplace, buyer and seller flows, trade, export, and listings.",
    description:
      "AgriExchange helps producers, buyers, cooperatives, exporters, and partners coordinate marketplace opportunities.",
    actions: ["Open Marketplace", "Post Product", "View Buyers"],
  },
  {
    id: "agricapital",
    title: "AgriCapital",
    type: "IFU Ecosystem",
    summary: "Investment, investor matching, project scoring, and capital readiness.",
    description:
      "AgriCapital organizes investment-readiness signals, capital pathways, and project opportunities for qualified members.",
    actions: ["Open Capital Pathway", "Save", "Request Review"],
  },
  {
    id: "agrifunds",
    title: "AgriFunds",
    type: "IFU Ecosystem",
    summary: "Grants, donor programs, funding applications, and finance tracking.",
    description:
      "AgriFunds routes funding opportunities, document requests, program criteria, and status updates into member workflows.",
    actions: ["View Funding", "Apply", "Upload Documents"],
  },
  {
    id: "agrishield",
    title: "AgriShield",
    type: "IFU Ecosystem",
    summary: "Compliance, quality assurance, risk monitoring, and trust workflows.",
    description:
      "AgriShield supports compliance checks, quality assurance, traceability, and risk workflows for the IFU platform.",
    actions: ["Open Compliance", "Review Checklist", "Save"],
  },
  {
    id: "agricentral",
    title: "AgriCentral",
    type: "IFU Ecosystem",
    summary: "Operations, monitoring, activity logs, and administration signals.",
    description:
      "AgriCentral gives IFU operators a future view into platform activity, support needs, readiness signals, and audit history.",
    actions: ["View Activity", "Save", "Request Support"],
  },
  {
    id: "data-engine",
    title: "Data Engine",
    type: "IFU Ecosystem",
    summary: "Country dashboards, analytics, intelligence, and reporting foundations.",
    description:
      "The Data Engine powers agricultural intelligence, role-based recommendations, country dashboards, and future QuickSight reporting.",
    actions: ["Open Intelligence", "Save Report", "Request Data"],
  },
];

const workspaceItems = [
  "Complete location and role profile",
  "Review recommended funding pathway",
  "Save three relevant marketplace opportunities",
  "Choose one AgriAcademie course",
];

type IFUPersonalCommandCenterProps = {
  profile: DashboardProfile;
};

function createMenuFallback(item: DashboardNavigationItem): DashboardDrawerItem {
  return {
    id: item.id,
    title: item.title,
    type: item.type,
    summary: item.summary,
    description: item.description,
    details: item.details,
    actions: item.actions,
  };
}

export function IFUPersonalCommandCenter({ profile }: IFUPersonalCommandCenterProps) {
  const [activeItem, setActiveItem] = useState<DashboardDrawerItem | null>(null);

  const sessionSummary = useMemo(
    () => ({
      id: "session-summary",
      title: "Authenticated IFU Session",
      type: "Session",
      summary: "Cognito-backed access is active for this private dashboard.",
      description:
        "The dashboard is protected by the IFU auth session. Future releases can use this session to load personalized records from PostgreSQL.",
      details: [
        `Member: ${profile.email ?? profile.fullName}`,
        `Role: ${profile.role}`,
        profile.sessionExpiresAt ? `Session expires: ${profile.sessionExpiresAt}` : "Session active",
      ],
      actions: ["Review Session", "Update Profile", "Close"],
    }),
    [profile],
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--ifu-band)] text-[var(--ifu-ink)]">
      <div className="grid min-h-screen min-w-0 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="min-w-0 bg-[#03182d] text-white lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
          <div className="border-b border-white/12 p-4 lg:p-5">
            <Image
              src="/images/ifu-logo-hero.png"
              alt="International Farm Union"
              width={610}
              height={176}
              priority
              unoptimized
              className="h-auto w-44"
            />
            <p className="mt-4 text-xs font-bold uppercase text-white/58">
              My IFU Personal Command Center
            </p>
          </div>
          <nav
            className="flex min-w-0 gap-2 overflow-x-auto p-3 lg:grid lg:overflow-visible"
            aria-label="Dashboard sections"
          >
            {dashboardMenu.map((item, index) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveItem(createMenuFallback(item))}
                  className="flex min-h-11 min-w-52 items-center gap-3 rounded-[var(--ifu-radius)] px-3 py-2 text-left text-sm font-semibold text-white/76 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:min-w-0"
                >
                  <Icon className="h-4 w-4 shrink-0 text-[#7fc36e]" />
                  <span className="min-w-0 flex-1">{item.title}</span>
                  <span className="text-xs text-white/34">{String(index + 1).padStart(2, "0")}</span>
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

            <div className="relative z-10 max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div className="max-w-4xl">
                  <p className="ifu-eyebrow text-[var(--ifu-primary)]">Private dashboard</p>
                  <h1 className="mt-3 max-w-full break-words text-3xl font-bold leading-tight text-[var(--ifu-heading)] md:text-4xl">
                    Welcome To My IFU Personal Command Center Dashboard
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ifu-muted-strong)] md:text-base">
                    My personalized command center where I can save my bookmark, view my
                    opportunities, resources, tools, training, fundings, my network, my community,
                    and all my connections across the IFU global platform.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveItem(sessionSummary)}
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

          <div className="grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
            <MiniGeoGlobalMap profile={profile} onSelect={setActiveItem} />

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {dashboardCards.map((card) => {
                const Icon = card.icon;

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setActiveItem(card)}
                    className="group flex min-h-48 flex-col justify-between rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white p-5 text-left shadow-[var(--ifu-shadow)] transition hover:-translate-y-0.5 hover:border-[var(--ifu-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ifu-primary)]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--ifu-radius)] bg-[var(--ifu-chip)] text-[var(--ifu-primary-deep)]">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="rounded-[var(--ifu-radius)] bg-[#f7efe1] px-2.5 py-1 text-xs font-bold text-[#7a4a12]">
                          {card.metric}
                        </span>
                      </div>
                      <p className="mt-5 text-xs font-bold uppercase text-[var(--ifu-primary-deep)]">
                        {card.type}
                      </p>
                      <h2 className="mt-2 text-xl font-bold leading-snug text-[var(--ifu-heading)]">
                        {card.title}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-[var(--ifu-muted)]">
                        {card.summary}
                      </p>
                    </div>
                    <span className="mt-5 text-sm font-bold text-[var(--ifu-primary-deep)]">
                      Open drawer
                    </span>
                  </button>
                );
              })}
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.65fr)]">
              <div className="rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white p-5 shadow-[var(--ifu-shadow)]">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                  <div>
                    <p className="ifu-eyebrow text-[var(--ifu-primary)]">IFU ecosystem</p>
                    <h2 className="mt-2 text-2xl font-bold text-[var(--ifu-heading)]">
                      Powered By 9 Unified Ecosystems
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--ifu-muted)]">
                      One Engine - One Platform - One Agricultural World. Everything You Need - All
                      In One Place.
                    </p>
                  </div>
                  <Globe2 className="hidden h-10 w-10 text-[var(--ifu-primary)] sm:block" />
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {ecosystemItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveItem(item)}
                      className="rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-[var(--ifu-surface-muted)] px-3 py-3 text-left text-sm font-bold text-[var(--ifu-heading)] transition hover:border-[var(--ifu-primary)] hover:bg-white"
                    >
                      <Sprout className="mb-2 h-4 w-4 text-[var(--ifu-primary)]" />
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white p-5 shadow-[var(--ifu-shadow)]">
                <p className="ifu-eyebrow text-[var(--ifu-primary)]">Workspace snapshot</p>
                <h2 className="mt-2 text-2xl font-bold text-[var(--ifu-heading)]">
                  Next Actions
                </h2>
                <div className="mt-5 grid gap-3">
                  {workspaceItems.map((item, index) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setActiveItem({
                          id: `workspace-item-${index}`,
                          title: item,
                          type: "Workspace Item",
                          summary: "A recommended action for this member's current IFU pathway.",
                          description:
                            "This action belongs in the user's workspace and can later connect to PostgreSQL records, reminders, and activity logs.",
                          actions: ["Move to Workspace", "Set Reminder", "Mark Complete"],
                        })
                      }
                      className={cn(
                        "flex items-center gap-3 rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-[var(--ifu-surface-muted)] p-3 text-left text-sm font-semibold text-[var(--ifu-muted-strong)] transition hover:bg-white",
                        index === 0 && "border-[var(--ifu-primary)] bg-[var(--ifu-selected)]",
                      )}
                    >
                      <CheckSquare className="h-4 w-4 shrink-0 text-[var(--ifu-primary)]" />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>

      <SlideOverDrawer item={activeItem} onClose={() => setActiveItem(null)} />
    </main>
  );
}
