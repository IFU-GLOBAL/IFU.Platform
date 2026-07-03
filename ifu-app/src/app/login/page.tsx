import type { Metadata } from "next";
import { AuthPlaceholderPage } from "@/components/auth-placeholder-page";

export const metadata: Metadata = {
  title: "Login | IFU Platform",
  description: "IFU platform login placeholder for Milestone 5 authentication prep.",
};

export default function LoginPage() {
  return (
    <AuthPlaceholderPage
      title="Login"
      route="/login"
      description="This page will become the IFU platform sign-in entry point after Cognito is connected."
      nextStep="Next, connect this route to the Cognito hosted UI or a custom sign-in form once the User Pool, App Client, and callback URLs are confirmed."
    />
  );
}
