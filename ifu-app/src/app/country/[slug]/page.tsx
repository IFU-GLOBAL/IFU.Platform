import type { Metadata } from "next";
import { Database, MapPin, ShieldCheck } from "lucide-react";
import { CountryIntelligenceTabs } from "@/components/country-intelligence-tabs";
import {
  countryIntelligenceSource,
  getCountryIntelligenceBySlug,
  getFeaturedCountryIntelligence,
} from "@/lib/country-intelligence";
import {
  IFUActionLink,
  IFUCard,
  IFUContainer,
  IFUHero,
  IFUPage,
  IFUSection,
} from "@/components/ifu-ui";
import { ReturnLink } from "@/components/return-link";

type CountryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getFeaturedCountryIntelligence().map((country) => ({
    slug: country.slug,
  }));
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountryIntelligenceBySlug(slug);

  return {
    title: `${country.name} Agricultural Intelligence | IFU`,
    description: `IFU country intelligence seed profile for ${country.name}, including commodities, opportunities, IFU pathways, and data lineage.`,
    alternates: {
      canonical: `/country/${country.slug}`,
    },
    openGraph: {
      title: `${country.name} Agricultural Intelligence | IFU`,
      description: `IFU country intelligence seed profile for ${country.name}, including commodities, opportunities, IFU pathways, and data lineage.`,
      url: `/country/${country.slug}`,
      type: "article",
    },
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { slug } = await params;
  const country = getCountryIntelligenceBySlug(slug);

  return (
    <IFUPage>
      <IFUHero
        eyebrow="Country Agricultural Intelligence Center"
        title={`${country.name} intelligence workspace`}
        description="A first IFU-owned country route for public map clicks, Data Engine orientation, source status, and future save-to-dashboard workflows."
        size="wide"
        aside={
          <IFUCard tone="hero" className="p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-white/70">
              Data Status
            </p>
            <p className="mt-2 text-2xl font-bold text-white">{country.confidence}</p>
            <p className="mt-2 text-sm leading-6 text-white/72">
              Last updated {country.lastUpdated}. Source register: {countryIntelligenceSource.label}.
            </p>
          </IFUCard>
        }
      >
        <ReturnLink
          fallbackHref="/discovery"
          className="inline-flex items-center gap-2 text-sm font-bold text-white/78 transition hover:text-white"
        >
          Back
        </ReturnLink>
      </IFUHero>

      <IFUSection tone="muted">
        <IFUContainer size="wide" className="grid gap-6 py-10 lg:py-14">
          <div className="grid gap-4 md:grid-cols-3">
            <IFUCard className="p-5">
              <MapPin className="h-5 w-5 text-[var(--ifu-primary)]" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-bold text-[var(--ifu-heading)]">Map Route</h2>
              <p className="ifu-copy mt-2 text-sm">
                Public country interactions now resolve to an IFU-owned route instead of a generic
                static anchor.
              </p>
            </IFUCard>
            <IFUCard className="p-5">
              <Database className="h-5 w-5 text-[var(--ifu-primary)]" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-bold text-[var(--ifu-heading)]">Four Core Views</h2>
              <p className="ifu-copy mt-2 text-sm">
                Overview, commodities, opportunities, and IFU Path are separated for review and
                future data expansion.
              </p>
            </IFUCard>
            <IFUCard className="p-5">
              <ShieldCheck className="h-5 w-5 text-[var(--ifu-primary)]" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-bold text-[var(--ifu-heading)]">Lineage Visible</h2>
              <p className="ifu-copy mt-2 text-sm">
                Each page exposes seed status, timestamp, and the remaining source-approval gap.
              </p>
            </IFUCard>
          </div>

          <CountryIntelligenceTabs country={country} />

          <div className="flex flex-wrap gap-3">
            <IFUActionLink href="/dashboard" variant="primary">
              Save to dashboard after login
            </IFUActionLink>
            <IFUActionLink href="/discovery#role-matrix" variant="outline">
              Find matching IFU roles
            </IFUActionLink>
          </div>
        </IFUContainer>
      </IFUSection>
    </IFUPage>
  );
}
