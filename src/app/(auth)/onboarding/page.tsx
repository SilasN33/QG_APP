import { redirect } from "next/navigation";

// Onboarding no longer needed — signup auto-creates the player profile.
export default function OnboardingPage() {
  redirect("/dashboard");
}
