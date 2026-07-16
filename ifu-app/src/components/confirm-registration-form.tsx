"use client";

import { CheckCircle2, LoaderCircle, LogIn, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import {
  IFUActionButton,
  IFUActionLink,
  IFUCard,
  cn,
} from "@/components/ifu-ui";

export function ConfirmRegistrationForm({ initialEmail }: { initialEmail: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setStatusMessage("");

    const response = await fetch("/api/auth/confirm-signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, confirmationCode }),
    });
    const result = (await response.json()) as { ok?: boolean; error?: string };

    if (!response.ok || !result.ok) {
      setStatus("error");
      setStatusMessage(result.error ?? "Unable to confirm account.");
      return;
    }

    setStatus("success");
    setStatusMessage("Account confirmed. Continue to sign in.");
  }

  return (
    <IFUCard tone="muted" className="p-5">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="ifu-field-label">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="ifu-field-control ifu-input mt-2"
            />
          </label>
          <label className="ifu-field-label">
            Confirmation code
            <input
              value={confirmationCode}
              onChange={(event) => setConfirmationCode(event.target.value)}
              required
              autoComplete="one-time-code"
              className="ifu-field-control ifu-input mt-2"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {status === "success" ? (
            <IFUActionLink href="/login?returnTo=%2Fprofile" icon={ShieldCheck}>
              Continue to sign in
            </IFUActionLink>
          ) : (
            <IFUActionButton type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              )}
              Confirm account
            </IFUActionButton>
          )}
        </div>

        <div className="mt-4">
          <IFUActionLink href="/login?returnTo=%2Fprofile" variant="outline" icon={LogIn}>
            Sign in to your account
          </IFUActionLink>
        </div>

        {statusMessage ? (
          <div
            className={cn(
              "ifu-status mt-4",
              status === "success" ? "ifu-status-success" : "ifu-status-error",
            )}
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{statusMessage}</p>
          </div>
        ) : null}
      </form>
    </IFUCard>
  );
}
