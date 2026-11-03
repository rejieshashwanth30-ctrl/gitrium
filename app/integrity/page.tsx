"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EvidenceStrengthBadge } from "@/components/ui/Badge";
import { gitriumApi } from "@/lib/services/gitriumApiService";
import { IntegritySignal, EvidenceStrength } from "@/types";
import { StructuredAIInsights } from "@/lib/intelligence/aiLayer";
import {
  ShieldCheck,
  Info,
  CheckCircle2,
  Loader2,
  Sparkles,
  FolderGit2,
  GitCommit,
  TrendingUp,
  FileText,
  Cpu,
  Layers,
  GitBranch,
  ArrowRight,
  ArrowDown,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface IntegrityDataState {
  overallScore: number;
  evidenceStrength: EvidenceStrength;
  evidenceDescription: string;
  signals: IntegritySignal[];
  repositoriesCount: number;
  totalCommits: number;
  totalPRs: number;
  verifiedSignalsCount: number;
  activeProjectsCount: number;
}

const DIMENSION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Repository Consistency": FolderGit2,
  "Commit Consistency": GitCommit,
  "Project Evolution": TrendingUp,
  "Testing Evidence": CheckCircle2,
  "Documentation Rigor": FileText,
};

const METHODOLOGY_STEPS = [
  {
    step: "01",
    title: "GitHub Data",
    description: "Repositories, commits and contribution history.",
    icon: FolderGit2,
  },
  {
    step: "02",
    title: "Code Structure",
    description: "Available structural and code-level signals.",
    icon: Cpu,
  },
  {
    step: "03",
    title: "Commit History",
    description: "Timing and distribution of changes.",
    icon: GitCommit,
  },
  {
    step: "04",
    title: "Project Evolution",
    description: "How projects develop over time.",
    icon: TrendingUp,
  },
  {
    step: "05",
    title: "Engineering Signals",
    description: "Testing, documentation and available evidence.",
    icon: CheckCircle2,
  },
  {
    step: "06",
    title: "Integrity Summary",
    description: "A combined evidence-based interpretation.",
    icon: ShieldCheck,
  },
];

