import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  IFUActionLink,
  IFUContainer,
  IFUPage,
  IFUSection,
  IFUSectionHeader,
} from "@/components/ifu-ui";
import { RegistrationForm } from "@/components/registration-form";
import { getAuthSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Create IFU Account | IFU Platform",
  description: "Create an IFU platform account with the short Tier 1 registration flow.",
};

export const dynamic = "force-dynamic";

type RegisterPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const session = await getAuthSession();
  const params = searchParams ? await searchParams : {};

  if (session) {
    redirect("/dashboard");
  }

  const invitationCode = firstParam(params.inv) ?? "";
  const initialUtm = {
    utmSource: firstParam(params.utm_source) ?? "",
    utmCampaign: firstParam(params.utm_campaign) ?? "",
    utmMedium: firstParam(params.utm_medium) ?? "",
  };

  return (
    <IFUPage>
      <IFUSection>
        <IFUContainer size="wide" className="grid gap-8 py-12 lg:grid-cols-[0.75fr_1.25fr]">
          <IFUSectionHeader
            eyebrow="IFU registration"
            title="Create your IFU account"
            description="Create the account first. Location and farm details move to the optional profile prompt after login."
            className="md:block"
            action={
              <IFUActionLink href="/login?returnTo=%2Fdashboard" variant="outline">
                Already have an account?
              </IFUActionLink>
            }
          />
          <RegistrationForm initialInvitationCode={invitationCode} initialUtm={initialUtm} />
        </IFUContainer>
      </IFUSection>
    </IFUPage>
  );
}
