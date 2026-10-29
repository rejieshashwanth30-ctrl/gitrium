"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Github, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export function HeroSection() {
  const contributionValues = [
    4, 7, 5, 10, 6, 9, 12, 8, 6, 11, 8, 14, 10, 8, 13, 9, 7, 12, 15, 10, 8, 12, 9, 11,
  ];

  return (
    <section
      id="hero"
      className="scroll-section relative z-10 pt-10 sm:pt-14 md:pt-16 pb-16 md:pb-24 border-b border-[#24352C] bg-[#151A17] text-[#F7F6F1] overflow-hidden"
    >
      {/* Subtle technical background grid & repository lines */}
      <div className="absolute inset-0 bg-dark-grid opacity-40 pointer-events-none z-0" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, #159A72 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 items-center">
          {/* ============================================================== */}
          {/* LEFT COLUMN: Narrative & Editorial Typography Hierarchy       */}
          {/* ============================================================== */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-[#1B2420] border border-[#27382F] text-[#159A72] text-xs font-mono font-semibold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#159A72]" />
              <span>ADYK GITRIUM / DEVELOPER INTELLIGENCE</span>
            </div>

            {/* Headline: Editorial, Strong, Tight Line Height */}
            <h1 className="text-[38px] sm:text-[50px] md:text-[60px] lg:text-[68px] font-extrabold text-[#F7F6F1] tracking-tight leading-[0.98] uppercase">
              TURN YOUR <br />
              CODE INTO <br />
              <span className="text-[#159A72]">EVIDENCE.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#A8B3AC] font-normal leading-relaxed max-w-xl">
              Gitrium analyzes real engineering work across repositories, contributions,
              technologies and projects to build an evidence-backed developer intelligence profile.
            </p>

            {/* CTA Hierarchy */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              {/* Primary Filled Emerald CTA */}
              <Link href="/github-connect" className="w-full sm:w-auto">
                <button
                  className="group relative inline-flex items-center justify-center w-full sm:w-auto min-h-[48px] px-6 text-sm font-semibold rounded-[7px] bg-[#087453] hover:bg-[#159A72] text-white shadow-xs active:scale-[0.99] transition-all duration-150 gap-2 select-none"
                  aria-label="Analyze My GitHub"
                >
                  <Github className="w-4 h-4 text-white" />
                  <span>Analyze My GitHub</span>
                  <ArrowRight className="w-4 h-4 ml-0.5 text-white/90 group-hover:translate-x-1 transition-transform duration-150" />
                </button>
              </Link>

              {/* Secondary Outlined Action */}
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto min-h-[48px] px-6 text-sm font-medium border-[#2E3E34] bg-[#1B2420] hover:bg-[#24352C] text-[#F7F6F1] shadow-xs active:scale-[0.99]"
                >
                  <span>Explore Gitrium</span>
                </Button>
              </Link>
            </div>

            {/* Trust statement */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#7A857E] font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#159A72]" />
                No unverified claims
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#159A72]" />
                Deterministic AST audits
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97745]" />
                Zero self-reported badges
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* RIGHT COLUMN: Realistic Gitrium Application Interface (Hero Image 01) */}
          {/* Graphite panels, ivory text, emerald highlights, orange signals */}
          {/* ============================================================== */}
          <div className="lg:col-span-6 w-full">
            <div className="rounded-[12px] border border-[#27382F] bg-[#18201C] shadow-[0_12px_40px_rgba(0,0,0,0.35)] p-5 sm:p-6 text-[#F7F6F1] relative z-10">
              {/* Product Window Header */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#24352C]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27382F]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27382F]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27382F]" />
                  <span className="text-[11px] font-mono font-semibold text-[#A8B3AC] ml-2 uppercase tracking-wider">
                    GITRIUM / ANALYSIS
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] text-[11px] font-mono font-semibold bg-[#18352B] text-[#159A72] border border-[#27382F]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#159A72] animate-pulse" />
                  Live Vault
                </div>
              </div>

              {/* Developer Info Row */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#7A857E] block">
                    Developer Evidence
                  </span>
                  <div className="text-sm sm:text-base font-bold text-[#F7F6F1] flex items-center gap-1.5 mt-0.5">
                    <span>Rejiesh Ashwanth</span>
                    <span className="text-[11px] font-mono font-normal text-[#A8B3AC]">
                      (@rejieshashwanth)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#7A857E] block">
                    Signal Strength
                  </span>
                  <span className="text-xs font-mono font-bold text-[#159A72] bg-[#18352B] px-2 py-0.5 rounded-[5px] border border-[#27382F] inline-flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97745]" />
                    88 / 100 Verified
                  </span>
                </div>
              </div>

              {/* 4-Item KPI Metrics in IBM Plex Mono */}
              <div className="grid grid-cols-4 gap-2 p-3 rounded-[8px] bg-[#151A17] border border-[#24352C] text-center font-mono mb-4.5">
                <div>
                  <span className="text-[14px] sm:text-[18px] font-bold text-[#F7F6F1] block leading-none">842</span>
                  <span className="text-[9.5px] text-[#7A857E] uppercase mt-1 block">CONTRIBUTIONS</span>
                </div>
                <div>
                  <span className="text-[14px] sm:text-[18px] font-bold text-[#F7F6F1] block leading-none">18</span>
                  <span className="text-[9.5px] text-[#7A857E] uppercase mt-1 block">REPOSITORIES</span>
                </div>
                <div>
                  <span className="text-[14px] sm:text-[18px] font-bold text-[#F7F6F1] block leading-none">27</span>
                  <span className="text-[9.5px] text-[#7A857E] uppercase mt-1 block">TECHNOLOGIES</span>
                </div>
                <div>
                  <span className="text-[14px] sm:text-[18px] font-bold text-[#159A72] block leading-none">14</span>
                  <span className="text-[9.5px] text-[#7A857E] uppercase mt-1 block">SKILLS</span>
                </div>
              </div>

              {/* Evidence Confidence Indicator */}
              <div className="mb-4.5 p-3 rounded-[8px] bg-[#151A17] border border-[#24352C]">
                <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                  <span className="text-[11px] text-[#A8B3AC] uppercase tracking-wider font-semibold">Evidence Confidence</span>
                  <span className="text-[#159A72] font-bold">92% High</span>
                </div>
                <div className="h-2 w-full bg-[#24352C] rounded-[4px] overflow-hidden flex">
                  <div className="h-full bg-[#159A72] rounded-[4px]" style={{ width: "92%" }} />
                </div>
              </div>

              {/* Skill Evidence Section */}
              <div className="mb-4.5 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#7A857E]">
                    Skill Evidence
                  </span>
                  <span className="text-[10px] font-mono text-[#D97745]">4 Core AST Verified</span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {/* Next.js */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#F7F6F1]">Next.js</span>
                      <span className="text-[#159A72] font-bold">94%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#24352C] rounded-[3px] overflow-hidden">
                      <div className="h-full bg-[#159A72] rounded-[3px]" style={{ width: "94%" }} />
                    </div>
                  </div>

                  {/* Flutter */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#F7F6F1]">Flutter</span>
                      <span className="text-[#159A72] font-bold">88%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#24352C] rounded-[3px] overflow-hidden">
                      <div className="h-full bg-[#159A72] rounded-[3px]" style={{ width: "88%" }} />
                    </div>
                  </div>

                  {/* Python */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#F7F6F1]">Python</span>
                      <span className="text-[#159A72] font-bold">82%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#24352C] rounded-[3px] overflow-hidden">
                      <div className="h-full bg-[#159A72] rounded-[3px]" style={{ width: "82%" }} />
                    </div>
                  </div>

                  {/* SQL */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#F7F6F1]">SQL</span>
                      <span className="text-[#159A72] font-bold">76%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#24352C] rounded-[3px] overflow-hidden">
                      <div className="h-full bg-[#159A72] rounded-[3px]" style={{ width: "76%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contribution Activity Sparkline */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#7A857E]">
                    Repository Activity
                  </span>
                  <span className="text-[10px] font-mono text-[#A8B3AC]">Past 12 Weeks • 842 Commits</span>
                </div>

                <div className="h-10 w-full flex items-end gap-1 pt-1 px-1 rounded-[6px] bg-[#151A17] border border-[#24352C] overflow-hidden">
                  {contributionValues.map((val, idx) => (
                    <div
                      key={idx}
                      className="flex-1 min-w-[2px] bg-[#159A72] hover:bg-[#087453] rounded-t-[2px] transition-colors"
                      style={{
                        height: `${(val / 15) * 100}%`,
                      }}
                      title={`Week ${Math.floor(idx / 2) + 1}: ${val * 14} contributions`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
