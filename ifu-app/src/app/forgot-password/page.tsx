import type { Metadata } from "next";
import { AuthPlaceholderPage } from "@/components/auth-placeholder-page";

export const metadata: Metadata = {
  title: "Forgot Password | IFU Platform",
  description: "IFU platform password reset placeholder for Milestone 5 authentication prep.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthPlaceholderPage
      title="Forgot password"
      route="/forgot-password"
      description="This page will support password reset after Cognito account recovery settings are available."
      nextStep="Next, connect this route to Cognito password recovery and make sure reset emails use the approved IFU sender/domain settings."
    />
  );
}
