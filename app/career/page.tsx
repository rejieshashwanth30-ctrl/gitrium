"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { gitriumApi } from "@/lib/services/gitriumApiService";
import { CareerMatch } from "@/types";
import { StructuredAIInsights } from "@/lib/intelligence/aiLayer";
import {
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Github,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CareerIntelligencePage() {
  const [matches, setMatches] = useState<CareerMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<CareerMatch | null>(null);
  const [aiInsights, setAiInsights] = useState<StructuredAIInsights | null>(null);
  const [githubConnected, setGithubConnected] = useState(false);

  useEffect(() => {
    async function loadCareerData() {
      try {
        const [profile, liveMatches, insights] = await Promise.all([
          gitriumApi.getProfile(),
          gitriumApi.getCareerMatches(),
          gitriumApi.getAIInsights(),
        ]);
        setGithubConnected(profile?.github?.connectionStatus === "connected");
        if (Array.isArray(liveMatches) && liveMatches.length > 0) {
          setMatches(liveMatches);
          setSelectedMatch(liveMatches[0]);
        }
        if (insights) {
          setAiInsights(insights);
        }
      } catch (err) {
        console.warn("Career data fetch error:", err);
      }
    }
    loadCareerData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#24352C]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#18352B] border border-[#27382F] text-[#159A72] text-xs font-mono font-semibold mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>ROLE EVIDENCE ALIGNMENT</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#F7F6F1] tracking-tight uppercase">
              Where Your Work Can Take You
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#A8B3AC] font-mono">
              Observed engineering evidence alignment across industry engineering benchmarks • Not a hiring prediction.
            </p>
          </div>
        </div>

        {/* Empty State / Content */}
        {matches.length === 0 || !selectedMatch ? (
          <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-[8px] bg-[#151A17] border border-[#2E3E34] text-[#159A72] flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-mono text-[#F7F6F1]">
              {!githubConnected ? "GitHub not connected." : "Insufficient evidence for role alignment."}
            </h3>
            <p className="text-xs text-[#A8B3AC] font-mono max-w-md mx-auto">
              {!githubConnected
                ? "Connect GitHub to analyze your codebases and evaluate your demonstrable role competency."
                : "Role alignments are calculated against verified code repositories. Synchronize codebases to evaluate observed role alignment."}
            </p>
            {!githubConnected ? (
              <div className="pt-2">
                <Link href="/github-connect">
                  <Button
                    variant="emerald"
                    size="md"
                    className="gap-2 bg-[#087453] hover:bg-[#159A72] text-white"
                  >
                    <Github className="w-4 h-4" />
                    <span>Connect GitHub Account</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="pt-2">
                <Link href="/dashboard">
                  <Button
                    variant="emerald"
                    size="md"
                    className="gap-2 bg-[#087453] hover:bg-[#159A72] text-white"
                  >
                    <span>Go to Dashboard &amp; Sync</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* AI Career Trajectory Highlights */}
            {aiInsights && (
              <div className="p-5 rounded-[11px] border border-[#27382F] bg-[#18201C] shadow-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#159A72] uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-[#159A72]" />
                    <span>AI Career Trajectory &amp; Role Grounding</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#7A857E]">
                    Evidence Basis: {aiInsights.evidenceBasis.repositoriesCount} repos • {aiInsights.evidenceBasis.commitsCount} commits
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-mono text-xs">
                  <div className="p-3.5 rounded-[8px] bg-[#151A17] border border-[#24352C] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[#159A72] font-bold text-xs uppercase">
                      <TrendingUp className="w-3.5 h-3.5 text-[#159A72]" />
                      <span>Why This Alignment Exists</span>
                    </div>
                    <p className="text-[11px] text-[#A8B3AC] leading-relaxed font-sans">
                      {aiInsights.careerSignals.length > 0
                        ? `${aiInsights.careerSignals[0].role}: ${aiInsights.careerSignals[0].explanation}`
                        : "Observed commits, architectural layers, and library imports demonstrate sustained alignment with modern web application engineering."}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[8px] bg-[#151A17] border border-[#24352C] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[#D97745] font-bold text-xs uppercase">
                      <Lightbulb className="w-3.5 h-3.5 text-[#D97745]" />
                      <span>Recommended Technical Expansion</span>
                    </div>
                    <p className="text-[11px] text-[#A8B3AC] leading-relaxed font-sans">
                      {aiInsights.recommendedNextSteps.length > 0
                        ? `${aiInsights.recommendedNextSteps[0].title}: ${aiInsights.recommendedNextSteps[0].reason}`
                        : "To increase alignment for senior roles, introduce automated test coverage and publish modular packages."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Role Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((career, idx) => {
                const isSelected = selectedMatch.roleTitle === career.roleTitle;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedMatch(career)}
                    className={cn(
                      "p-5 rounded-[11px] border transition-all cursor-pointer flex flex-col justify-between bg-[#18201C] shadow-subtle",
                      isSelected
                        ? "border-[#159A72] ring-1 ring-[#159A72]"
                        : "border-[#27382F] hover:border-[#159A72]/60"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-extrabold text-[#159A72] font-mono">
                          {career.matchPercentage}%
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#18352B] text-[#159A72] border border-[#27382F] font-bold uppercase">
                          {career.alignment}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold font-mono text-[#F7F6F1] mb-1">{career.roleTitle}</h3>
                      <p className="text-xs text-[#A8B3AC] line-clamp-2 font-sans">{career.roleDescription}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#24352C] flex items-center justify-between text-xs text-[#159A72] font-mono font-medium">
                      <span>Inspect Skill Gap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Deep Skill Gap & Recommendations View */}
            <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-6 sm:p-7 shadow-subtle space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#24352C]">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#159A72]">
                    Observed Engineering Evidence Alignment
                  </span>
                  <h2 className="text-xl font-bold font-mono text-[#F7F6F1] mt-0.5">
                    {selectedMatch.roleTitle}
                  </h2>
                  <p className="text-xs text-[#A8B3AC] mt-1 max-w-2xl font-sans">{selectedMatch.roleDescription}</p>
                </div>

                <div className="p-3.5 rounded-[6px] bg-[#151A17] border border-[#24352C] text-center font-mono">
                  <span className="text-[10px] text-[#7A857E] uppercase">Evidence Match</span>
                  <div className="text-xl font-extrabold text-[#159A72]">{selectedMatch.matchPercentage}%</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {/* Left: Strong Demonstrated Evidence */}
                <div className="space-y-3.5 font-mono">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#159A72] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#159A72]" />
                    <span>Evidence-Backed Core Strengths</span>
                  </h3>

                  <div className="space-y-2.5">
                    {selectedMatch.evidenceBackedStrengths.map((str, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-[6px] bg-[#151A17] border border-[#24352C] flex items-start gap-2.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#159A72] mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-[#F7F6F1] font-sans">{str}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1">
                    <span className="text-xs font-bold text-[#7A857E] block mb-1.5">
                      Matching Skill Nodes:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedMatch.demonstratedSkills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-[4px] bg-[#18352B] border border-[#27382F] text-[#159A72] text-xs font-mono"
                        >
                          ✓ {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Skill Gap & Recommendations */}
                <div className="space-y-3.5 font-mono">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#D97745] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-[#D97745]" />
                    <span>Evidence Gaps to Close</span>
                  </h3>

                  <div className="space-y-2.5">
                    {selectedMatch.missingEvidenceAreas.map((gap, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-[6px] bg-[#151A17] border border-[#24352C] flex items-start gap-2.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-[#D97745] mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-[#F7F6F1] block">{gap}</span>
                          <span className="text-[11px] text-[#7A857E] font-sans">
                            Limited or unverified public commit evidence detected for this competency.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommended Projects to Close Gaps */}
                  <div className="pt-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#159A72] flex items-center gap-1.5 mb-2">
                      <Lightbulb className="w-4 h-4" />
                      <span>Recommended Projects &amp; Code Proofs</span>
                    </h4>

                    <div className="space-y-2 font-sans">
                      {selectedMatch.recommendedProjects.map((rec, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-[6px] bg-[#18352B]/40 border border-[#27382F] flex items-start gap-2.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#159A72] mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-[#A8B3AC]">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transparent Footnote */}
              <div className="pt-4 border-t border-[#24352C] text-[11px] font-mono text-[#7A857E] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>
                  Methodology: Match scores represent demonstrable skill coverage across verified codebases.
                </span>
                <span className="text-[#A8B3AC]">
                  Gitrium does not guarantee hiring outcomes or predict employment.
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
