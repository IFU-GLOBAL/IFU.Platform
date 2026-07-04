import type { Metadata } from "next";
import { ArrowLeft, KeyRound } from "lucide-react";
import {
  IFUActionLink,
  IFUContainer,
  IFUHero,
  IFUPage,
  IFUSection,
} from "@/components/ifu-ui";

export const metadata: Metadata = {
  title: "Forgot Password | IFU Platform",
  description: "Recover access to an IFU platform account.",
};

export default function ForgotPasswordPage() {
  return (
    <IFUPage>
      <IFUHero
        title="Reset password"
        description="Password recovery is handled by the IFU Cognito user pool."
      >
        <IFUActionLink href="/login" variant="ghost" icon={ArrowLeft}>
          Sign in
        </IFUActionLink>
      </IFUHero>

      <IFUSection>
        <IFUContainer className="py-10">
          <IFUActionLink href="/api/auth/login?returnTo=%2Fdashboard" icon={KeyRound}>
            Continue to Cognito
          </IFUActionLink>
        </IFUContainer>
      </IFUSection>
    </IFUPage>
  );
}
