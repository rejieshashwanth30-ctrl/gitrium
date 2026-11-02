"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { gitriumApi } from "@/lib/services/gitriumApiService";
import { CareerMatch } from "@/types";
import { StructuredAIInsights } from "@/lib/intelligence/aiLayer";
import { FEATURE_FLAGS } from "@/lib/config/features";
import {
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Github,
  TrendingUp,
  ShieldCheck,
  Cpu,
  Layers,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CareerIntelligencePage() {
  // If Career Match is temporarily disabled in feature flags, render the polished Coming Soon view
  if (!FEATURE_FLAGS.CAREER_MATCH) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-8 font-sans">
          {/* Header Badge */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18352B] border border-[#27382F] text-[#159A72] text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RESEARCH &amp; VALIDATION</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-mono text-[#F7F6F1] tracking-tight">
              Career Insights Are Coming Soon
            </h1>

            <p className="text-sm sm:text-base text-[#A8B3AC] max-w-xl leading-relaxed">
              Gitrium is currently focused on accurate project analysis, skill evidence, and developer intelligence. Career matching will be introduced after further validation.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard">
                <Button
                  variant="emerald"
                  size="md"
                  className="gap-2 bg-[#087453] hover:bg-[#159A72] text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Dashboard</span>
                </Button>
              </Link>
              <Link href="/skills">
                <Button
                  variant="outline"
                  size="md"
                  className="gap-2 border-[#2E3E34] bg-[#151A17] hover:bg-[#24352C] text-[#F7F6F1]"
                >
                  <Cpu className="w-4 h-4 text-[#159A72]" />
                  <span>Explore Skill Evidence</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Validation Pillars: What Gitrium is building */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-5 rounded-[11px] bg-[#18201C] border border-[#27382F] space-y-2.5">
              <div className="w-8 h-8 rounded-[7px] bg-[#18352B] text-[#159A72] flex items-center justify-center border border-[#159A72]/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-mono text-[#F7F6F1]">
                Evidence-Backed Role Alignment
              </h3>
              <p className="text-xs text-[#A8B3AC] leading-relaxed">
                Role recommendations will map strictly to verified repository activity, architectural layers, and commit cadence rather than ungrounded claims.
              </p>
            </div>

            <div className="p-5 rounded-[11px] bg-[#18201C] border border-[#27382F] space-y-2.5">
              <div className="w-8 h-8 rounded-[7px] bg-[#18352B] text-[#159A72] flex items-center justify-center border border-[#159A72]/20">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-mono text-[#F7F6F1]">
                Code Provenance Tracing
              </h3>
              <p className="text-xs text-[#A8B3AC] leading-relaxed">
                Every career suggestion will point directly to demonstrated implementation proofs, package manifests, and engineering patterns.
              </p>
            </div>

            <div className="p-5 rounded-[11px] bg-[#18201C] border border-[#27382F] space-y-2.5">
              <div className="w-8 h-8 rounded-[7px] bg-[#18352B] text-[#159A72] flex items-center justify-center border border-[#159A72]/20">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-mono text-[#F7F6F1]">
                No Employment Promises
              </h3>
              <p className="text-xs text-[#A8B3AC] leading-relaxed">
                Gitrium focuses on objective developer intelligence. We never fabricate hiring guarantees, salary estimates, or placement promises.
              </p>
            </div>
          </div>

          {/* Transparent Notice */}
          <div className="p-4 rounded-[9px] bg-[#151A17] border border-[#24352C] text-center font-mono text-xs text-[#7A857E]">
            Status: Core GitHub synchronization, AST analysis, and deterministic skill evidence active. Career matching undergoing safety evaluation.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Preserved Implementation View (Active when FEATURE_FLAGS.CAREER_MATCH is enabled)
  return <PreservedCareerMatchImplementation />;
}

/**
 * Preserved Career Match implementation component:
 * Retained in the codebase with all null-checks and defensive typing in place
 * for future reactivation once evaluation criteria are fulfilled.
 */
function PreservedCareerMatchImplementation() {
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
              <span>CAREER MATCHES</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#F7F6F1] tracking-tight uppercase">
              Career Matches
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#A8B3AC] font-sans">
              Based on the technologies and project experience found in your GitHub activity.
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
              {!githubConnected ? "GitHub not connected." : "Connect GitHub to see career matches."}
            </h3>
            <p className="text-xs text-[#A8B3AC] font-sans max-w-md mx-auto">
              {!githubConnected
                ? "Connect GitHub to analyze your projects and discover matching engineering roles."
                : "Role alignments are calculated from the projects and technologies you work with. Connect your repositories to get started."}
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
                    <span>AI Insights: Career Direction</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#7A857E]">
                    Based on {aiInsights.evidenceBasis.repositoriesCount} projects · {aiInsights.evidenceBasis.commitsCount} commits
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
                const isSelected = selectedMatch?.roleTitle === career.roleTitle;

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
            {selectedMatch && (
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
                      {(selectedMatch.evidenceBackedStrengths || []).map((str, idx) => (
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
                        {(selectedMatch.demonstratedSkills || []).map((sk, idx) => (
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
                      {(selectedMatch.missingEvidenceAreas || []).map((gap, idx) => (
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
                        {(selectedMatch.recommendedProjects || []).map((rec, idx) => (
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
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
