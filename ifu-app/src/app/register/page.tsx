import type { Metadata } from "next";
import { ArrowLeft, UserPlus } from "lucide-react";
import {
  IFUActionLink,
  IFUContainer,
  IFUHero,
  IFUPage,
  IFUSection,
} from "@/components/ifu-ui";

export const metadata: Metadata = {
  title: "Register | IFU Platform",
  description: "Create an IFU platform account.",
};

export default function RegisterPage() {
  return (
    <IFUPage>
      <IFUHero
        title="Create account"
        description="Account creation is handled by the IFU Cognito user pool."
      >
        <IFUActionLink href="/login" variant="ghost" icon={ArrowLeft}>
          Sign in
        </IFUActionLink>
      </IFUHero>

      <IFUSection>
        <IFUContainer className="py-10">
          <IFUActionLink href="/api/auth/login?returnTo=%2Fdashboard" icon={UserPlus}>
            Continue to Cognito
          </IFUActionLink>
        </IFUContainer>
      </IFUSection>
    </IFUPage>
  );
}
