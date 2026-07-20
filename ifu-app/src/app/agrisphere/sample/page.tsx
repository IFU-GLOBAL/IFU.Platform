import type { Metadata } from "next";
import { AgriSphereDiscoveryHub } from "@/components/agrisphere-discovery-hub";
import { getAgriSphereSnapshot } from "@/lib/agrisphere-data";

export const metadata: Metadata = {
  title: "AgriSphere Sample",
  description:
    "Preview the IFU AgriSphere agricultural discovery experience with representative sample data.",
  alternates: {
    canonical: "/agrisphere/sample",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AgriSphereSamplePage() {
  return <AgriSphereDiscoveryHub snapshot={getAgriSphereSnapshot()} variant="sample" />;
}
