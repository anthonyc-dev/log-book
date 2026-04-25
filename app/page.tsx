import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/sections/Hero";
import { Problem } from "@/components/landing/sections/Problem";
import { Features } from "@/components/landing/sections/Features";
import { HowItWorks } from "@/components/landing/sections/HowItWorks";
import { Benefits } from "@/components/landing/sections/Benefits";
import { CTA } from "@/components/landing/sections/CTA";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col text-foreground">
      <div className="relative">
        <Navbar />
      </div>
      <main className="flex-1">
        <Hero />
        <Problem />
        <Features />
        <HowItWorks />
        <Benefits />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}