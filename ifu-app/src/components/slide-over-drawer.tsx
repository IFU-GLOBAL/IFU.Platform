"use client";

import { CalendarClock, CheckCircle2, ExternalLink, FolderPlus, X } from "lucide-react";
import { useEffect } from "react";
import { IFUActionButton, cn } from "@/components/ifu-ui";

export type DashboardDrawerItem = {
  id: string;
  title: string;
  type: string;
  summary: string;
  description: string;
  details?: string[];
  actions?: string[];
};

type SlideOverDrawerProps = {
  item: DashboardDrawerItem | null;
  onClose: () => void;
};

const fallbackActions = ["Open", "Save to Bookmarks", "Move to Workspace"];

export function SlideOverDrawer({ item, onClose }: SlideOverDrawerProps) {
  useEffect(() => {
    if (!item) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  if (!item) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close dashboard drawer"
        className="absolute inset-0 cursor-default bg-[#03182d]/48"
        onClick={onClose}
      />
      <aside
        aria-modal="true"
        role="dialog"
        aria-labelledby="dashboard-drawer-title"
        className="absolute right-0 top-0 flex h-full w-full max-w-[34rem] flex-col overflow-y-auto border-l border-[var(--ifu-border)] bg-white shadow-2xl"
      >
        <header className="border-b border-[var(--ifu-border)] bg-[var(--ifu-surface-muted)] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="ifu-chip px-2.5 py-1">{item.type}</span>
              <h2
                id="dashboard-drawer-title"
                className="mt-4 text-2xl font-bold leading-tight text-[var(--ifu-heading)]"
              >
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--ifu-muted-strong)]">
                {item.summary}
              </p>
            </div>
            <IFUActionButton
              type="button"
              variant="outline"
              icon={X}
              className="ifu-button-compact shrink-0"
              onClick={onClose}
            >
              Close
            </IFUActionButton>
          </div>
        </header>

        <div className="grid gap-6 p-5 sm:p-6">
          <section>
            <h3 className="text-sm font-bold uppercase text-[var(--ifu-primary-deep)]">
              Details
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--ifu-muted-strong)]">
              {item.description}
            </p>
            {item.details?.length ? (
              <ul className="mt-4 grid gap-2">
                {item.details.map((detail) => (
                  <li key={detail} className="flex gap-2 text-sm text-[var(--ifu-muted-strong)]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ifu-primary)]" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-[var(--ifu-surface-muted)] p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--ifu-heading)]">
              <CalendarClock className="h-4 w-4 text-[var(--ifu-primary)]" />
              Recommended Next Steps
            </h3>
            <ol className="mt-3 grid list-decimal gap-2 pl-5 text-sm leading-6 text-[var(--ifu-muted-strong)]">
              <li>Review the section details and match notes.</li>
              <li>Save the item, move it to workspace, or continue the workflow.</li>
              <li>Upload documents, message a contact, or schedule the next step when needed.</li>
              <li>Close and return to the dashboard without leaving the screen.</li>
            </ol>
          </section>

          <section className="grid gap-3">
            {(item.actions ?? fallbackActions).map((action, index) => (
              <IFUActionButton
                key={action}
                type="button"
                variant={index === 0 ? "primary" : "outline"}
                icon={index === 0 ? ExternalLink : FolderPlus}
                className={cn("w-full", index > 0 && "bg-white")}
              >
                {action}
              </IFUActionButton>
            ))}
            <IFUActionButton type="button" variant="light" className="w-full border" onClick={onClose}>
              Close and Return to Dashboard
            </IFUActionButton>
          </section>
        </div>
      </aside>
    </div>
  );
}
