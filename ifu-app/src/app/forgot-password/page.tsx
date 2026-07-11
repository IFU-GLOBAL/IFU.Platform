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

const cognitoLoginHref = "/api/auth/login?returnTo=%2Fdashboard";

export default function ForgotPasswordPage() {
  return (
    <IFUPage>
      <IFUHero
        title="Reset password"
        description="Password recovery is handled by the IFU Cognito user pool."
      >
        <IFUActionLink href={cognitoLoginHref} variant="ghost" icon={ArrowLeft}>
          Sign in
        </IFUActionLink>
      </IFUHero>

      <IFUSection>
        <IFUContainer className="py-10">
          <IFUActionLink href={cognitoLoginHref} icon={KeyRound}>
            Continue to Cognito
          </IFUActionLink>
        </IFUContainer>
      </IFUSection>
    </IFUPage>
  );
}
