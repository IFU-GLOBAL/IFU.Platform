import type { Metadata } from "next";
import {
  IFUContainer,
  IFUPage,
  IFUSection,
  IFUSectionHeader,
} from "@/components/ifu-ui";
import { ConfirmRegistrationForm } from "@/components/confirm-registration-form";

export const metadata: Metadata = {
  title: "Confirm IFU Account | IFU Platform",
  description: "Confirm your IFU Cognito account.",
};

type ConfirmRegistrationPageProps = {
  searchParams?: Promise<{
    email?: string;
  }>;
};

export default async function ConfirmRegistrationPage({ searchParams }: ConfirmRegistrationPageProps) {
  const params = (await searchParams) ?? {};

  return (
    <IFUPage>
      <IFUSection>
        <IFUContainer className="grid gap-8 py-12 lg:grid-cols-[0.75fr_1.25fr]">
          <IFUSectionHeader
            eyebrow="Account confirmation"
            title="Confirm your IFU account"
            description="Enter the confirmation code Cognito sent to your email address."
            className="md:block"
          />
          <ConfirmRegistrationForm initialEmail={params.email ?? ""} />
        </IFUContainer>
      </IFUSection>
    </IFUPage>
  );
}
