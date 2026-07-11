import Image from "next/image";
import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";

type ContainerSize = "default" | "wide";
type ButtonVariant = "primary" | "accent" | "light" | "ghost" | "outline";
type SectionTone = "white" | "muted";
type CardTone = "white" | "muted" | "hero";

export function cn(...classes: Array<string | false | 0 | 0n | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function IFUPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <main className={cn("ifu-page", className)}>{children}</main>;
}

export function IFUContainer({
  children,
  size = "default",
  className,
}: {
  children: ReactNode;
  size?: ContainerSize;
  className?: string;
}) {
  return (
    <div className={cn("ifu-container", size === "wide" && "ifu-container-wide", className)}>
      {children}
    </div>
  );
}

export function IFULogoLockup({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-4", className)}>
      <Image
        src="/images/ifu-logo-hero.png"
        alt="International Farm Union"
        width={610}
        height={176}
        priority
        unoptimized
        className="h-auto w-52 sm:w-64"
      />
      <span className="hidden max-w-44 text-sm font-semibold leading-5 text-white/72 sm:block">
        Sustainable Agriculture & Global Farming Network
      </span>
    </Link>
  );
}

export function IFUHero({
  eyebrow,
  title,
  description,
  children,
  aside,
  size = "default",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
  size?: ContainerSize;
}) {
  return (
    <section className="ifu-hero">
      <IFUContainer size={size} className="relative z-10 py-10 lg:py-14">
        {children ? <div className="mb-8">{children}</div> : null}
        <div className={cn(aside && "grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end")}>
          <div>
            {eyebrow ? <p className="ifu-eyebrow">{eyebrow}</p> : null}
            <h1 className="ifu-title-compact mt-3">{title}</h1>
            {description ? (
              <p className="ifu-copy-inverse mt-4 max-w-3xl text-base">{description}</p>
            ) : null}
          </div>
          {aside}
        </div>
      </IFUContainer>
    </section>
  );
}

export function IFUSection({
  children,
  tone = "white",
  id,
  className,
}: {
  children: ReactNode;
  tone?: SectionTone;
  id?: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(tone === "muted" ? "ifu-section-muted" : "ifu-section", className)}
    >
      {children}
    </section>
  );
}

export function IFUCard({
  children,
  tone = "white",
  className,
}: {
  children: ReactNode;
  tone?: CardTone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        tone === "hero" ? "ifu-hero-card" : "ifu-card",
        tone === "muted" && "ifu-card-muted",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function IFUActionLink({
  href,
  children,
  icon: Icon,
  variant = "primary",
  className,
  target,
  rel,
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  icon?: LucideIcon;
  variant?: ButtonVariant;
  className?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: string;
  ariaLabel?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("ifu-button", `ifu-button-${variant}`, className)}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
    >
      {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      {children}
    </Link>
  );
}

export function IFUActionButton({
  children,
  icon: Icon,
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  icon?: LucideIcon;
  variant?: ButtonVariant;
}) {
  return (
    <button
      className={cn("ifu-button", `ifu-button-${variant}`, className)}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function IFUSectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col justify-between gap-4 md:flex-row md:items-end", className)}>
      <div>
        {eyebrow ? <p className="ifu-eyebrow text-[var(--ifu-primary)]">{eyebrow}</p> : null}
        <h2 className="ifu-section-title mt-2">{title}</h2>
        {description ? <p className="ifu-copy mt-4 max-w-3xl">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function IFUStatCard({
  label,
  value,
  icon: Icon,
  tone = "white",
  className,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: "white" | "hero";
  className?: string;
}) {
  return (
    <IFUCard tone={tone === "hero" ? "hero" : "muted"} className={cn("p-5", className)}>
      <Icon
        className={cn("h-5 w-5", tone === "hero" ? "text-[var(--ifu-accent)]" : "ifu-icon")}
        aria-hidden="true"
      />
      <p
        className={cn(
          "mt-5 break-words text-3xl font-bold",
          tone === "hero" ? "text-white" : "text-[var(--ifu-heading)]",
        )}
      >
        {value}
      </p>
      <p className={cn("mt-2 text-sm", tone === "hero" ? "text-white/70" : "ifu-copy")}>
        {label}
      </p>
    </IFUCard>
  );
}

export function IFUInset({
  children,
  className,
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white/72", className)}>
      {children}
    </div>
  );
}
