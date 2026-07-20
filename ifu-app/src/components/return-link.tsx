"use client";

import { ArrowLeft, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { IFUActionLink, cn } from "@/components/ifu-ui";
import { IFU_PREVIOUS_PATH_KEY } from "@/components/navigation-history-tracker";

type ReturnLinkProps = {
  children: ReactNode;
  fallbackHref?: string;
  blockedPathPrefixes?: string[];
  icon?: LucideIcon | null;
  variant?: ComponentProps<typeof IFUActionLink>["variant"];
  className?: string;
  ariaLabel?: string;
};

const defaultBlockedPathPrefixes = ["/api", "/login", "/register"];

function normalizeLocalHref(url: URL) {
  return `${url.pathname}${url.search}${url.hash}`;
}

function normalizeStoredHref(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  try {
    return normalizeLocalHref(new URL(value, window.location.origin));
  } catch {
    return null;
  }
}

function isBlockedPath(pathname: string, blockedPathPrefixes: string[]) {
  return blockedPathPrefixes.some((prefix) => (
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  ));
}

function getReturnHref(fallbackHref: string, blockedPathPrefixes: string[]) {
  const current = new URL(window.location.href);
  const storedPreviousHref = normalizeStoredHref(
    window.sessionStorage.getItem(IFU_PREVIOUS_PATH_KEY),
  );

  if (
    storedPreviousHref &&
    storedPreviousHref !== normalizeLocalHref(current) &&
    !isBlockedPath(new URL(storedPreviousHref, window.location.origin).pathname, blockedPathPrefixes)
  ) {
    return storedPreviousHref;
  }

  if (!document.referrer) {
    return fallbackHref;
  }

  try {
    const referrer = new URL(document.referrer);

    if (referrer.origin !== current.origin) {
      return fallbackHref;
    }

    if (normalizeLocalHref(referrer) === normalizeLocalHref(current)) {
      return fallbackHref;
    }

    if (isBlockedPath(referrer.pathname, blockedPathPrefixes)) {
      return fallbackHref;
    }

    return normalizeLocalHref(referrer);
  } catch {
    return fallbackHref;
  }
}

export function ReturnLink({
  children,
  fallbackHref = "/dashboard",
  blockedPathPrefixes = defaultBlockedPathPrefixes,
  icon: Icon = ArrowLeft,
  variant,
  className,
  ariaLabel,
}: ReturnLinkProps) {
  const [href, setHref] = useState(fallbackHref);

  useEffect(() => {
    setHref(getReturnHref(fallbackHref, blockedPathPrefixes));
  }, [blockedPathPrefixes, fallbackHref]);

  if (variant) {
    return (
      <IFUActionLink
        href={href}
        variant={variant}
        icon={Icon ?? undefined}
        className={className}
        ariaLabel={ariaLabel}
      >
        {children}
      </IFUActionLink>
    );
  }

  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)} aria-label={ariaLabel}>
      {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      {children}
    </Link>
  );
}
