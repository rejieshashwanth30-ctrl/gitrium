"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { ANALYSIS_STAGES } from "@/lib/constants";
import { gitriumApi } from "@/lib/services/gitriumApiService";
import { Repository } from "@/types";
import { StructuredAIInsights } from "@/lib/intelligence/aiLayer";
import { AiInterpretationSection } from "@/components/intelligence/AiInterpretationSection";
import {
  Scan,
  CheckCircle2,
  Loader2,
  Terminal,
  ShieldCheck,
  GitFork,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const AI_SYNTHESIS_STEPS = [
  {
    id: "ai-1",
    title: "Looking for code and architecture patterns",
    description: "Reviewing your project structure, frameworks, and component layout",
  },
  {
    id: "ai-2",
    title: "Reviewing test & activity signals",
    description: "Checking automated tests, commit cadence, and regular project updates",
  },
  {
    id: "ai-3",
    title: "Connecting project evidence",
    description: "Linking verified project artifacts to your developer profile",
  },
  {
    id: "ai-4",
    title: "Generating insights & recommendations",
    description: "Deriving observed strengths, growing skills, and career direction",
  },
];

export default function AnalysisEnginePage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<"idle" | "ast" | "ai" | "completed">("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [aiStep, setAiStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<StructuredAIInsights | null>(null);
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      setIsLoadingRepos(true);
      try {
        const [repos, cachedInsights] = await Promise.all([
          gitriumApi.getRepositories(),
          gitriumApi.getAIInsights(),
        ]);
        if (Array.isArray(repos) && repos.length > 0) {
          setRepositories(repos);
          setSelectedRepoId(repos[0].id);
        }
        if (cachedInsights) {
          setAiInsights(cachedInsights);
        }
      } catch (err) {
        console.warn("Failed to load initial analysis data:", err);
      } finally {
        setIsLoadingRepos(false);
      }
    }
    loadInitialData();
  }, []);

  const selectedRepo = repositories.find((r) => r.id === selectedRepoId) || repositories[0];

  const handleStartAnalysis = async () => {
    if (!selectedRepo) return;
    setIsRunning(true);
    setPhase("ast");
    setCurrentStep(0);
    setAiStep(0);
    setIsCompleted(false);
    setGeneratedReportId(null);

    // Trigger backend report generation
    gitriumApi.generateReport(selectedRepo.id).then((res) => {
      if (res.success && res.reportId) {
        setGeneratedReportId(res.reportId);
      }
    });

    // Stage 1: Project & History Review loop
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < ANALYSIS_STAGES.length) {
        setCurrentStep(step);
      } else {
        clearInterval(interval);
        // Transition to Stage 2: AI Insights Synthesis
        setPhase("ai");
        runAiPhase();
      }
    }, 400);
  };

  const runAiPhase = async () => {
    const aiPromise = gitriumApi.getAIInsights(true);

    let step = 0;
    const aiInterval = setInterval(async () => {
      step++;
      if (step < AI_SYNTHESIS_STEPS.length) {
        setAiStep(step);
      } else {
        clearInterval(aiInterval);
        try {
          const freshInsights = await aiPromise;
          if (freshInsights) {
            setAiInsights(freshInsights);
          }
        } catch (e) {
          console.warn("AI synthesis retrieval error:", e);
        }
        setPhase("completed");
        setIsRunning(false);
        setIsCompleted(true);
      }
    }, 450);
  };

  const totalSteps = ANALYSIS_STAGES.length + AI_SYNTHESIS_STEPS.length;
  const currentCompletedSteps =
    phase === "completed"
      ? totalSteps
      : phase === "ai"
      ? ANALYSIS_STAGES.length + aiStep
      : phase === "ast"
      ? currentStep
      : 0;

  const progressPercent = Math.min(100, Math.round((currentCompletedSteps / totalSteps) * 100));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#24352C]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#18352B] border border-[#27382F] text-[#159A72] text-xs font-mono font-semibold mb-2">
              <Scan className="w-3.5 h-3.5" />
              <span>PROJECT ANALYSIS &amp; INSIGHTS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#F7F6F1] tracking-tight uppercase">
              Project Analysis
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#A8B3AC] font-sans">
              Gitrium reviews your project structure, technologies, activity, and development history.
            </p>
          </div>
        </div>

        {/* Engine Setup Card */}
        {isLoadingRepos ? (
          <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-8 text-center font-mono text-xs text-[#7A857E] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#159A72]" />
            <span>Loading connected projects...</span>
          </div>
        ) : repositories.length === 0 ? (
          <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-8 text-center font-mono text-xs text-[#7A857E] space-y-3">
            <GitFork className="w-8 h-8 text-[#2E3E34] mx-auto" />
            <h3 className="text-sm font-bold text-[#F7F6F1]">No Projects Available for Analysis</h3>
            <p className="font-sans">Connect and synchronize GitHub repositories to begin running automated project analysis.</p>
            <div className="pt-2">
              <Link href="/github-connect">
                <Button variant="emerald" size="sm" className="bg-[#087453] hover:bg-[#159A72] text-white">
                  Connect GitHub Account
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-6 sm:p-7 shadow-subtle">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-3 font-mono">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A857E]">
                  Target Project for Analysis
                </label>

                <select
                  disabled={isRunning}
                  value={selectedRepoId}
                  onChange={(e) => {
                    setSelectedRepoId(e.target.value);
                    setIsCompleted(false);
                    setPhase("idle");
                    setCurrentStep(0);
                    setAiStep(0);
                    setGeneratedReportId(null);
                  }}
                  className="w-full bg-[#151A17] border border-[#2E3E34] rounded-[6px] px-3.5 py-2.5 text-xs sm:text-sm text-[#F7F6F1] focus:outline-none focus:border-[#159A72]"
                >
                  {repositories.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fullName} ({r.primaryLanguage || "Technology"} • {r.commitCount} commits)
                    </option>
                  ))}
                </select>

                <p className="text-xs text-[#A8B3AC] font-sans">
                  Gitrium will review project code, commits, and packages, then update your AI insights and skill profile.
                </p>
              </div>

              <div className="md:col-span-4 flex flex-col gap-2.5">
                <Button
                  variant="emerald"
                  size="lg"
                  isLoading={isRunning}
                  onClick={handleStartAnalysis}
                  className="w-full gap-2 text-sm font-semibold bg-[#087453] hover:bg-[#159A72] text-white"
                >
                  <Scan className="w-4 h-4" />
                  <span>
                    {isRunning
                      ? phase === "ast"
                        ? "Stage 1: Reviewing Projects..."
                        : "Stage 2: Preparing Insights..."
                      : "Run Project Analysis"}
                  </span>
                </Button>

                {isCompleted && (
                  <Link href={`/reports/${generatedReportId || selectedRepo?.id}`} className="w-full">
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full gap-2 text-xs border-[#2E3E34] bg-[#151A17] hover:bg-[#24352C] text-[#F7F6F1]"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#159A72]" />
                      <span>View Generated Report</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Live Execution Console */}
        {(isRunning || isCompleted) && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#159A72] font-semibold flex items-center gap-1.5">
                {isRunning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>
                      {phase === "ast"
                        ? "STAGE 1: REVIEWING PROJECT STRUCTURE & ACTIVITY..."
                        : "STAGE 2: PREPARING AI INSIGHTS & RECOMMENDATIONS..."}
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#159A72]" />
                    <span>PROJECT ANALYSIS &amp; INSIGHTS COMPLETE</span>
                  </>
                )}
              </span>
              <span className="text-[#F7F6F1] font-bold">{progressPercent}%</span>
            </div>

            <div className="h-2 w-full bg-[#18201C] rounded-[4px] overflow-hidden border border-[#27382F]">
              <div
                className={cn(
                  "h-full transition-all duration-300 rounded-[4px]",
                  isCompleted ? "bg-[#087453]" : "bg-[#159A72]"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Terminal Window */}
            <div className="rounded-[11px] border border-[#27382F] bg-[#151A17] p-5 font-mono text-xs space-y-4 text-[#F7F6F1] shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-[#24352C] text-[#7A857E] text-[11px]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-[#159A72]" />
                  <span>gitrium-analysis-engine — target: {selectedRepo?.fullName || "project"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold",
                    phase === "ast" ? "bg-[#18352B] text-[#159A72]" : "bg-[#18201C] text-[#7A857E]"
                  )}>
                    STAGE 1: PROJECT REVIEW
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold",
                    phase === "ai" || phase === "completed" ? "bg-[#18352B] text-[#159A72]" : "bg-[#18201C] text-[#7A857E]"
                  )}>
                    STAGE 2: AI INSIGHTS
                  </span>
                </div>
              </div>

              {/* Stage 1 Checklist */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-bold text-[#7A857E] tracking-wider">
                  Phase 1: Project &amp; Contribution Review
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pl-1">
                  {ANALYSIS_STAGES.map((stage, idx) => {
                    const isStageDone = phase !== "idle" && (phase !== "ast" || idx < currentStep || isCompleted);
                    const isCurrent = phase === "ast" && idx === currentStep && isRunning;

                    return (
                      <div
                        key={stage.id}
                        className={cn(
                          "flex items-start gap-3 transition-opacity duration-200",
                          isStageDone ? "text-[#F7F6F1]" : isCurrent ? "text-[#159A72]" : "text-[#56635C] opacity-40"
                        )}
                      >
                        <div className="mt-0.5">
                          {isStageDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#159A72] flex-shrink-0" />
                          ) : isCurrent ? (
                            <Loader2 className="w-3.5 h-3.5 text-[#159A72] animate-spin flex-shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-[#27382F] flex-shrink-0" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-xs leading-none mb-0.5">{stage.title}</div>
                          <div className="text-[11px] text-[#7A857E] font-sans">{stage.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stage 2 Checklist */}
              {(phase === "ai" || phase === "completed") && (
                <div className="space-y-2 pt-3 border-t border-[#24352C]">
                  <div className="text-[10px] uppercase font-bold text-[#159A72] tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#159A72]" />
                    <span>Phase 2: AI Insights &amp; Recommendations</span>
                  </div>
                  <div className="space-y-2 pl-1">
                    {AI_SYNTHESIS_STEPS.map((step, idx) => {
                      const isStepDone = phase === "completed" || idx < aiStep;
                      const isCurrent = phase === "ai" && idx === aiStep;

                      return (
                        <div
                          key={step.id}
                          className={cn(
                            "flex items-start gap-3 transition-opacity duration-200",
                            isStepDone ? "text-[#F7F6F1]" : isCurrent ? "text-[#159A72]" : "text-[#56635C] opacity-40"
                          )}
                        >
                          <div className="mt-0.5">
                            {isStepDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#159A72] flex-shrink-0" />
                            ) : isCurrent ? (
                              <Loader2 className="w-3.5 h-3.5 text-[#159A72] animate-spin flex-shrink-0" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-[#27382F] flex-shrink-0" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-xs leading-none mb-0.5">{step.title}</div>
                            <div className="text-[11px] text-[#7A857E] font-sans">{step.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Synthesized AI Evidence Interpretation Panel */}
        {aiInsights && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono font-bold text-[#F7F6F1] tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#159A72]" />
                <span>Your Project Insights</span>
              </h2>
            </div>
            <AiInterpretationSection
              insights={aiInsights}
              onRefresh={handleStartAnalysis}
              isRefreshing={isRunning}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
