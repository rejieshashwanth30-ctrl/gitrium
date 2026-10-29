"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PRODUCT_INFO } from "@/lib/constants";
import { DeveloperEvidenceGraph } from "@/components/graphs/DeveloperEvidenceGraph";
import { CodeToEvidencePipeline } from "@/components/graphs/CodeToEvidencePipeline";
import {
  Github,
  GitFork,
  FileCode,
  GitCommit,
  Cpu,
  ShieldCheck,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
  FolderTree,
  Activity,
  Briefcase,
  Linkedin,
  Twitter,
  Instagram,
  Layers,
  Sparkles,
  ExternalLink,
  Flame,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// 01 — WORKFLOW: FROM CODE TO EVIDENCE (Section 10)
// Background: Warm Ivory (#F7F6F1)
// ============================================================================
export function WhatGitriumDoesSection() {
  return (
    <section
      id="what-gitrium-does"
      className="scroll-section relative z-10 py-16 md:py-24 border-b border-[#DDE1DC] bg-[#F7F6F1] text-[#17201B]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left md:text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#159A72]">
            DETERMINISTIC EVIDENCE PIPELINE
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[44px] font-extrabold text-[#17201B] tracking-tight mt-1.5 leading-[1.05]">
            FROM CODE TO EVIDENCE
          </h2>
          <p className="text-base text-[#56635C] mt-3 leading-relaxed">
            Gitrium replaces self-reported claims with an automated, 6-stage evidence pipeline
            derived directly from your repository histories and syntax trees.
          </p>
        </div>

        {/* 6-Stage Process Flow */}
        <CodeToEvidencePipeline />
      </div>
    </section>
  );
}

// ============================================================================
// 02 — FEATURES: EDITORIAL LAYOUT (Section 13)
// Background: Soft Cream (#EFEEE8) / Warm Ivory (#F7F6F1)
// Asymmetric editorial layout with real software previews instead of 6 identical cards
// ============================================================================
export function FeaturesSection() {
  return (
    <section
      id="features"
      className="scroll-section relative z-10 py-16 md:py-24 border-b border-[#DDE1DC] bg-[#FFFFFF] text-[#17201B]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="max-w-2xl text-left">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#159A72]">
            ENGINEERING CAPABILITIES
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-[#17201B] tracking-tight mt-1.5 leading-[1.05]">
            Designed for code intelligence, not keyword matching.
          </h2>
          <p className="text-base text-[#56635C] mt-2.5 leading-relaxed">
            Gitrium examines structural software artifacts rather than surface claims.
          </p>
        </div>

        {/* EDITORIAL MODULE 1: Repository Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8 rounded-[12px] border border-[#DDE1DC] bg-[#F7F6F1]">
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-mono font-bold text-[#159A72] uppercase tracking-wider">
              01 • REPOSITORY INTELLIGENCE
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#17201B] tracking-tight">
              Deep structural audits &amp; architectural modularity.
            </h3>
            <p className="text-sm text-[#56635C] leading-relaxed">
              Understand package manifests, framework configuration files, directory modularity,
              and test coverage without manual resume entries.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs font-mono text-[#7A857E]">
              <span className="flex items-center gap-1.5 text-[#18352B] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#159A72]" /> 18 Codebases Audited
              </span>
              <span>•</span>
              <span>Deterministic AST trees</span>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-[10px] border border-[#27382F] bg-[#151A17] p-5 text-[#F7F6F1] font-mono text-xs shadow-subtle space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#24352C]">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-[#159A72]" />
                  <span className="text-[#F7F6F1] font-bold">wiqn-mobile-app (Core Architecture)</span>
                </div>
                <span className="text-[10px] text-[#159A72] bg-[#18352B] px-2 py-0.5 rounded-[4px] border border-[#27382F]">
                  Clean Architecture
                </span>
              </div>
              <div className="space-y-1.5 text-[#A8B3AC] text-[11px]">
                <div className="text-[#F7F6F1] font-bold">wiqn-mobile-app/</div>
                <div className="pl-4">├── packages/core_architecture/ <span className="text-[#7A857E]">(Kernel runtime)</span></div>
                <div className="pl-4">├── lib/features/ <span className="text-[#159A72] font-semibold">(42 domain modules)</span></div>
                <div className="pl-4">├── test/unit/ &amp; test/golden/ <span className="text-[#159A72] font-semibold">(84% automated suite)</span></div>
                <div className="pl-4">└── .github/workflows/ <span className="text-[#D97745] font-semibold">(CI/CD multi-target pipeline)</span></div>
              </div>
              <div className="pt-2 border-t border-[#24352C] flex items-center justify-between text-[11px] text-[#7A857E]">
                <span>Language: Dart / Flutter</span>
                <span className="text-[#159A72] font-semibold">AST Integrity: 94/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* EDITORIAL MODULE 2: Contribution Intelligence */}
        <div className="p-6 sm:p-8 rounded-[12px] border border-[#DDE1DC] bg-[#F7F6F1]">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono font-bold text-[#159A72] uppercase tracking-wider">
              02 • CONTRIBUTION INTELLIGENCE
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#17201B] tracking-tight">
              Commit continuity, atomic diffs, and collaboration cadence.
            </h3>
            <p className="text-sm text-[#56635C] leading-relaxed">
              Analyze commit distributions, pull request dialogues, and longevity across projects
              to distinguish real contributors from fork collectors.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-[#7A857E]">
              <span className="flex items-center gap-1.5 text-[#18352B] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#159A72]" /> 842 Commits Audited
              </span>
              <span>•</span>
              <span>14-day continuous streak</span>
              <span>•</span>
              <span className="text-[#159A72] font-semibold">94% PR Merge Ratio</span>
            </div>
          </div>
        </div>

        {/* EDITORIAL MODULE 3 & 4: Skill Evidence & Code Integrity Signals Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Skill Evidence Panel */}
          <div className="p-6 sm:p-7 rounded-[12px] border border-[#DDE1DC] bg-[#F7F6F1] space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#159A72] uppercase tracking-wider">
                03 • SKILL EVIDENCE
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#17201B] tracking-tight mt-1">
                Evidence-based skill metrics.
              </h3>
              <p className="text-xs sm:text-sm text-[#56635C] mt-1">
                Every claimed technology is weighted by actual codebase presence.
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Next.js Item */}
              <div className="p-3.5 rounded-[8px] bg-white border border-[#DDE1DC] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#17201B]">NEXT.JS</span>
                  <span className="text-[10px] font-bold text-[#159A72] bg-[#DDF4EA] px-2 py-0.5 rounded-[4px] border border-[#B7E7D4]">
                    CONFIDENCE: HIGH
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#EFEEE8] rounded-[3px] overflow-hidden">
                  <div className="h-full bg-[#159A72] rounded-[3px]" style={{ width: "94%" }} />
                </div>
                <div className="flex justify-between text-[11px] text-[#7A857E]">
                  <span>Repositories: 05</span>
                  <span>Projects: 08</span>
                  <span className="text-[#17201B] font-semibold">512 Commits</span>
                </div>
              </div>

              {/* Flutter Item */}
              <div className="p-3.5 rounded-[8px] bg-white border border-[#DDE1DC] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#17201B]">FLUTTER</span>
                  <span className="text-[10px] font-bold text-[#159A72] bg-[#DDF4EA] px-2 py-0.5 rounded-[4px] border border-[#B7E7D4]">
                    CONFIDENCE: HIGH
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#EFEEE8] rounded-[3px] overflow-hidden">
                  <div className="h-full bg-[#159A72] rounded-[3px]" style={{ width: "88%" }} />
                </div>
                <div className="flex justify-between text-[11px] text-[#7A857E]">
                  <span>Repositories: 04</span>
                  <span>Projects: 06</span>
                  <span className="text-[#17201B] font-semibold">642 Commits</span>
                </div>
              </div>
            </div>
          </div>

          {/* Code Integrity Signals Panel */}
          <div className="p-6 sm:p-7 rounded-[12px] border border-[#DDE1DC] bg-[#F7F6F1] space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#159A72] uppercase tracking-wider">
                04 • INTEGRITY SIGNALS
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#17201B] tracking-tight mt-1">
                Deterministic integrity signals.
              </h3>
              <p className="text-xs sm:text-sm text-[#56635C] mt-1">
                Empirical signals evaluate development authenticity and depth.
              </p>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded-[8px] bg-white border border-[#DDE1DC] flex items-center justify-between">
                <span className="text-[#17201B]">Contribution consistency</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-[#DDF4EA] text-[#087453] border border-[#B7E7D4]">
                  HIGH
                </span>
              </div>

              <div className="p-3 rounded-[8px] bg-white border border-[#DDE1DC] flex items-center justify-between">
                <span className="text-[#17201B]">Project evolution</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-[#DDF4EA] text-[#087453] border border-[#B7E7D4]">
                  HIGH
                </span>
              </div>

              <div className="p-3 rounded-[8px] bg-white border border-[#DDE1DC] flex items-center justify-between">
                <span className="text-[#17201B]">Testing evidence</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-[#DDF4EA] text-[#087453] border border-[#B7E7D4]">
                  HIGH
                </span>
              </div>

              <div className="p-3 rounded-[8px] bg-white border border-[#DDE1DC] flex items-center justify-between">
                <span className="text-[#17201B]">Documentation</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-[#F3E3D8] text-[#D97745] border border-[#E8CABA]">
                  MEDIUM
                </span>
              </div>

              <div className="p-3 rounded-[8px] bg-white border border-[#DDE1DC] flex items-center justify-between">
                <span className="text-[#17201B]">Collaboration</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-[#F3E3D8] text-[#D97745] border border-[#E8CABA]">
                  MEDIUM
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// 03 — EVIDENCE GRAPH: HOMEPAGE IMAGE 02 (Section 11)
// Background: Dark Graphite (#151A17)
// Signature visual of Gitrium
// ============================================================================
export function ProductEvidenceGraphSection() {
  return (
    <section
      id="evidence-graph"
      className="scroll-section relative z-10 py-16 md:py-24 border-b border-[#24352C] bg-[#151A17] text-[#F7F6F1]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left md:text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#159A72]">
            SIGNATURE GRAPH ENGINE
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[44px] font-extrabold text-[#F7F6F1] tracking-tight mt-1.5 leading-[1.05]">
            THE EVIDENCE GRAPH
          </h2>
          <p className="text-base text-[#A8B3AC] mt-3 leading-relaxed">
            Every repository, commit, pull request, and skill connects in an immutable graph
            that proves what you build without reliance on resumes.
          </p>
        </div>

        {/* Signature Interactive Evidence Graph Visual */}
        <DeveloperEvidenceGraph />
      </div>
    </section>
  );
}

// ============================================================================
// 04 — WHY GITRIUM (Section 11 & Resume vs Gitrium)
// Background: Warm Ivory (#F7F6F1)
// ============================================================================
export function WhyGitriumSection() {
  const comparison = [
    {
      claim: "Traditional Resume",
      drawback: "Self-reported claims, buzzword stuffing, unverified GitHub forks",
      gitrium: "Deterministic commit DAG analysis, atomic diffs, verified authorship",
    },
    {
      claim: "Skill Endorsements",
      drawback: "Friend endorsements, LinkedIn badges, arbitrary self-ratings",
      gitrium: "Syntactic AST analysis, test suite pass ratio, package usage depth",
    },
    {
      claim: "Experience Recency",
      drawback: "Outdated company titles that hide dormant technical skills",
      gitrium: "365-day cadence matrix and timestamped pull request approvals",
    },
    {
      claim: "Project Complexity",
      drawback: "Inflated project summaries without architectural verification",
      gitrium: "Directory modularity audits, package dependency depth, LOC complexity",
    },
  ];

  return (
    <section
      id="why-gitrium"
      className="scroll-section relative z-10 py-16 md:py-24 border-b border-[#DDE1DC] bg-[#F7F6F1] text-[#17201B]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left md:text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#159A72]">
            THE EVIDENCE DIFFERENCE
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-[#17201B] tracking-tight mt-1.5 leading-[1.05]">
            Don&apos;t just claim skills. Prove them through work.
          </h2>
          <p className="text-base text-[#56635C] mt-2.5">
            Compare conventional tech hiring assertions against Gitrium&apos;s code-backed intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {comparison.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-[11px] border border-[#DDE1DC] bg-white shadow-subtle flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-[#7A857E] uppercase">
                  METRIC 0{idx + 1} • {item.claim}
                </span>
                <div className="p-3 rounded-[6px] bg-[#FAF0ED] border border-[#F3E3D8] text-xs text-[#D97745] font-mono">
                  <span className="font-bold block mb-0.5">Conventional Assertion:</span>
                  {item.drawback}
                </div>
              </div>

              <div className="p-3.5 rounded-[6px] bg-[#DDF4EA] border border-[#B7E7D4] text-xs text-[#087453] font-mono">
                <span className="font-bold block mb-0.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#087453]" />
                  Gitrium Code Evidence:
                </span>
                {item.gitrium}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// 05 — CAREER INTELLIGENCE (Section 21)
// Background: Soft Cream (#EFEEE8)
// Editorial panel: Engineering Profile, Strongest Evidence, Role Alignment
// ============================================================================
export function CareerIntelligenceSection() {
  const roles = [
    { role: "Full Stack Engineer", match: 87 },
    { role: "Frontend Engineer", match: 82 },
    { role: "AI Application Engineer", match: 76 },
    { role: "Mobile Application Architect", match: 84 },
  ];

  return (
    <section
      id="career"
      className="scroll-section relative z-10 py-16 md:py-24 border-b border-[#DDE1DC] bg-[#EFEEE8] text-[#17201B]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto rounded-[12px] border border-[#DDE1DC] bg-white p-7 sm:p-10 shadow-subtle space-y-8">
          {/* Header */}
          <div className="border-b border-[#EFEEE8] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#159A72]">
                CAREER INTELLIGENCE
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17201B] tracking-tight mt-1">
                ENGINEERING PROFILE
              </h2>
              <p className="text-xs sm:text-sm text-[#56635C] mt-1 font-mono">
                Primary Focus: Full Stack Development &amp; Architecture
              </p>
            </div>

            <div className="p-3 rounded-[6px] bg-[#F7F6F1] border border-[#DDE1DC] font-mono text-right">
              <span className="text-[10px] text-[#7A857E] uppercase block">EVIDENCE AUDIT</span>
              <span className="text-xs font-bold text-[#159A72]">VERIFIED PROVENANCE</span>
            </div>
          </div>

          {/* STRONGEST EVIDENCE & ROLE ALIGNMENT GRID */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Strongest Evidence Stack */}
            <div className="md:col-span-5 space-y-3 font-mono">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7A857E] block">
                STRONGEST EVIDENCE
              </span>
              <div className="space-y-2">
                {["Next.js (App Router)", "TypeScript (Strict)", "Flutter (Riverpod)", "PostgreSQL (Schema DDL)"].map(
                  (sk, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-[6px] bg-[#F7F6F1] border border-[#DDE1DC] flex items-center justify-between text-xs"
                    >
                      <span className="text-[#17201B] font-semibold">{sk}</span>
                      <span className="text-[#159A72] font-bold">PROVEN</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Right: Role Alignment Bars */}
            <div className="md:col-span-7 space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A857E] block">
                ROLE ALIGNMENT
              </span>
              <div className="space-y-3.5 font-mono text-xs">
                {roles.map((r, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#17201B] font-semibold">{r.role}</span>
                      <span className="text-[#159A72] font-bold">{r.match}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#EFEEE8] rounded-[3px] overflow-hidden">
                      <div
                        className="h-full bg-[#159A72] rounded-[3px] transition-all duration-300"
                        style={{ width: `${r.match}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// 06 — EMPIRICAL INTEGRITY SIGNALS (Section 13)
// ============================================================================
export function IntegritySignalsSection() {
  return null; // Integrated elegantly into Features & Career sections
}

// ============================================================================
// 07 — ABOUT & BUILT BY REJIESH ASHWANTH
// Background: Warm Ivory (#F7F6F1)
// ============================================================================
export function AboutAndBuiltBySection() {
  const pillars = [
    {
      title: "REPOSITORY INTELLIGENCE",
      icon: GitFork,
      description:
        "Understand what a developer actually builds across repositories, technologies, frameworks, dependencies, and project structures.",
    },
    {
      title: "CONTRIBUTION INTELLIGENCE",
      icon: GitCommit,
      description:
        "Analyze commits, pull requests, activity patterns, project timelines, and individual contributions to understand how engineering work evolves.",
    },
    {
      title: "SKILL EVIDENCE",
      icon: Cpu,
      description:
        "Connect technologies and engineering skills to real project evidence instead of relying only on claimed expertise.",
    },
    {
      title: "EVIDENCE GRAPH",
      icon: Layers,
      description:
        "Connect developers, repositories, commits, technologies, projects, skills, and evidence into a traceable intelligence graph.",
    },
    {
      title: "CAREER INTELLIGENCE",
      icon: Briefcase,
      description:
        "Transform engineering evidence into skill insights, emerging strengths, potential role alignment, and areas for further development.",
    },
  ];

  return (
    <section
      id="about"
      className="scroll-section relative z-10 py-16 md:py-24 border-b border-[#DDE1DC] bg-[#F7F6F1] text-[#17201B]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[14px] border border-[#DDE1DC] bg-white p-7 sm:p-10 md:p-12 shadow-[0_2px_12px_rgba(21,26,23,0.04)] space-y-8">
          {/* Header */}
          <div className="space-y-3 pb-6 border-b border-[#EFEEE8]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[5px] bg-[#DDF4EA] border border-[#159A72]/20 text-xs font-mono font-bold uppercase tracking-wider text-[#087453]">
              FOUNDERSHIP &amp; LEADERSHIP
            </span>
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#17201B] tracking-tight">
                Built by Rejiesh Ashwanth
              </h2>
              <p className="text-xs sm:text-sm font-sans font-medium text-[#56635C]">
                Co-Founder — <strong className="text-[#17201B]">ADYK Multi Venture Company</strong>
              </p>
            </div>
          </div>

          {/* Core Philosophy / Narrative */}
          <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#56635C]">
            <p className="border-l-2 border-[#159A72] pl-4 py-1 text-base sm:text-lg font-medium text-[#17201B]">
              Gitrium was built around a simple belief:{" "}
              <strong className="text-[#087453] font-bold">
                a developer&apos;s work should speak louder than a resume.
              </strong>
            </p>
            <p>
              Traditional hiring often relies on resumes, self-reported skills, and short technical
              assessments. But the most meaningful engineering evidence already exists inside the
              work developers create — their repositories, commits, pull requests, technologies,
              projects, and patterns of contribution.
            </p>
            <p className="font-medium text-[#17201B]">
              Gitrium turns that work into structured, evidence-backed developer intelligence.
            </p>
          </div>

          {/* What Gitrium Understands Grid */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#159A72]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#7A857E]">
                What Gitrium Understands
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                const isFullWidth = idx === pillars.length - 1;
                return (
                  <div
                    key={pillar.title}
                    className={cn(
                      "p-4 sm:p-5 rounded-[9px] bg-[#F7F6F1] border border-[#DDE1DC] space-y-2 hover:border-[#159A72]/50 hover:bg-[#FAF9F5] transition-all",
                      isFullWidth && "md:col-span-2"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-[5px] bg-[#DDF4EA] text-[#087453] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#17201B]">
                        {pillar.title}
                      </h4>
                    </div>
                    <p className="text-xs text-[#56635C] leading-relaxed pl-8.5 font-sans">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formula Pipeline Badge */}
          <div className="rounded-[9px] bg-[#151A17] text-white p-4 border border-[#24352C] shadow-xs flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-center">
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-[#F7F6F1]">
              CODE
            </span>
            <span className="text-[#159A72] font-mono text-xs">→</span>
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-[#F7F6F1]">
              CONTRIBUTION
            </span>
            <span className="text-[#159A72] font-mono text-xs">→</span>
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-[#F7F6F1]">
              EVIDENCE
            </span>
            <span className="text-[#159A72] font-mono text-xs">→</span>
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-[#F7F6F1]">
              INTELLIGENCE
            </span>
            <span className="text-[#159A72] font-mono text-xs">→</span>
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-[#34D399]">
              OPPORTUNITY
            </span>
          </div>

          {/* Closing Statement */}
          <div className="p-4 rounded-[8px] bg-[#EFEEE8]/60 border border-[#DDE1DC] text-center space-y-1">
            <p className="text-xs sm:text-sm text-[#56635C] font-sans">
              Gitrium is not another GitHub statistics dashboard or resume builder.
            </p>
            <p className="text-xs sm:text-sm font-semibold text-[#17201B] font-sans">
              It is an attempt to make{" "}
              <span className="text-[#087453]">
                real engineering work more understandable, measurable, and meaningful.
              </span>
            </p>
          </div>

          {/* Footer Social & Company */}
          <div className="pt-4 border-t border-[#EFEEE8] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a
                href={PRODUCT_INFO.founder.linkedin}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-[7px] bg-[#F7F6F1] hover:bg-[#18352B] border border-[#DDE1DC] hover:border-[#159A72]/40 text-[#17201B] hover:text-white text-xs font-sans font-medium transition-all active:scale-[0.96] select-none"
              >
                <Linkedin className="w-3.5 h-3.5 text-[#159A72] group-hover:text-[#34D399] transition-colors" />
                <span>Founder LinkedIn</span>
              </a>
              <a
                href={PRODUCT_INFO.founder.x}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-[7px] bg-[#F7F6F1] hover:bg-[#18352B] border border-[#DDE1DC] hover:border-[#159A72]/40 text-[#17201B] hover:text-white text-xs font-sans font-medium transition-all active:scale-[0.96] select-none"
              >
                <Twitter className="w-3.5 h-3.5 text-[#159A72] group-hover:text-[#34D399] transition-colors" />
                <span>Founder X</span>
              </a>
            </div>

            <div className="flex items-center gap-2 text-xs font-sans font-semibold text-[#17201B]">
              <span className="w-2 h-2 rounded-full bg-[#159A72]" />
              <span>{PRODUCT_INFO.company}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// 08 — CONTACT & VENTURE
// ============================================================================
export function ContactSection() {
  return (
    <section
      id="contact"
      className="scroll-section relative z-10 py-12 md:py-16 border-b border-[#DDE1DC] bg-[#FFFFFF] text-[#17201B]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#159A72]">
          VENTURE ECOSYSTEM
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-[#17201B]">
          ADYK Multi Venture Company
        </h3>
        <p className="text-xs sm:text-sm text-[#56635C] max-w-md mx-auto">
          Developer tooling, software intelligence platforms, and high-integrity infrastructure.
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// 09 — FINAL CTA
// Background: Deep Forest (#18352B)
// ============================================================================
export function FinalCtaSection() {
  return (
    <section className="relative z-10 py-16 md:py-24 bg-[#18352B] text-[#F7F6F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-[5px] bg-[#151A17] border border-[#27382F] text-xs font-mono text-[#159A72] font-semibold tracking-wider uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-[#159A72]" />
          <span>JOIN THE EVIDENCE REVOLUTION</span>
        </span>

        <h2 className="text-3xl sm:text-4xl md:text-[50px] font-extrabold text-[#F7F6F1] tracking-tight leading-[1.02] max-w-2xl mx-auto uppercase">
          READY TO PROVE WHAT YOU CAN BUILD?
        </h2>

        <p className="text-base text-[#A8B3AC] max-w-xl mx-auto leading-relaxed">
          Connect your GitHub account. Let Gitrium synthesize your production repositories
          into a tamper-proof developer intelligence profile.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link href="/github-connect">
            <button className="min-h-[48px] px-7 text-sm font-semibold rounded-[7px] bg-[#159A72] hover:bg-[#087453] text-white shadow-xs active:scale-[0.99] transition-all duration-150 inline-flex items-center gap-2">
              <Github className="w-4 h-4 text-white" />
              <span>Analyze My GitHub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>

          <Link href="/dashboard">
            <Button
              variant="outline"
              size="lg"
              className="min-h-[48px] px-6 text-sm font-medium border-[#27382F] bg-[#151A17] hover:bg-[#1B2420] text-[#F7F6F1]"
            >
              <span>Explore Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
