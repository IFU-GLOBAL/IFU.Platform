import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Register | IFU Platform",
  description: "Create an IFU platform account.",
};

export default function RegisterPage() {
  redirect("/api/auth/register?returnTo=%2Fprofile");
}
