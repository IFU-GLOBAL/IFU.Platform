"use client";

import { Clock3, LocateFixed, MapPin, Navigation, Pencil } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { DashboardDrawerItem, DashboardProfile } from "@/lib/dashboard-model";
import { getCountryIntelligencePath } from "@/lib/country-intelligence";

type MiniGeoGlobalMapProps = {
  profile: DashboardProfile;
  onSelect: (item: DashboardDrawerItem) => void;
};

type SyncedLocation = {
  city?: string | null;
  region?: string | null;
  country?: string | null;
  timezone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  source?: string | null;
};

type GeoSyncResponse = {
  ok?: boolean;
  error?: string;
  profile?: SyncedLocation;
};

function isFiniteCoordinate(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function approximateCoordinate(value: number) {
  return Number(value.toFixed(2));
}

function formatCoordinate(value: number) {
  return approximateCoordinate(value).toFixed(2);
}

function formatAccuracy(value: number | null | undefined) {
  if (!isFiniteCoordinate(value)) {
    return "Approximate location";
  }

  return value >= 1000
    ? `Approx. ${(value / 1000).toFixed(1)} km accuracy`
    : `Approx. ${Math.round(value)} m accuracy`;
}

export function MiniGeoGlobalMap({ profile, onSelect }: MiniGeoGlobalMapProps) {
  const [localTime, setLocalTime] = useState("");
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncedLocation, setSyncedLocation] = useState<SyncedLocation | null>(null);

  const displayedProfile = useMemo(
    () => ({
      ...profile,
      city: syncedLocation?.city ?? profile.city,
      region: syncedLocation?.region ?? profile.region,
      country: syncedLocation?.country ?? profile.country,
      timezone: syncedLocation?.timezone ?? profile.timezone,
      latitude: syncedLocation?.latitude ?? profile.latitude,
      longitude: syncedLocation?.longitude ?? profile.longitude,
    }),
    [profile, syncedLocation],
  );

  const latitude = displayedProfile.latitude;
  const longitude = displayedProfile.longitude;
  const hasCoordinates = isFiniteCoordinate(latitude) && isFiniteCoordinate(longitude);
  const accuracy = syncedLocation?.accuracy;

  useEffect(() => {
    const timezone =
      displayedProfile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

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
  }, [displayedProfile.timezone]);

  const mapUrl = useMemo(() => {
    if (!hasCoordinates) {
      return "https://www.openstreetmap.org/export/embed.html?bbox=-180,-58,180,82&layer=mapnik";
    }

    const latPadding = 1.8;
    const lngPadding = 2.8;
    const mapLatitude = approximateCoordinate(latitude);
    const mapLongitude = approximateCoordinate(longitude);
    const bbox = [
      clamp(mapLongitude - lngPadding, -180, 180),
      clamp(mapLatitude - latPadding, -85, 85),
      clamp(mapLongitude + lngPadding, -180, 180),
      clamp(mapLatitude + latPadding, -85, 85),
    ].join(",");

    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${mapLatitude},${mapLongitude}`;
  }, [hasCoordinates, latitude, longitude]);

  const locationLabel = useMemo(() => {
    const parts = [
      displayedProfile.city,
      displayedProfile.stateProvince,
      displayedProfile.country,
    ].filter((value) => value && value !== "Profile Pending");

    if (parts.length > 0) {
      return parts.join(", ");
    }

    return hasCoordinates
      ? `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`
      : "Location not synced";
  }, [displayedProfile.city, displayedProfile.country, displayedProfile.stateProvince, hasCoordinates, latitude, longitude]);

  const countryCenterHref = useMemo(
    () => getCountryIntelligencePath(displayedProfile.country || "global"),
    [displayedProfile.country],
  );
  const profileIsComplete = displayedProfile.profileCompletion >= 100;
  const profileActionLabel = profileIsComplete ? "Edit profile" : "Complete profile";

  const locationRows = useMemo(
    () => [
      ["Role", displayedProfile.role],
      ["Category", displayedProfile.category],
      ["State / Province", displayedProfile.stateProvince],
      ["City", displayedProfile.city],
      ["Region", displayedProfile.region],
      ["Country", displayedProfile.country],
      ["Coordinates", hasCoordinates ? `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}` : "Pending"],
    ],
    [displayedProfile, hasCoordinates, latitude, longitude],
  );

  function openLocationProfile() {
    onSelect({
      id: "profile-location",
      title: "My IFU Location Profile",
      type: "Global Map",
      summary: "Current dashboard location, profile status, and IFU regional context.",
      description:
        "This profile card keeps the user's selected role, approximate location, timezone, and completion status visible at the top of the command center.",
      details: [
        `Location: ${locationLabel}`,
        `Region: ${displayedProfile.region}`,
        `Coordinates: ${
          hasCoordinates
            ? `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`
            : "Pending browser permission"
        }`,
        `Profile completion: ${displayedProfile.profileCompletion}%`,
      ],
      actions: ["Update Location", "Open Global Map", "Save Location"],
    });
  }

  function syncBrowserLocation() {
    if (!navigator.geolocation) {
      setSyncStatus("Browser geolocation is not available.");
      return;
    }

    setSyncStatus("Requesting location...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const approximateLatitude = approximateCoordinate(position.coords.latitude);
          const approximateLongitude = approximateCoordinate(position.coords.longitude);
          const response = await fetch("/api/geolocation", {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              latitude: approximateLatitude,
              longitude: approximateLongitude,
              accuracy: position.coords.accuracy,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              consentStatus: "granted",
              source: "browser",
            }),
          });
          const result = (await response.json()) as GeoSyncResponse;

          if (!response.ok || !result.ok) {
            throw new Error(result.error ?? "Location sync failed");
          }

          setSyncedLocation({
            ...result.profile,
            latitude: result.profile?.latitude ?? approximateLatitude,
            longitude: result.profile?.longitude ?? approximateLongitude,
            timezone:
              result.profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
            accuracy: result.profile?.accuracy ?? position.coords.accuracy,
            source: result.profile?.source ?? "browser",
          });
          setSyncStatus("Approximate location saved.");
        } catch (error) {
          setSyncStatus(error instanceof Error ? error.message : "Location sync failed");
        }
      },
      (error) => setSyncStatus(error.message),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  return (
    <section className="grid gap-3 rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white p-3 shadow-[var(--ifu-shadow)] lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <div className="relative min-h-[16rem] overflow-hidden rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-[#082947] text-white">
        <iframe
          title={
            hasCoordinates
              ? `Approximate IFU location map for ${displayedProfile.fullName}`
              : "IFU global location map"
          }
          src={mapUrl}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full border-0"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#03182d]/88 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#03182d]/92 to-transparent" />

        <div className="absolute left-3 top-3 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-[var(--ifu-radius)] bg-[#03182d]/82 px-2.5 py-1 text-[0.68rem] font-bold uppercase leading-tight text-white shadow">
            <LocateFixed className="h-3.5 w-3.5" />
            Mini Geolocation Map
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 z-10 grid gap-2 rounded-[var(--ifu-radius)] bg-[#03182d]/86 p-3 shadow-xl backdrop-blur">
          <div>
            <p className="text-[0.82rem] font-semibold leading-tight text-white/78">
              Welcome Back - {displayedProfile.fullName}
            </p>
            <h2 className="mt-1 break-words text-lg font-bold leading-tight">
              {hasCoordinates ? locationLabel : "Sync your approximate IFU location"}
            </h2>
            <p className="mt-1 text-[0.68rem] font-semibold uppercase leading-tight tracking-[0.08em] text-white/68">
              {hasCoordinates ? formatAccuracy(accuracy) : "Browser permission required"}
            </p>
          </div>
          <button
            type="button"
            onClick={openLocationProfile}
            className="inline-flex w-fit items-center gap-1.5 rounded-[var(--ifu-radius)] bg-white px-2.5 py-1.5 text-[0.82rem] font-bold leading-tight text-[var(--ifu-primary-deep)] transition hover:bg-white/92 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <MapPin className="h-4 w-4 text-[var(--ifu-primary)]" />
            Open location profile
          </button>
          <Link
            href={countryCenterHref}
            className="inline-flex w-fit items-center gap-1.5 rounded-[var(--ifu-radius)] border border-white/40 bg-[#0b7d35] px-2.5 py-1.5 text-[0.82rem] font-bold leading-tight text-white transition hover:bg-[#0a6f30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Navigation className="h-4 w-4" />
            Open country center
          </Link>
        </div>
      </div>

      <div className="grid content-between gap-3">
        <div className="grid gap-1.5">
          <button
            type="button"
            onClick={syncBrowserLocation}
            className="mb-1 inline-flex w-fit items-center gap-1.5 rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white px-2.5 py-1.5 text-[0.82rem] font-bold leading-tight text-[var(--ifu-primary-deep)] transition hover:border-[var(--ifu-primary)]"
          >
            <LocateFixed className="h-4 w-4" />
            Sync location
          </button>
          {syncStatus ? (
            <p className="mb-1 text-[0.82rem] font-semibold leading-tight text-[var(--ifu-muted-strong)]">
              {syncStatus}
            </p>
          ) : null}
          {locationRows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-2 border-b border-[var(--ifu-border-soft)] py-1.5 text-[0.82rem] leading-tight"
            >
              <span className="text-[var(--ifu-muted)]">{label}</span>
              <strong className="break-words text-right text-[var(--ifu-heading)]">{value}</strong>
            </div>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-[var(--ifu-radius)] bg-[var(--ifu-surface-muted)] p-3">
            <div className="flex items-center gap-1.5 text-[0.82rem] font-bold leading-tight text-[var(--ifu-heading)]">
              <Clock3 className="h-4 w-4 text-[var(--ifu-primary)]" />
              Local Time
            </div>
            <p className="mt-2 text-xl font-bold leading-tight text-[var(--ifu-heading)]">
              {localTime || "Syncing"}
            </p>
          </div>
          <Link
            href="/profile"
            prefetch={false}
            aria-label={`${profileActionLabel}: profile is ${displayedProfile.profileCompletion}% complete`}
            className="rounded-[var(--ifu-radius)] bg-[var(--ifu-surface-muted)] p-3 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ifu-primary)]"
          >
            <div className="flex items-center gap-1.5 text-[0.82rem] font-bold leading-tight text-[var(--ifu-heading)]">
              <Pencil className="h-4 w-4 text-[var(--ifu-primary)]" />
              Profile
            </div>
            <p className="mt-2 text-xl font-bold leading-tight text-[var(--ifu-heading)]">
              {displayedProfile.profileCompletion}%
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-[var(--ifu-primary)]"
                style={{ width: `${displayedProfile.profileCompletion}%` }}
              />
            </div>
            <span className="mt-2 inline-flex text-xs font-bold leading-tight text-[var(--ifu-primary-deep)]">
              {profileActionLabel}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
