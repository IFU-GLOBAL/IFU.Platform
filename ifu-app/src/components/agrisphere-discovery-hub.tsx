"use client";

import {
  ArrowRight,
  BarChart3,
  Globe2,
  Layers,
  MapPin,
  Search,
  ShieldCheck,
  Sprout,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { AgriSphereMap } from "@/components/agrisphere-map";
import {
  IFUActionLink,
  IFUContainer,
  IFUPage,
  cn,
} from "@/components/ifu-ui";
import {
  activityTierMeta,
  groupSearchResults,
  searchAgriSphere,
  type AgriSphereSearchCategory,
  type AgriSphereSearchResult,
  type AgriSphereSnapshot,
} from "@/lib/agrisphere-data";

type AgriSphereDiscoveryHubProps = {
  snapshot: AgriSphereSnapshot;
  variant?: "page" | "dashboard";
};

const statIcons = [Globe2, Users, Sprout, BarChart3, Search, Layers];
const AGRISPHERE_DASHBOARD_HREF = "/dashboard?section=agrisphere-dashboard";

function categoryLabel(category: AgriSphereSearchCategory) {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function AgriSphereDiscoveryHub({
  snapshot,
  variant = "page",
}: AgriSphereDiscoveryHubProps) {
  const embedded = variant === "dashboard";
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AgriSphereSearchCategory | "all">("all");
  const [selectedCountryCode, setSelectedCountryCode] = useState(snapshot.countries[0]?.code ?? "");
  const [selectedContinentCode, setSelectedContinentCode] = useState("all");

  const selectedCountry =
    snapshot.countries.find((country) => country.code === selectedCountryCode) ?? snapshot.countries[0];
  const selectedContinent =
    snapshot.continents.find((continent) => continent.code === selectedContinentCode) ?? null;
  const visibleCountries = selectedContinent
    ? snapshot.countries.filter((country) => country.continentCode === selectedContinent.code)
    : snapshot.countries;

  const totalOpportunitySignals = snapshot.countries.reduce(
    (total, country) => total + country.opportunityCount,
    0,
  );

  const search = useMemo(
    () =>
      searchAgriSphere({
        query,
        category: selectedCategory,
        limit: query ? 30 : 18,
      }),
    [query, selectedCategory],
  );
  const groupedResults = useMemo(() => groupSearchResults(search.results), [search.results]);

  const handleCountrySelect = useCallback((countryCode: string) => {
    setSelectedCountryCode(countryCode);

    const country = snapshot.countries.find((item) => item.code === countryCode);

    if (country) {
      setSelectedContinentCode(country.continentCode);
    }
  }, [snapshot.countries]);

  function handleContinentSelect(continentCode: string) {
    setSelectedContinentCode(continentCode);

    if (continentCode === "all") {
      return;
    }

    const firstCountry = snapshot.countries.find((country) => country.continentCode === continentCode);

    if (firstCountry) {
      setSelectedCountryCode(firstCountry.code);
    }
  }

  function handleResultSelect(result: AgriSphereSearchResult) {
    const [, id] = result.id.split(":");

    if (result.category === "countries") {
      handleCountrySelect(id);
    }

    if (result.category === "continents") {
      handleContinentSelect(id);
    }
  }

  const content = (
    <>
      {!embedded ? (
        <header className="agrisphere-header">
          <IFUContainer size="wide" className="agrisphere-header-inner">
            <Link href="/" className="agrisphere-brand" aria-label="IFU home">
              <span className="agrisphere-brand-mark">IFU</span>
              <span>
                <strong>AgriSphere</strong>
                <small>Global Agricultural Intelligence</small>
              </span>
            </Link>
            <nav className="agrisphere-nav" aria-label="AgriSphere sections">
              <a href="#map">Map</a>
              <a href="#search">Search</a>
              <a href="#continents">Continents</a>
              <a href="#ecosystems">Ecosystems</a>
            </nav>
          </IFUContainer>
        </header>
      ) : null}

      <section id="map" className="agrisphere-workbench">
        <IFUContainer size="wide" className="py-8 lg:py-10">
          <div className="agrisphere-workbench-heading">
            <div>
              <p className="ifu-eyebrow text-[var(--ifu-primary)]">AgriSphere</p>
              <h1>Find the right country, crop, organization, producer, or IFU destination.</h1>
            </div>
            <p>
              Search the IFU discovery layer by map, category, country, crop, and ecosystem path.
            </p>
          </div>

          <div className="agrisphere-map-grid">
            <div className="agrisphere-map-panel">
              <div className="agrisphere-panel-toolbar">
                <div>
                  <strong>Country Activity Map</strong>
                  <span>{visibleCountries.length} visible country signals</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleContinentSelect("all")}
                  className="agrisphere-compact-button"
                >
                  Reset
                </button>
              </div>
              <AgriSphereMap
                countries={visibleCountries}
                selectedCountryCode={selectedCountry?.code}
                tierMeta={snapshot.activityTiers}
                onCountrySelect={handleCountrySelect}
              />
              <div className="agrisphere-tier-legend" aria-label="Country activity tiers">
                {Object.entries(activityTierMeta).map(([tier, meta]) => (
                  <span key={tier}>
                    <i style={{ backgroundColor: meta.color }} aria-hidden="true" />
                    {meta.label}
                  </span>
                ))}
              </div>
            </div>

            <aside className="agrisphere-country-panel">
              {selectedCountry ? (
                <>
                  <div className="agrisphere-selected-label">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    Selected Country
                  </div>
                  <h2>{selectedCountry.name}</h2>
                  <p>{selectedCountry.summary}</p>
                  <dl className="agrisphere-country-metrics">
                    <div>
                      <dt>Activity</dt>
                      <dd>{snapshot.activityTiers[selectedCountry.activityTier].label}</dd>
                    </div>
                    <div>
                      <dt>Signals</dt>
                      <dd>{selectedCountry.opportunityCount}</dd>
                    </div>
                    <div>
                      <dt>Crops</dt>
                      <dd>{selectedCountry.primaryCrops.join(", ")}</dd>
                    </div>
                  </dl>
                  <div className="agrisphere-country-actions">
                    <IFUActionLink href={`/country/${selectedCountry.slug}`} icon={ArrowRight}>
                      Open Country
                    </IFUActionLink>
                  </div>
                </>
              ) : (
                <div className="agrisphere-empty-state">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                  <h2>Select a country</h2>
                  <p>Country activity data will appear here.</p>
                </div>
              )}
            </aside>
          </div>
        </IFUContainer>
      </section>

      <section className="agrisphere-stats-band" aria-label="Live platform statistics">
        <IFUContainer size="wide" className="agrisphere-stats-grid">
          {snapshot.stats.map((stat, index) => {
            const Icon = statIcons[index] ?? BarChart3;

            return (
              <div key={stat.id} className="agrisphere-stat">
                <Icon className="h-5 w-5" aria-hidden="true" />
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            );
          })}
        </IFUContainer>
      </section>

      <section id="search" className="agrisphere-section">
        <IFUContainer size="wide">
          <div className="agrisphere-section-heading">
            <div>
              <p className="ifu-eyebrow text-[var(--ifu-primary)]">Global Search</p>
              <h2>Search seven discovery categories.</h2>
            </div>
          </div>

          <div className="agrisphere-search-shell">
            <label className="agrisphere-search-input">
              <Search className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Search AgriSphere</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search countries, crops, organizations, treaties, sectors..."
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
            </label>

            <div className="agrisphere-category-tabs" aria-label="Search categories">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={cn(selectedCategory === "all" && "agrisphere-category-active")}
              >
                All
              </button>
              {snapshot.searchCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(selectedCategory === category.id && "agrisphere-category-active")}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {search.results.length === 0 ? (
              <div className="agrisphere-empty-state">
                <Search className="h-5 w-5" aria-hidden="true" />
                <h3>No matching discovery records</h3>
                <p>Try another country, crop, sector, treaty, organization, producer, or continent.</p>
              </div>
            ) : (
              <div className="agrisphere-results-grid">
                {groupedResults
                  .filter((group) => group.results.length > 0)
                  .map((group) => (
                    <div key={group.id} className="agrisphere-result-group">
                      <h3>{group.label}</h3>
                      <div className="agrisphere-result-list">
                        {group.results.map((result) => (
                          <Link
                            href={result.href}
                            key={result.id}
                            onClick={() => handleResultSelect(result)}
                            className="agrisphere-result"
                          >
                            <span>{categoryLabel(result.category)}</span>
                            <strong>{result.title}</strong>
                            <small>{result.description}</small>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </IFUContainer>
      </section>

      <section id="continents" className="agrisphere-section agrisphere-section-muted">
        <IFUContainer size="wide" className="agrisphere-lower-grid">
          <div>
            <div className="agrisphere-section-heading">
              <div>
                <p className="ifu-eyebrow text-[var(--ifu-primary)]">Agriculture By Continent</p>
                <h2>Explore regional discovery lanes.</h2>
              </div>
            </div>
            <div className="agrisphere-continent-grid">
              {snapshot.continents.map((continent) => (
                <button
                  key={continent.code}
                  type="button"
                  data-continent-code={continent.code}
                  onClick={() => handleContinentSelect(continent.code)}
                  className={cn(
                    "agrisphere-continent-card",
                    selectedContinentCode === continent.code && "agrisphere-continent-card-active",
                  )}
                >
                  <span>{continent.countryCount} countries</span>
                  <strong>{continent.name}</strong>
                  <small>{continent.summary}</small>
                </button>
              ))}
            </div>
          </div>

          <aside className="agrisphere-top-producers">
            <div className="agrisphere-panel-toolbar">
              <div>
                <strong>Top Farming Countries</strong>
                <span>{totalOpportunitySignals} mapped opportunity signals</span>
              </div>
            </div>
            <ol>
              {snapshot.topProducers.map((producer) => (
                <li key={producer.countryCode}>
                  <span>{producer.rank}</span>
                  <div>
                    <strong>{producer.countryName}</strong>
                    <small>{producer.commodities.join(", ")}</small>
                  </div>
                  <i style={{ backgroundColor: snapshot.activityTiers[producer.activityTier].color }} />
                </li>
              ))}
            </ol>
          </aside>
        </IFUContainer>
      </section>

      <section id="ecosystems" className="agrisphere-section">
        <IFUContainer size="wide">
          <div className="agrisphere-shortcut-grid">
            {snapshot.shortcuts.map((shortcut) => (
              <Link href={shortcut.href} key={shortcut.id} className="agrisphere-shortcut">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                <strong>{shortcut.title}</strong>
                <span>{shortcut.description}</span>
              </Link>
            ))}
          </div>

          <div className="agrisphere-ecosystem-band">
            <div>
              <p className="ifu-eyebrow text-white/72">Ten Unified Ecosystems</p>
              <h2>One platform destination map.</h2>
            </div>
            <div className="agrisphere-ecosystem-list">
              {snapshot.ecosystems.map((ecosystem) => (
                <Link
                  key={ecosystem}
                  href={ecosystem === "AgriSphere" ? AGRISPHERE_DASHBOARD_HREF : "/platforms"}
                >
                  {ecosystem}
                </Link>
              ))}
            </div>
          </div>
        </IFUContainer>
      </section>
    </>
  );

  if (embedded) {
    return <div className="agrisphere-page agrisphere-page-embedded">{content}</div>;
  }

  return (
    <IFUPage className="agrisphere-page">
      {content}
    </IFUPage>
  );
}
