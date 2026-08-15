import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { SocialProof } from "@/components/landing/social-proof";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ProductDemo } from "@/components/landing/product-demo";
import { Categories } from "@/components/landing/categories";
import { Benefits } from "@/components/landing/benefits";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Interview Coach — Practise interviews with a real AI voice",
  description:
    "Run realistic AI voice interviews, get scored on what you actually said, and watch your score climb session after session.",
};

export default async function LandingPage() {
  // Only look for the cookie's presence rather than verifying the session.
  // Verification costs a revocation check plus a Firestore read, and this is
  // just a routing decision — an expired cookie lands on /dashboard, which
  // does verify and will bounce them to sign-in.
  const sessionCookie = (await cookies()).get("session")?.value;
  if (sessionCookie) redirect("/dashboard");

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <HowItWorks />
        <ProductDemo />
        <Categories />
        <Benefits />
        <Testimonials />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
