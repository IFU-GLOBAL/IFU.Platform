"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export const IFU_CURRENT_PATH_KEY = "ifu_current_path";
export const IFU_PREVIOUS_PATH_KEY = "ifu_previous_path";

const untrackedPathPrefixes = ["/api", "/login", "/register"];

function isUntrackedPath(pathname: string) {
  return untrackedPathPrefixes.some((prefix) => (
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  ));
}

function currentLocalPath() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function isTrackedStoredPath(value: string) {
  try {
    return !isUntrackedPath(new URL(value, window.location.origin).pathname);
  } catch {
    return false;
  }
}

export function NavigationHistoryTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (isUntrackedPath(window.location.pathname)) {
      return;
    }

    const currentPath = currentLocalPath();
    const storedCurrentPath = window.sessionStorage.getItem(IFU_CURRENT_PATH_KEY);

    if (
      storedCurrentPath &&
      storedCurrentPath !== currentPath &&
      isTrackedStoredPath(storedCurrentPath)
    ) {
      window.sessionStorage.setItem(IFU_PREVIOUS_PATH_KEY, storedCurrentPath);
    }

    window.sessionStorage.setItem(IFU_CURRENT_PATH_KEY, currentPath);
  }, [pathname]);

  return null;
}
