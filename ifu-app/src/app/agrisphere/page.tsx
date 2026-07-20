import type { Metadata } from "next";
import { AgriSphereDiscoveryHub } from "@/components/agrisphere-discovery-hub";
import { getAgriSphereSnapshot } from "@/lib/agrisphere-data";

export const metadata: Metadata = {
  title: "AgriSphere Global Agricultural Intelligence",
  description:
    "Explore IFU AgriSphere country activity, agricultural search, live statistics, top producers, and ecosystem destinations.",
  alternates: {
    canonical: "/agrisphere",
  },
  openGraph: {
    title: "AgriSphere Global Agricultural Intelligence",
    description:
      "Explore IFU AgriSphere country activity, agricultural search, live statistics, top producers, and ecosystem destinations.",
    url: "/agrisphere",
    type: "website",
  },
};

export default function AgriSpherePage() {
  return <AgriSphereDiscoveryHub snapshot={getAgriSphereSnapshot()} />;
}
