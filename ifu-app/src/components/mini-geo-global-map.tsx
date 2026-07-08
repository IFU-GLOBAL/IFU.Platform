"use client";

import { Clock3, LocateFixed, MapPin, Navigation } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DashboardDrawerItem, DashboardProfile } from "@/lib/dashboard-model";

type MiniGeoGlobalMapProps = {
  profile: DashboardProfile;
  onSelect: (item: DashboardDrawerItem) => void;
};

const mapMarkers = [
  {
    id: "north-america-hub",
    label: "North America",
    position: "left-[19%] top-[34%]",
    mobilePosition: "left-[18%] top-[25%]",
    title: "North America Regional Hub",
  },
  {
    id: "west-africa-hub",
    label: "West Africa",
    position: "left-[47%] top-[53%]",
    mobilePosition: "left-[47%] top-[30%]",
    title: "West Africa Producer Network",
  },
  {
    id: "asia-market-hub",
    label: "Asia",
    position: "left-[72%] top-[41%]",
    mobilePosition: "left-[72%] top-[27%]",
    title: "Asia Marketplace Corridor",
  },
];

export function MiniGeoGlobalMap({ profile, onSelect }: MiniGeoGlobalMapProps) {
  const [localTime, setLocalTime] = useState("");
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    const timezone = profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    function updateTime() {
      setLocalTime(
        new Date().toLocaleTimeString([], {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }

    updateTime();
    const timer = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(timer);
  }, [profile.timezone]);

  const locationRows = useMemo(
    () => [
      ["Role", profile.role],
      ["Category", profile.category],
      ["State / Province", profile.stateProvince],
      ["City", profile.city],
      ["Region", profile.region],
      ["Country", profile.country],
    ],
    [profile],
  );

  function syncBrowserLocation() {
    if (!navigator.geolocation) {
      setSyncStatus("Browser geolocation is not available.");
      return;
    }

    setSyncStatus("Requesting location...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch("/api/geolocation", {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              consentStatus: "granted",
              source: "browser",
            }),
          });
          const result = (await response.json()) as { ok?: boolean; error?: string };

          if (!response.ok || !result.ok) {
            throw new Error(result.error ?? "Location sync failed");
          }

          setSyncStatus("Location saved.");
        } catch (error) {
          setSyncStatus(error instanceof Error ? error.message : "Location sync failed");
        }
      },
      (error) => setSyncStatus(error.message),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  return (
    <section className="grid gap-4 rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white p-4 shadow-[var(--ifu-shadow)] lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <button
        type="button"
        onClick={() =>
          onSelect({
            id: "profile-location",
            title: "My IFU Location Profile",
            type: "Global Map",
            summary: "Current dashboard location, profile status, and IFU regional context.",
            description:
              "This profile card keeps the user's selected role, location, timezone, and completion status visible at the top of the command center.",
            details: [
              `Location: ${profile.city}, ${profile.stateProvince}, ${profile.country}`,
              `Region: ${profile.region}`,
              `Profile completion: ${profile.profileCompletion}%`,
            ],
            actions: ["Update Location", "Open Global Map", "Save Location"],
          })
        }
        className="group relative min-h-[18rem] overflow-hidden rounded-[var(--ifu-radius)] bg-[#082947] text-left text-white"
      >
        <div className="absolute inset-0 opacity-70 [background:linear-gradient(115deg,rgba(8,41,71,0.95),rgba(20,94,20,0.66)),radial-gradient(circle_at_24%_36%,rgba(255,255,255,0.18),transparent_20%),radial-gradient(circle_at_72%_42%,rgba(255,255,255,0.14),transparent_18%)]" />
        <div className="absolute inset-x-8 top-1/2 h-px bg-white/18" />
        <div className="absolute inset-y-8 left-1/2 w-px bg-white/18" />
        <div className="absolute left-[14%] top-[30%] h-20 w-28 rounded-[55%] border border-white/25 bg-white/10" />
        <div className="absolute left-[42%] top-[47%] h-24 w-20 rounded-[48%] border border-white/20 bg-white/10" />
        <div className="absolute left-[68%] top-[32%] h-24 w-32 rounded-[58%] border border-white/20 bg-white/10" />

        {mapMarkers.map((marker) => (
          <span key={marker.id}>
            <span
              className={`absolute ${marker.position} hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-white/30 bg-white px-2 py-1 text-[0.7rem] font-bold text-[var(--ifu-heading)] shadow-lg transition group-hover:scale-105 sm:inline-flex`}
            >
              <MapPin className="h-3 w-3 text-[var(--ifu-primary)]" />
              {marker.label}
            </span>
            <span
              className={`absolute ${marker.mobilePosition} h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--ifu-primary)] shadow-lg sm:hidden`}
            />
          </span>
        ))}

        <div className="relative z-10 flex h-full min-h-[18rem] flex-col justify-between p-5">
          <div>
            <span className="inline-flex items-center gap-2 rounded-[var(--ifu-radius)] bg-white/12 px-3 py-1 text-xs font-bold uppercase text-white/82">
              <LocateFixed className="h-3.5 w-3.5" />
              Mini Global Map
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/78">Welcome Back - {profile.fullName}</p>
            <h2 className="mt-2 max-w-xl text-2xl font-bold leading-tight">
              {profile.region} command signal active
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/76">
              Select the map to open location details, profile completion, and regional IFU
              context in the command drawer.
            </p>
          </div>
        </div>
      </button>

      <div className="grid content-between gap-4">
        <div className="grid gap-2">
          <button
            type="button"
            onClick={syncBrowserLocation}
            className="mb-2 inline-flex w-fit items-center gap-2 rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white px-3 py-2 text-sm font-bold text-[var(--ifu-primary-deep)] transition hover:border-[var(--ifu-primary)]"
          >
            <LocateFixed className="h-4 w-4" />
            Sync location
          </button>
          {syncStatus ? (
            <p className="mb-2 text-sm font-semibold text-[var(--ifu-muted-strong)]">
              {syncStatus}
            </p>
          ) : null}
          {locationRows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3 border-b border-[var(--ifu-border-soft)] py-2 text-sm"
            >
              <span className="text-[var(--ifu-muted)]">{label}</span>
              <strong className="text-right text-[var(--ifu-heading)]">{value}</strong>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[var(--ifu-radius)] bg-[var(--ifu-surface-muted)] p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--ifu-heading)]">
              <Clock3 className="h-4 w-4 text-[var(--ifu-primary)]" />
              Local Time
            </div>
            <p className="mt-3 text-2xl font-bold text-[var(--ifu-heading)]">
              {localTime || "Syncing"}
            </p>
          </div>
          <div className="rounded-[var(--ifu-radius)] bg-[var(--ifu-surface-muted)] p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--ifu-heading)]">
              <Navigation className="h-4 w-4 text-[var(--ifu-primary)]" />
              Profile
            </div>
            <p className="mt-3 text-2xl font-bold text-[var(--ifu-heading)]">
              {profile.profileCompletion}%
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-[var(--ifu-primary)]"
                style={{ width: `${profile.profileCompletion}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
