import type { Metadata } from "next";
import { AuthPlaceholderPage } from "@/components/auth-placeholder-page";

export const metadata: Metadata = {
  title: "Register | IFU Platform",
  description: "IFU platform registration placeholder for Milestone 5 authentication prep.",
};

export default function RegisterPage() {
  return (
    <AuthPlaceholderPage
      title="Register"
      route="/register"
      description="This page will become the IFU account creation flow after Cognito registration is configured."
      nextStep="Next, map registration fields to the Cognito user attributes and the PostgreSQL profile record created after sign-up."
    />
  );
}