export default function IntegrityPage() {
  const [data, setData] = useState<IntegrityDataState | null>(null);
  const [aiInsights, setAiInsights] = useState<StructuredAIInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadIntegrity() {
      setIsLoading(true);
      try {
        const [integrityPayload, insights] = await Promise.all([
          gitriumApi.getIntegrityData(),
          gitriumApi.getAIInsights(),
        ]);
        if (integrityPayload) {
          setData(integrityPayload);
        }
        if (insights) {
          setAiInsights(insights);
        }
      } catch (err) {
        console.warn("Failed to load integrity data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadIntegrity();
  }, []);

  const overallScore = data?.overallScore || 0;
  const evidenceStrength: EvidenceStrength =
    data?.evidenceStrength ||
    (overallScore >= 80
      ? "Strong Evidence"
      : overallScore >= 50
      ? "Moderate Evidence"
      : "Limited Evidence");

  const evidenceDescription =
    data?.evidenceDescription ||
    (overallScore >= 80
      ? "Most available signals support this assessment."
      : overallScore >= 50
      ? "Some supporting evidence is available, but coverage is incomplete."
      : "Gitrium has limited evidence available for this area.");

  const signals = data?.signals || [];
  const repoCount = data?.repositoriesCount || 0;
  const commitCount = data?.totalCommits || 0;
  const verifiedSignalsCount = data?.verifiedSignalsCount || signals.filter((s) => s.score >= 70).length;
  const activeProjectsCount = data?.activeProjectsCount || repoCount;

  // SVG Gauge calculations
  const gaugeSize = 148;
  const strokeWidth = 10;
  const radius = (gaugeSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        {/* ================================================================= */}
        {/* 1. TOP SECTION — SIMPLE EXPLANATION                              */}
        {/* ================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#24352C]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#18352B] border border-[#27382F] text-[#159A72] text-[11px] font-mono font-semibold mb-2 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>EVIDENCE-BASED AUDIT</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#F7F6F1] tracking-tight uppercase">
                Code Integrity &amp; Consistency
              </h1>
              <p className="mt-1 text-sm sm:text-base font-semibold text-[#F7F6F1]">
                Understand the consistency and structure of your development work.
              </p>
              <p className="mt-1 text-xs sm:text-sm text-[#A8B3AC] max-w-3xl font-sans leading-relaxed">
                Gitrium examines repository history, commit patterns, project evolution, testing evidence,
                documentation and other available engineering signals to build an evidence-based integrity profile.
              </p>
            </div>
          </div>

          {/* Mandatory Informational Note */}
          <div className="p-3.5 sm:p-4 rounded-[9px] border border-[#27382F] bg-[#18201C] flex items-start gap-3">
            <Info className="w-4 h-4 text-[#159A72] mt-0.5 shrink-0" />
            <div className="space-y-0.5 text-xs text-[#A8B3AC] font-sans leading-relaxed">
              <span className="font-bold text-[#F7F6F1] uppercase font-mono tracking-wider mr-1.5">
                Important:
              </span>
              <span>
                These signals describe development patterns and available engineering evidence. They do not
                prove whether code was written by a human or AI.
              </span>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="p-12 rounded-[11px] border border-[#27382F] bg-[#18201C] text-center font-mono text-xs text-[#7A857E] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#159A72]" />
            <span>Evaluating deterministic integrity signals across connected repositories...</span>
          </div>
        )}

        {!isLoading && (
          <>
            {/* ============================================================= */}
            {/* 2. OVERALL INTEGRITY SCORE & EVIDENCE LEVEL                   */}
            {/* ============================================================= */}
            <div className="p-6 sm:p-7 rounded-[11px] border border-[#27382F] bg-[#18201C] shadow-subtle">
              <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 justify-between">
                {/* Visual Circular Ring Score */}
                <div className="flex flex-col items-center text-center shrink-0">
                  <div className="relative flex items-center justify-center">
                    <svg width={gaugeSize} height={gaugeSize} className="transform -rotate-90">
                      <defs>
                        <linearGradient id="integrityGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#087453" />
                          <stop offset="50%" stopColor="#159A72" />
                          <stop offset="100%" stopColor="#34D399" />
                        </linearGradient>
                      </defs>
                      {/* Background Track */}
                      <circle
                        cx={gaugeSize / 2}
                        cy={gaugeSize / 2}
                        r={radius}
                        stroke="#24352C"
                        strokeWidth={strokeWidth}
                        fill="none"
                      />
                      {/* Dynamic Progress Stroke */}
                      <circle
                        cx={gaugeSize / 2}
                        cy={gaugeSize / 2}
                        r={radius}
                        stroke="url(#integrityGaugeGrad)"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>

                    {/* Inner Score Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none font-mono">
                      <span className="text-4xl sm:text-5xl font-extrabold text-[#F7F6F1] tracking-tight">
                        {overallScore}
                      </span>
                      <span className="text-xs text-[#7A857E] font-medium">/ 100</span>
                    </div>
                  </div>

                  {/* Evidence Level Badge */}
                  <div className="mt-3.5">
                    <EvidenceStrengthBadge strength={evidenceStrength} />
                  </div>
                </div>

                {/* Score Meaning & Context */}
                <div className="flex-1 w-full space-y-3 font-sans text-center md:text-left">
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#159A72] block">
                      VERIFIABLE BENCHMARK
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-mono text-[#F7F6F1] mt-0.5">
                      Integrity Evidence Score
                    </h2>
                    <p className="text-xs sm:text-sm text-[#A8B3AC] mt-1 leading-relaxed">
                      Based on the available signals from your connected repositories.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[8px] bg-[#151A17] border border-[#24352C] flex items-start gap-2.5 text-xs text-[#A8B3AC]">
                    <div className="w-2 h-2 rounded-full bg-[#159A72] mt-1.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-[#F7F6F1]">{evidenceStrength}: </span>
                      <span>{evidenceDescription}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-[#7A857E]">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#159A72]" />
                      <span>{verifiedSignalsCount} of 5 signals optimal</span>
                    </span>
                    <span>•</span>
                    <span>Deterministic Git DAG &amp; AST Analysis</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================= */}
            {/* 3. "WHAT GITRIUM FOUND" (Compact Evidence Chips)              */}
            {/* ============================================================= */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#F7F6F1] uppercase font-mono tracking-wider flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-[#159A72]" />
                  <span>WHAT GITRIUM FOUND</span>
                </h3>
                <span className="text-[11px] font-mono text-[#7A857E]">Audited Repository Telemetry</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
                <div className="p-4 rounded-[8px] bg-[#18201C] border border-[#27382F] shadow-xs">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#F7F6F1] block">
                    {repoCount}
                  </span>
                  <span className="text-xs font-bold text-[#159A72] uppercase mt-1 block">
                    Repositories
                  </span>
                  <p className="text-[11px] text-[#7A857E] font-sans mt-0.5">
                    Connected and audited codebases
                  </p>
                </div>

                <div className="p-4 rounded-[8px] bg-[#18201C] border border-[#27382F] shadow-xs">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#F7F6F1] block">
                    {commitCount}
                  </span>
                  <span className="text-xs font-bold text-[#159A72] uppercase mt-1 block">
                    Commits
                  </span>
                  <p className="text-[11px] text-[#7A857E] font-sans mt-0.5">
                    Recorded across branch histories
                  </p>
                </div>

                <div className="p-4 rounded-[8px] bg-[#18201C] border border-[#27382F] shadow-xs">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#F7F6F1] block">
                    {verifiedSignalsCount}
                  </span>
                  <span className="text-xs font-bold text-[#159A72] uppercase mt-1 block">
                    Verified Signals
                  </span>
                  <p className="text-[11px] text-[#7A857E] font-sans mt-0.5">
                    Empirical engineering indicators
                  </p>
                </div>

                <div className="p-4 rounded-[8px] bg-[#18201C] border border-[#27382F] shadow-xs">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#F7F6F1] block">
                    {activeProjectsCount}
                  </span>
                  <span className="text-xs font-bold text-[#159A72] uppercase mt-1 block">
                    Active Projects
                  </span>
                  <p className="text-[11px] text-[#7A857E] font-sans mt-0.5">
                    Projects with verified activity
                  </p>
                </div>
              </div>
            </div>

            {/* ============================================================= */}
            {/* 4. FIVE INTEGRITY DIMENSIONS (Distinct Visual Cards)          */}
            {/* ============================================================= */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h3 className="text-sm font-bold text-[#F7F6F1] uppercase font-mono tracking-wider">
                    Five Integrity Dimensions
                  </h3>
                  <p className="text-xs text-[#7A857E] font-sans mt-0.5">
                    Empirical evaluations across the 5 core engineering evidence categories
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#7A857E] self-start sm:self-auto">
                  5/5 Dimensions Computed
                </span>
              </div>

              {signals.length === 0 ? (
                <div className="p-8 rounded-[11px] border border-[#27382F] bg-[#18201C] text-center font-mono text-xs text-[#7A857E] space-y-2">
                  <p className="text-[#F7F6F1] font-bold">No Code Integrity Evidence Available Yet</p>
                  <p>Synchronize your GitHub repositories to compute verifiable provenance signals.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {signals.map((sig) => {
                    const IconComponent = DIMENSION_ICONS[sig.category] || FolderGit2;
                    const isStrong = sig.score >= 80;
                    const isModerate = sig.score >= 50 && sig.score < 80;

                    return (
                      <div
                        key={sig.id}
                        className="p-5 rounded-[11px] border border-[#27382F] bg-[#18201C] shadow-subtle hover:border-[#159A72]/60 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3.5">
                          {/* Card Header: Icon + Title + Score */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-[7px] bg-[#151A17] border border-[#27382F] flex items-center justify-center shrink-0">
                                <IconComponent className="w-4 h-4 text-[#159A72]" />
                              </div>
                              <h4 className="text-sm font-bold text-[#F7F6F1] font-mono truncate">
                                {sig.name || sig.category}
                              </h4>
                            </div>

                            <div className="text-right shrink-0 font-mono">
                              <span
                                className={`text-base font-bold ${
                                  isStrong
                                    ? "text-[#159A72]"
                                    : isModerate
                                    ? "text-[#D97745]"
                                    : "text-[#7A857E]"
                                }`}
                              >
                                {sig.score}
                              </span>
                              <span className="text-[11px] text-[#7A857E]"> / 100</span>
                            </div>
                          </div>

                          {/* Evidence Level Badge */}
                          <div className="flex items-center justify-between">
                            <EvidenceStrengthBadge strength={sig.label} />
                            <span className="text-[10px] font-mono text-[#7A857E]">
                              {sig.confidenceInterval || "Verified"}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="h-1.5 w-full bg-[#151A17] border border-[#24352C] rounded-[3px] overflow-hidden">
                            <div
                              className={`h-full rounded-[3px] transition-all duration-500 ${
                                isStrong ? "bg-[#159A72]" : isModerate ? "bg-[#D97745]" : "bg-[#7A857E]"
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, sig.score))}%` }}
                            />
                          </div>

                          {/* Simple Explanation */}
                          <p className="text-xs text-[#A8B3AC] leading-relaxed font-sans">
                            {sig.description}
                          </p>
                        </div>

                        {/* Metric Chip */}
                        {sig.metricLabel && sig.metricValue && (
                          <div className="mt-4 pt-3 border-t border-[#24352C] flex items-center justify-between text-[11px] font-mono">
                            <span className="text-[#7A857E]">{sig.metricLabel}:</span>
                            <span className="text-[#F7F6F1] font-semibold">{sig.metricValue}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ============================================================= */}
            {/* 5. AI INSIGHTS SECTION (Human-Friendly & Grounded)             */}
            {/* ============================================================= */}
            {aiInsights && (
              <div className="p-5 sm:p-6 rounded-[11px] border border-[#27382F] bg-[#18201C] shadow-subtle space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#159A72] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#159A72] shrink-0" />
                    <span>AI INSIGHT</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#7A857E]">
                    Based on {aiInsights.evidenceBasis.repositoriesCount || repoCount} projects ·{" "}
                    {aiInsights.evidenceBasis.commitsCount || commitCount} commits
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#F7F6F1] font-mono">
                    Consistent Development Activity
                  </h3>
                </div>

                {/* What Gitrium Found & Why This Matters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3.5 rounded-[7px] bg-[#151A17] border border-[#24352C] space-y-1">
                    <span className="text-[#159A72] font-bold block uppercase tracking-wider text-[11px]">
                      What Gitrium found:
                    </span>
                    <span className="text-[#A8B3AC] font-sans text-xs leading-relaxed block">
                      Your commit activity is distributed across multiple projects and time periods without
                      unusual activity spikes.
                    </span>
                  </div>

                  <div className="p-3.5 rounded-[7px] bg-[#151A17] border border-[#24352C] space-y-1">
                    <span className="text-[#159A72] font-bold block uppercase tracking-wider text-[11px]">
                      Why this matters:
                    </span>
                    <span className="text-[#A8B3AC] font-sans text-xs leading-relaxed block">
                      This indicates sustained development activity across your connected repositories with
                      traceable chronological history.
                    </span>
                  </div>
                </div>

                {/* Expandable Evidence Details */}
                <details className="group pt-2 border-t border-[#24352C] text-xs font-mono">
                  <summary className="cursor-pointer text-[#159A72] hover:text-[#34D399] text-xs font-medium py-1 select-none flex items-center justify-between transition-colors">
                    <span>Why this insight? View evidence details</span>
                    <span className="text-[#7A857E] group-open:rotate-180 transition-transform">▾</span>
                  </summary>

                  <div className="pt-3 pb-1 space-y-2.5 text-xs text-[#A8B3AC] font-sans leading-relaxed">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                      <div className="p-2.5 rounded bg-[#151A17] border border-[#24352C]">
                        <span className="text-[#7A857E] block text-[10px] uppercase">Evidence Base:</span>
                        <span className="text-[#F7F6F1] font-semibold mt-0.5 block">
                          {repoCount} Repos · {commitCount} Commits
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-[#151A17] border border-[#24352C]">
                        <span className="text-[#7A857E] block text-[10px] uppercase">Supporting Signal:</span>
                        <span className="text-[#159A72] font-semibold mt-0.5 block">
                          Multi-Month Continuity
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-[#151A17] border border-[#24352C]">
                        <span className="text-[#7A857E] block text-[10px] uppercase">Evidence Strength:</span>
                        <span className="text-[#F7F6F1] font-semibold mt-0.5 block">
                          {evidenceStrength}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-[#151A17] border border-[#24352C] text-[#7A857E] font-mono text-[10px] flex items-center justify-between flex-wrap gap-1">
                      <span>Evidence Traceability Key:</span>
                      <span className="text-[#159A72]">
                        {aiInsights.evidenceTraceabilityKey
                          ? aiInsights.evidenceTraceabilityKey.slice(0, 24)
                          : "VERIFIED_HISTORY"}
                        ...
                      </span>
                    </div>
                  </div>
                </details>
              </div>
            )}

            {/* ============================================================= */}
            {/* 6. VISUAL EVIDENCE BREAKDOWN (What Gitrium Saw vs Means)       */}
            {/* ============================================================= */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#F7F6F1] uppercase tracking-wider font-mono">
                  Analytical Evidence Breakdown
                </h3>
                <p className="text-xs text-[#7A857E] font-sans mt-0.5">
                  How Gitrium interprets each audited dimension from your repository history
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {signals.map((sig) => {
                  const IconComp = DIMENSION_ICONS[sig.category] || FolderGit2;

                  return (
                    <div
                      key={sig.id}
                      className="p-5 rounded-[11px] border border-[#27382F] bg-[#18201C] shadow-subtle flex flex-col justify-between space-y-3.5"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3 font-mono">
                          <div className="flex items-center gap-2">
                            <IconComp className="w-4 h-4 text-[#159A72]" />
                            <h4 className="text-sm font-bold text-[#F7F6F1]">
                              {sig.name || sig.category}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#159A72]">{sig.score} / 100</span>
                            <EvidenceStrengthBadge strength={sig.label} />
                          </div>
                        </div>

                        {/* What Gitrium saw vs What that means */}
                        <div className="space-y-2 text-xs font-sans">
                          <div className="p-3 rounded-[6px] bg-[#151A17] border border-[#24352C] space-y-0.5">
                            <span className="font-mono text-[10px] uppercase font-bold text-[#159A72] block">
                              What Gitrium saw:
                            </span>
                            <p className="text-[#A8B3AC] leading-relaxed">
                              {sig.whatGitriumSaw || sig.description}
                            </p>
                          </div>

                          <div className="p-3 rounded-[6px] bg-[#151A17] border border-[#24352C] space-y-0.5">
                            <span className="font-mono text-[10px] uppercase font-bold text-[#34D399] block">
                              What that means:
                            </span>
                            <p className="text-[#A8B3AC] leading-relaxed">
                              {sig.whatThisMeans || "Provides verified context about your engineering patterns over time."}
                            </p>
                          </div>
                        </div>

                        {/* Audited Findings */}
                        {sig.findings && sig.findings.length > 0 && (
                          <div className="space-y-1.5 pt-3 mt-3 border-t border-[#24352C] font-mono">
                            <span className="text-[10px] uppercase font-bold text-[#7A857E] block">
                              Audited Findings:
                            </span>
                            {sig.findings.map((f, fIdx) => (
                              <div key={fIdx} className="flex items-start gap-2 text-xs text-[#A8B3AC]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#159A72] mt-0.5 shrink-0" />
                                <span className="font-sans text-[11px] leading-relaxed">{f}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#24352C]/60 flex items-center justify-between text-[11px] font-mono text-[#7A857E]">
                        <span>Confidence Interval:</span>
                        <span className="text-[#F7F6F1]">{sig.confidenceInterval}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ============================================================= */}
            {/* 7. HOW GITRIUM EVALUATES THIS (Methodology Visual Flow)        */}
            {/* ============================================================= */}
            <div className="p-6 rounded-[11px] border border-[#27382F] bg-[#18201C] shadow-subtle space-y-5">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#159A72] block">
                  METHODOLOGY
                </span>
                <h3 className="text-base sm:text-lg font-bold font-mono text-[#F7F6F1] mt-0.5">
                  How Gitrium Evaluates This
                </h3>
                <p className="text-xs text-[#7A857E] font-sans mt-0.5">
                  Our evidence-based methodology from raw GitHub records to verified integrity summary
                </p>
              </div>

              {/* 6-Step Visual Flow */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 relative">
                {METHODOLOGY_STEPS.map((step, idx) => {
                  const StepIcon = step.icon;

                  return (
                    <div
                      key={step.step}
                      className="p-3.5 rounded-[8px] bg-[#151A17] border border-[#24352C] flex flex-col justify-between relative group hover:border-[#159A72]/50 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-[#159A72]">
                            {step.step}
                          </span>
                          <StepIcon className="w-4 h-4 text-[#7A857E] group-hover:text-[#159A72] transition-colors" />
                        </div>
                        <h4 className="text-xs font-bold font-mono text-[#F7F6F1]">
                          {step.title}
                        </h4>
                        <p className="text-[11px] text-[#A8B3AC] font-sans leading-relaxed">
                          {step.description}
                        </p>
                      </div>

                      {/* Directional Arrow (Desktop: Right arrow on steps 1-5; Mobile: hidden) */}
                      {idx < METHODOLOGY_STEPS.length - 1 && (
                        <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-[#2E3E34]">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}