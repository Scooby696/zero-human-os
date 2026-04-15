import React from "react";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import AgentsSection from "../components/landing/AgentsSection";
import HowItWorks from "../components/landing/HowItWorks";
import TechStack from "../components/landing/TechStack";
import Roadmap from "../components/landing/Roadmap";
import UseCases from "../components/landing/UseCases";
import Community from "../components/landing/Community";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <AgentsSection />
      <HowItWorks />
      <TechStack />
      <UseCases />
      <Roadmap />
      <Community />
      <CTA />
      <Footer />
    </div>
  );
}