"use client";

import { CheckCircle2, Copy, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { IFUActionButton, cn } from "@/components/ifu-ui";

type CreateInvitationResponse = {
  ok?: boolean;
  invitation?: {
    code: string;
    link: string;
    expiresAt: string;
    channel: string;
  };
  error?: string;
};

export function CopyInvitationLinkButton() {
  const [status, setStatus] = useState<"idle" | "creating" | "copied" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleCopy() {
    setStatus("creating");
    setMessage("");

    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channel: "copy_link" }),
      });
      const result = (await response.json()) as CreateInvitationResponse;

      if (!response.ok || !result.ok || !result.invitation) {
        throw new Error(result.error ?? "Unable to create invitation link.");
      }

      await navigator.clipboard.writeText(result.invitation.link);
      setStatus("copied");
      setMessage("Invitation link copied.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to copy invitation link.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <IFUActionButton type="button" variant="outline" onClick={handleCopy} disabled={status === "creating"}>
        {status === "creating" ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : status === "copied" ? (
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" aria-hidden="true" />
        )}
        Copy invite link
      </IFUActionButton>
      {message ? (
        <p
          className={cn(
            "text-xs font-medium",
            status === "error" ? "text-red-700" : "text-[var(--ifu-primary)]",
          )}
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
