"use client";

import { BarChart3, Factory, LineChart, Sprout } from "lucide-react";
import { useState } from "react";
import { IFUCard, cn } from "@/components/ifu-ui";
import type { CountryIntelligenceRecord } from "@/lib/country-intelligence";

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "production", label: "Production", icon: Sprout },
  { id: "markets", label: "Markets", icon: LineChart },
  { id: "opportunities", label: "Opportunities", icon: Factory },
] as const;

type CountryTabId = (typeof tabs)[number]["id"];

type CountryIntelligenceTabsProps = {
  country: CountryIntelligenceRecord;
};

function ChipList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="ifu-chip px-3 py-2 text-sm font-bold">
          {item}
        </span>
      ))}
    </div>
  );
}

function SourceNotes({ country }: { country: CountryIntelligenceRecord }) {
  return (
    <div className="mt-6 rounded-[var(--ifu-radius)] border border-[var(--ifu-border-soft)] bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--ifu-muted)]">
        Data Lineage
      </p>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--ifu-muted-strong)]">
        {country.sourceNotes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}

function TabPanel({ country, activeTab }: { country: CountryIntelligenceRecord; activeTab: CountryTabId }) {
  if (activeTab === "production") {
    return (
      <IFUCard className="p-6">
        <h2 className="text-2xl font-bold text-[var(--ifu-heading)]">Production Profile</h2>
        <p className="ifu-copy mt-3">
          Seeded crop and production indicators used by the public country map.
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--ifu-muted)]">
              Key Crops
            </p>
            <ChipList items={country.keyCrops} />
          </div>
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--ifu-muted)]">
              Risk Signals
            </p>
            <ChipList items={country.riskSignals} />
          </div>
        </div>
        <SourceNotes country={country} />
      </IFUCard>
    );
  }

  if (activeTab === "markets") {
    return (
      <IFUCard className="p-6">
        <h2 className="text-2xl font-bold text-[var(--ifu-heading)]">Market Intelligence</h2>
        <p className="ifu-copy mt-3">{country.marketOutlook}</p>
        <div className="mt-5">
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--ifu-muted)]">
            Major Exports
          </p>
          <ChipList items={country.majorExports} />
        </div>
        <SourceNotes country={country} />
      </IFUCard>
    );
  }

  if (activeTab === "opportunities") {
    return (
      <IFUCard className="p-6">
        <h2 className="text-2xl font-bold text-[var(--ifu-heading)]">IFU Opportunities</h2>
        <p className="ifu-copy mt-3">
          Country-specific entry points for onboarding, partnerships, training, and future dashboard actions.
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--ifu-muted)]">
              Opportunity Areas
            </p>
            <ChipList items={country.opportunities} />
          </div>
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--ifu-muted)]">
              IFU Pathways
            </p>
            <ChipList items={country.ifuPathways} />
          </div>
        </div>
        <SourceNotes country={country} />
      </IFUCard>
    );
  }

  return (
    <IFUCard className="p-6">
      <div className="grid gap-5 md:grid-cols-[1fr_280px]">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ifu-heading)]">
            {country.name} Agricultural Intelligence
          </h2>
          <p className="ifu-copy mt-3">
            {country.name} is tracked in the IFU country intelligence seed register for regional
            discovery, role matching, market orientation, and future Data Engine workflows.
          </p>
        </div>
        <dl className="grid gap-3 rounded-[var(--ifu-radius)] bg-[var(--ifu-surface-muted)] p-4 text-sm">
          <div>
            <dt className="text-[var(--ifu-muted)]">Region</dt>
            <dd className="font-bold text-[var(--ifu-heading)]">{country.region}</dd>
          </div>
          <div>
            <dt className="text-[var(--ifu-muted)]">Coordinates</dt>
            <dd className="font-bold text-[var(--ifu-heading)]">
              {country.latitude.toFixed(2)}, {country.longitude.toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--ifu-muted)]">Record Status</dt>
            <dd className="font-bold text-[var(--ifu-heading)]">{country.confidence}</dd>
          </div>
          <div>
            <dt className="text-[var(--ifu-muted)]">Updated</dt>
            <dd className="font-bold text-[var(--ifu-heading)]">{country.lastUpdated}</dd>
          </div>
        </dl>
      </div>
      <SourceNotes country={country} />
    </IFUCard>
  );
}

export function CountryIntelligenceTabs({ country }: CountryIntelligenceTabsProps) {
  const [activeTab, setActiveTab] = useState<CountryTabId>("overview");

  return (
    <div className="grid gap-5">
      <div
        role="tablist"
        aria-label={`${country.name} intelligence sections`}
        className="grid gap-2 rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white p-2 shadow-[var(--ifu-shadow)] sm:grid-cols-4"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--ifu-radius)] px-3 py-2 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ifu-primary)]",
                isActive
                  ? "bg-[var(--ifu-primary)] text-white"
                  : "bg-[var(--ifu-surface-muted)] text-[var(--ifu-heading)] hover:bg-[var(--ifu-chip)]",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>
      <TabPanel country={country} activeTab={activeTab} />
    </div>
  );
}
