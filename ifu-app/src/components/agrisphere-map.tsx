"use client";

import { useEffect, useRef, useState } from "react";
import type { CircleMarker, Map as LeafletMap } from "leaflet";
import type {
  AgriSphereActivityTier,
  AgriSphereCountry,
} from "@/lib/agrisphere-data";

type TierMeta = Record<
  AgriSphereActivityTier,
  { label: string; color: string; background: string; sortOrder: number }
>;

type AgriSphereMapProps = {
  countries: AgriSphereCountry[];
  selectedCountryCode?: string;
  tierMeta: TierMeta;
  onCountrySelect: (countryCode: string) => void;
};

const radiusByTier: Record<AgriSphereActivityTier, number> = {
  high: 10,
  medium: 8,
  emerging: 7,
  low: 6,
  "no-data": 5,
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return replacements[character] ?? character;
  });
}

export function AgriSphereMap({
  countries,
  selectedCountryCode,
  tierMeta,
  onCountrySelect,
}: AgriSphereMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, CircleMarker>>(new Map());
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let disposed = false;
    const markers = markersRef.current;

    async function initializeMap() {
      if (!containerRef.current || mapRef.current) {
        return;
      }

      try {
        const leaflet = await import("leaflet");

        if (disposed || !containerRef.current) {
          return;
        }

        const map = leaflet.map(containerRef.current, {
          center: [18, 12],
          zoom: 2,
          minZoom: 2,
          maxZoom: 7,
          worldCopyJump: true,
          scrollWheelZoom: false,
        });

        leaflet
          .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
          })
          .addTo(map);

        const bounds = leaflet.latLngBounds([]);

        countries.forEach((country) => {
          const tier = tierMeta[country.activityTier];
          const marker = leaflet.circleMarker([country.latitude, country.longitude], {
            radius: radiusByTier[country.activityTier],
            color: tier.color,
            fillColor: tier.color,
            fillOpacity: 0.72,
            opacity: 0.95,
            weight: 1,
          });

          marker.bindPopup(
            `<strong>${escapeHtml(country.name)}</strong><br>${escapeHtml(
              tier.label,
            )} activity<br>${escapeHtml(country.primaryCrops.join(", "))}`,
          );
          marker.on("click", () => onCountrySelect(country.code));
          marker.addTo(map);
          markers.set(country.code, marker);
          bounds.extend([country.latitude, country.longitude]);
        });

        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [24, 24],
            maxZoom: 3,
          });
        }

        mapRef.current = map;
        setLoadState("ready");
      } catch {
        setLoadState("error");
      }
    }

    initializeMap();

    return () => {
      disposed = true;
      markers.clear();

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [countries, onCountrySelect, tierMeta]);

  useEffect(() => {
    markersRef.current.forEach((marker, countryCode) => {
      const country = countries.find((item) => item.code === countryCode);

      if (!country) {
        return;
      }

      const tier = tierMeta[country.activityTier];
      const selected = selectedCountryCode === countryCode;

      marker.setStyle({
        color: selected ? "#03182d" : tier.color,
        fillColor: tier.color,
        fillOpacity: selected ? 0.9 : 0.72,
        weight: selected ? 4 : 1,
      });
    });

    if (!selectedCountryCode || !mapRef.current) {
      return;
    }

    const marker = markersRef.current.get(selectedCountryCode);

    if (!marker) {
      return;
    }

    mapRef.current.setView(marker.getLatLng(), Math.max(mapRef.current.getZoom(), 4), {
      animate: true,
    });
    marker.openPopup();
  }, [countries, selectedCountryCode, tierMeta]);

  return (
    <div className="agrisphere-map-shell">
      {loadState === "loading" ? (
        <div className="agrisphere-map-state">Loading map data...</div>
      ) : null}
      {loadState === "error" ? (
        <div className="agrisphere-map-state agrisphere-map-state-error">
          Map could not load. Country data is still available below.
        </div>
      ) : null}
      <div ref={containerRef} className="agrisphere-leaflet-map" aria-label="AgriSphere world map" />
    </div>
  );
}
