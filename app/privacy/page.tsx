"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ShieldCheck,
  Lock,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  Terminal,
} from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F1] text-[#17201B] flex flex-col justify-start">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-14 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[5px] bg-[#DDF4EA] border border-[#159A72]/20 text-[#087453] text-[11px] font-mono font-medium tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-[#159A72]" />
            <span>TRANSPARENT DATA GOVERNANCE SPECIFICATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17201B] tracking-tight">
            Privacy &amp; Security Architecture
          </h1>
          <p className="text-sm text-[#56635C] max-w-xl mx-auto leading-relaxed">
            Gitrium is engineered on a fundamental axiom: engineers own their work. We inspect syntax, AST graphs, and commit provenance without storing, copying, or licensing your proprietary code.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1: What Gitrium Analyzes */}
          <div className="p-6 rounded-[11px] border border-[#DDE1DC] bg-white shadow-[0_1px_4px_rgba(21,26,23,0.04)] space-y-3">
            <div className="flex items-center gap-2 text-[#159A72] font-mono text-[11px] font-semibold uppercase tracking-wider">
              <Eye className="w-4 h-4 text-[#159A72]" />
              <span>What Gitrium Analyzes</span>
            </div>
            <h3 className="text-base font-bold text-[#17201B]">AST Syntax Trees &amp; Git DAGs</h3>
            <ul className="text-xs text-[#56635C] space-y-2.5 pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#159A72] mt-0.5 flex-shrink-0" />
                <span>Commit author timestamps, commit SHAs, and change delta volumes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#159A72] mt-0.5 flex-shrink-0" />
                <span>Framework imports, manifest dependencies, and test suite locations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#159A72] mt-0.5 flex-shrink-0" />
                <span>Pull request merge status, code reviews, and author commit cadence</span>
              </li>
            </ul>
          </div>

          {/* 2: What Gitrium Stores */}
          <div className="p-6 rounded-[11px] border border-[#DDE1DC] bg-white shadow-[0_1px_4px_rgba(21,26,23,0.04)] space-y-3">
            <div className="flex items-center gap-2 text-[#087453] font-mono text-[11px] font-semibold uppercase tracking-wider">
              <Lock className="w-4 h-4 text-[#087453]" />
              <span>What Gitrium Stores</span>
            </div>
            <h3 className="text-base font-bold text-[#17201B]">Derived Evidence Hashes Only</h3>
            <ul className="text-xs text-[#56635C] space-y-2.5 pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#087453] mt-0.5 flex-shrink-0" />
                <span>Aggregated skill proficiencies, confidence weights, and evidence scores</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#087453] mt-0.5 flex-shrink-0" />
                <span>Cryptographic commit identifiers (SHAs) and ISO-8601 timestamps</span>
              </li>
              <li className="flex items-start gap-2">
                <strong className="text-[#D97745] font-mono font-bold">NEVER:</strong>
                <span className="text-[#17201B] font-medium">Your raw proprietary source code is never cloned, stored, or indexed on disk.</span>
              </li>
            </ul>
          </div>

          {/* 3: What Gitrium Does NOT Claim */}
          <div className="p-6 rounded-[11px] border border-[#DDE1DC] bg-white shadow-[0_1px_4px_rgba(21,26,23,0.04)] space-y-3">
            <div className="flex items-center gap-2 text-[#D97745] font-mono text-[11px] font-semibold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-[#D97745]" />
              <span>What Gitrium Does Not Claim</span>
            </div>
            <h3 className="text-base font-bold text-[#17201B]">No False AI or Plagiarism Absolutes</h3>
            <ul className="text-xs text-[#56635C] space-y-2.5 pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D97745] mt-0.5 flex-shrink-0" />
                <span>We never claim 100% human-authored or 100% AI-generated absolutes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D97745] mt-0.5 flex-shrink-0" />
                <span>We do not guarantee hiring placements or compensation outcomes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D97745] mt-0.5 flex-shrink-0" />
                <span>All scores represent empirical, verifiable analytical evidence signals</span>
              </li>
            </ul>
          </div>

          {/* 4: User Controls */}
          <div className="p-6 rounded-[11px] border border-[#DDE1DC] bg-white shadow-[0_1px_4px_rgba(21,26,23,0.04)] space-y-3">
            <div className="flex items-center gap-2 text-[#151A17] font-mono text-[11px] font-semibold uppercase tracking-wider">
              <Trash2 className="w-4 h-4 text-[#151A17]" />
              <span>Total Developer Sovereignty</span>
            </div>
            <h3 className="text-base font-bold text-[#17201B]">Full Control Over Your Vault</h3>
            <ul className="text-xs text-[#56635C] space-y-2.5 pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#159A72] mt-0.5 flex-shrink-0" />
                <span>Toggle public or private access to your profile with one switch</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#159A72] mt-0.5 flex-shrink-0" />
                <span>Explicitly include or exclude specific repositories from analysis at will</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#159A72] mt-0.5 flex-shrink-0" />
                <span>One-click complete vault purge and instantaneous GitHub token revocation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Security statement banner */}
        <div className="rounded-[11px] bg-[#151A17] text-white p-7 border border-[#24352C] flex flex-col sm:flex-row items-center gap-5 justify-between">
          <div className="space-y-1">
            <div className="text-xs font-mono text-[#159A72] uppercase tracking-wider font-semibold">
              Corporate &amp; Enterprise Compliance
            </div>
            <h4 className="text-base font-bold">Safe for Enterprise Developers and Open-Source Authors</h4>
            <p className="text-xs text-[#9DA7A1]">
              Gitrium operates strictly within GitHub OAuth fine-grained read permission boundaries.
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="font-mono text-xs text-[#159A72] px-3.5 py-1.5 rounded-[5px] bg-[#18352B] border border-[#159A72]/30">
              AUDITED PROTOCOL
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
