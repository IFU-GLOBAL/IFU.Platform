import type { Metadata } from "next";
import { AuthPlaceholderPage } from "@/components/auth-placeholder-page";

export const metadata: Metadata = {
  title: "Dashboard | IFU Platform",
  description: "IFU dashboard placeholder for Milestone 5 authentication prep.",
};

export default function DashboardPage() {
  return (
    <AuthPlaceholderPage
      title="Dashboard"
      route="/dashboard"
      description="This page will become the private IFU dashboard after login, profile creation, and route protection are added."
      nextStep="Next, protect this route with Cognito session checks and load the matching PostgreSQL user profile after authentication."
    />
  );
}
