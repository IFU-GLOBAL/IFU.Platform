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
  description: "Create an IFU platform account with required registration profile details.",
};

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const session = await getAuthSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <IFUPage>
      <IFUSection>
        <IFUContainer size="wide" className="grid gap-8 py-12 lg:grid-cols-[0.75fr_1.25fr]">
          <IFUSectionHeader
            eyebrow="IFU registration"
            title="Create your IFU account"
            description="Complete the required identity and location details before IFU creates your Cognito account."
            className="md:block"
            action={
              <IFUActionLink href="/login?returnTo=%2Fprofile" variant="outline">
                Already have an account?
              </IFUActionLink>
            }
          />
          <RegistrationForm />
        </IFUContainer>
      </IFUSection>
    </IFUPage>
  );
}
