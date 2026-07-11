#!/usr/bin/env node

const appBaseUrl = process.env.APP_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
const maintenanceSecret = process.env.MAINTENANCE_SECRET ?? process.env.CRON_SECRET;

if (!appBaseUrl) {
  console.error("APP_BASE_URL or NEXT_PUBLIC_APP_URL is required.");
  process.exit(1);
}

if (!maintenanceSecret) {
  console.error("MAINTENANCE_SECRET or CRON_SECRET is required.");
  process.exit(1);
}

const cleanupUrl = new URL("/api/maintenance/referral-cleanup", appBaseUrl);

const response = await fetch(cleanupUrl, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${maintenanceSecret}`,
  },
});

const text = await response.text();

if (!response.ok) {
  console.error(`Referral cleanup failed with HTTP ${response.status}.`);
  console.error(text);
  process.exit(1);
}

console.log(text);
