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

function getIcon(iconKey?: DashboardIconKey) {
  return iconMap[iconKey ?? "layoutDashboard"] ?? LayoutDashboard;
}

export function IFUPersonalCommandCenter({ view }: IFUPersonalCommandCenterProps) {
  const [activeItem, setActiveItem] = useState<DashboardDrawerItem | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const { profile } = view;

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

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveItem(item)}
                  className="flex min-h-9 min-w-48 items-center gap-2 rounded-[var(--ifu-radius)] px-2.5 py-1.5 text-left text-[0.82rem] font-semibold leading-tight text-white/76 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:min-w-0"
                >
                  <Icon className="h-4 w-4 shrink-0 text-[#7fc36e]" />
                  <span className="min-w-0 flex-1">{item.title}</span>
                  <span className="text-[0.68rem] text-white/34">
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

          <div className="grid max-w-6xl gap-4 px-4 py-4 sm:px-5 lg:px-6">
            <MiniGeoGlobalMap profile={profile} onSelect={setActiveItem} />

            {actionStatus ? (
              <div className="rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white px-3 py-2 text-sm font-semibold leading-tight text-[var(--ifu-muted-strong)]">
                {actionStatus}
              </div>
            ) : null}

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {view.cards.map((card) => {
                const Icon = getIcon(card.iconKey);

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setActiveItem(card)}
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
                      Powered By 9 Unified Ecosystems
                    </h2>
                    <p className="mt-1 text-sm leading-5 text-[var(--ifu-muted)]">
                      One Engine - One Platform - One Agricultural World. Everything You Need - All
                      In One Place.
                    </p>
                  </div>
                  <Globe2 className="hidden h-10 w-10 text-[var(--ifu-primary)] sm:block" />
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {view.ecosystemItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveItem(item)}
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
                  {view.workspaceItems.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveItem(item)}
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
          </div>
        </section>
      </div>

      <SlideOverDrawer
        item={activeItem}
        onClose={() => setActiveItem(null)}
        onAction={persistDrawerAction}
      />
    </main>
  );
}
