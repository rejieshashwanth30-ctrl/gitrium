"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/hero/HeroSection";
import {
  WhatGitriumDoesSection,
  FeaturesSection,
  WhyGitriumSection,
  ProductEvidenceGraphSection,
  IntegritySignalsSection,
  CareerIntelligenceSection,
  AboutAndBuiltBySection,
  ContactSection,
  FinalCtaSection,
} from "@/components/hero/HomepageSections";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F7F6F1] text-[#17201B] flex flex-col antialiased selection:bg-[#DDF4EA] selection:text-[#087453]">
      {/* 00: Clean Sticky Navigation (Dynamic shrink on scroll, active indicator, mobile drawer) */}
      <Navbar />

      <main className="flex-1">
        {/* 01: Hero (Two-Column Layout with Real Software Preview) */}
        <HeroSection />

        {/* 02: What Gitrium Does (#what-gitrium-does - Product) */}
        <WhatGitriumDoesSection />

        {/* 03: Features (#features - Features) */}
        <FeaturesSection />

        {/* 04: Why Gitrium (Traditional Resume vs Gitrium Work Evidence) */}
        <WhyGitriumSection />

        {/* 05: Product Visual / Interactive Evidence Graph (#evidence-graph - Evidence Graph) */}
        <ProductEvidenceGraphSection />

        {/* 06: Empirical Integrity Signals (#integrity - Integrity) */}
        <IntegritySignalsSection />

        {/* 07: Career Intelligence & Role Alignment (#career - Career) */}
        <CareerIntelligenceSection />

        {/* 08: About Gitrium & Built By Rejiesh Ashwanth (#about - About) */}
        <AboutAndBuiltBySection />

        {/* 09: Company & Contact (ADYK Multi Venture Company + Socials #contact) */}
        <ContactSection />

        {/* 10: Final Primary CTA */}
        <FinalCtaSection />
      </main>

      {/* 11: Professional Compact Footer */}
      <Footer />
    </div>
  );
}
