import type { Metadata } from "next";
import { ArrowLeft, KeyRound, LogIn, ShieldCheck, TriangleAlert } from "lucide-react";
import { redirect } from "next/navigation";
import {
  IFUActionLink,
  IFUCard,
  IFUContainer,
  IFUHero,
  IFUPage,
  IFUSection,
} from "@/components/ifu-ui";
import { getAuthConfigurationStatus } from "@/lib/auth/cognito";
import { getAuthSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Login | IFU Platform",
  description: "Sign in to the IFU platform.",
};

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    missing?: string;
    returnTo?: string;
    signedOut?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  auth_init_failed: "Cognito could not start the sign-in flow.",
  callback_failed: "Cognito returned to the app, but the session could not be created.",
  cognito_error: "Cognito returned an authentication error.",
  missing_challenge: "The sign-in session expired. Start again.",
  missing_config: "Cognito setup is incomplete.",
};

const cognitoRegisterHref = "/register";

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const session = await getAuthSession();

  if (session && !params.signedOut) {
    redirect("/dashboard");
  }

  const status = getAuthConfigurationStatus();
  const returnTo = params.returnTo?.startsWith("/") ? params.returnTo : "/dashboard";
  const loginHref = `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
  const devLoginHref = `/api/auth/dev-login?returnTo=${encodeURIComponent(returnTo)}`;
  const isLocalDev = process.env.NODE_ENV !== "production";
  const errorMessage = params.error && params.error !== "missing_config"
    ? errorMessages[params.error] ?? "Sign-in could not be completed."
    : null;
  const missingValues = params.missing
    ? params.missing.split(",").filter(Boolean)
    : status.missing;

  return (
    <IFUPage>
      <IFUHero
        eyebrow="IFU platform"
        title="Sign in"
        description="Access the private IFU dashboard with the Cognito user pool created for this application."
      >
        <IFUActionLink href="/" variant="ghost" icon={ArrowLeft}>
          Discovery center
        </IFUActionLink>
      </IFUHero>

      <IFUSection>
        <IFUContainer className="grid gap-6 py-10 lg:grid-cols-[1fr_320px]">
          <IFUCard tone="muted" className="p-6">
            <ShieldCheck className="ifu-icon h-6 w-6" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-bold text-[var(--ifu-heading)]">
              Cognito managed login
            </h2>
            <p className="ifu-copy mt-3 max-w-2xl">
              IFU uses Amazon Cognito for account sign-in, account creation, and recovery.
            </p>

            {params.signedOut ? (
              <div className="ifu-status ifu-status-success mt-5 font-medium">
                You have been signed out.
              </div>
            ) : null}

            {errorMessage ? (
              <div className="ifu-status ifu-status-error mt-5">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold">{errorMessage}</p>
                  {missingValues.length > 0 ? (
                    <p className="mt-1 font-mono text-xs">{missingValues.join(", ")}</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {status.configured ? (
              <IFUActionLink href={loginHref} icon={LogIn} className="mt-6">
                Continue with Cognito
              </IFUActionLink>
            ) : (
              <div className="mt-6 grid gap-4">
                <div className="ifu-status ifu-status-error block">
                  <p className="font-semibold">Missing environment values</p>
                  <p className="mt-2 font-mono text-xs">{status.missing.join(", ")}</p>
                </div>

                {isLocalDev ? (
                  <div className="rounded-[var(--ifu-radius)] border border-[var(--ifu-border)] bg-white p-4">
                    <p className="text-sm font-semibold text-[var(--ifu-heading)]">
                      Local development preview
                    </p>
                    <p className="ifu-copy mt-2 text-sm">
                      Use this only on your local machine to preview the protected dashboard
                      before Cognito is fully configured.
                    </p>
                    <IFUActionLink href={devLoginHref} icon={LogIn} className="mt-4">
                      Open local dashboard preview
                    </IFUActionLink>
                  </div>
                ) : null}
              </div>
            )}
          </IFUCard>

          <IFUCard className="p-6">
            <KeyRound className="ifu-icon h-5 w-5" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-bold text-[var(--ifu-heading)]">
              Account help
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              <IFUActionLink href={cognitoRegisterHref} variant="outline" className="ifu-button-start">
                Create account
              </IFUActionLink>
              <IFUActionLink href="/forgot-password" variant="outline" className="ifu-button-start">
                Reset password
              </IFUActionLink>
            </div>
          </IFUCard>
        </IFUContainer>
      </IFUSection>
    </IFUPage>
  );
}
