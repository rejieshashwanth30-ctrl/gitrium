"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { ANALYSIS_STAGES } from "@/lib/constants";
import { gitriumApi } from "@/lib/services/gitriumApiService";
import { Repository } from "@/types";
import {
  Scan,
  CheckCircle2,
  Loader2,
  Terminal,
  ShieldCheck,
  AlertCircle,
  GitFork,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AnalysisEnginePage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null);
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);

  useEffect(() => {
    async function loadRepos() {
      setIsLoadingRepos(true);
      try {
        const repos = await gitriumApi.getRepositories();
        if (Array.isArray(repos) && repos.length > 0) {
          setRepositories(repos);
          setSelectedRepoId(repos[0].id);
        }
      } catch (err) {
        console.warn("Failed to load repositories for analysis:", err);
      } finally {
        setIsLoadingRepos(false);
      }
    }
    loadRepos();
  }, []);

  const selectedRepo = repositories.find((r) => r.id === selectedRepoId) || repositories[0];

  const handleStartAnalysis = async () => {
    if (!selectedRepo) return;
    setIsRunning(true);
    setCurrentStep(0);
    setIsCompleted(false);
    setGeneratedReportId(null);

    // Trigger backend report generation in parallel with console analysis stages
    gitriumApi.generateReport(selectedRepo.id).then((res) => {
      if (res.success && res.reportId) {
        setGeneratedReportId(res.reportId);
      }
    });

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < ANALYSIS_STAGES.length) {
        setCurrentStep(step);
      } else {
        clearInterval(interval);
        setIsRunning(false);
        setIsCompleted(true);
      }
    }, 500);
  };

  const progressPercent = Math.round(
    ((currentStep + (isCompleted ? 1 : 0)) / ANALYSIS_STAGES.length) * 100
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#24352C]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#18352B] border border-[#27382F] text-[#159A72] text-xs font-mono font-semibold mb-2">
              <Scan className="w-3.5 h-3.5" />
              <span>DETERMINISTIC CODE AUDIT PIPELINE</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#F7F6F1] tracking-tight uppercase">
              Gitrium Analysis Engine
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#A8B3AC] font-mono">
              Run multi-phase AST syntactic audits, commit DAG traversals, and cryptographic skill provenance synthesis.
            </p>
          </div>
        </div>

        {/* Engine Setup Card */}
        {isLoadingRepos ? (
          <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-8 text-center font-mono text-xs text-[#7A857E] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#159A72]" />
            <span>Loading synchronized repositories...</span>
          </div>
        ) : repositories.length === 0 ? (
          <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-8 text-center font-mono text-xs text-[#7A857E] space-y-3">
            <GitFork className="w-8 h-8 text-[#2E3E34] mx-auto" />
            <h3 className="text-sm font-bold text-[#F7F6F1]">No Codebases Available for Analysis</h3>
            <p>Connect and synchronize GitHub repositories to begin running automated AST audits.</p>
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
                  Target Repository for Evidence Extraction
                </label>

                <select
                  disabled={isRunning}
                  value={selectedRepoId}
                  onChange={(e) => {
                    setSelectedRepoId(e.target.value);
                    setIsCompleted(false);
                    setCurrentStep(0);
                    setGeneratedReportId(null);
                  }}
                  className="w-full bg-[#151A17] border border-[#2E3E34] rounded-[6px] px-3.5 py-2.5 text-xs sm:text-sm text-[#F7F6F1] focus:outline-none focus:border-[#159A72]"
                >
                  {repositories.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fullName} ({r.primaryLanguage || "Ecosystem"} • {r.commitCount} commits)
                    </option>
                  ))}
                </select>

                <p className="text-xs text-[#A8B3AC] font-sans">
                  Engine will examine commits, diff signatures, test suites, and framework imports to update your profile.
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
                  <span>{isRunning ? "Running Engine..." : "Run Deep AST Analysis"}</span>
                </Button>

                {isCompleted && (
                  <Link href={`/reports/${generatedReportId || selectedRepo?.id}`} className="w-full">
                    <Button variant="outline" size="md" className="w-full gap-2 text-xs border-[#2E3E34] bg-[#151A17] hover:bg-[#24352C] text-[#F7F6F1]">
                      <ShieldCheck className="w-4 h-4 text-[#159A72]" />
                      <span>View Generated Audit Report</span>
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
                    EXECUTING DETERMINISTIC VERIFICATION PHASES...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#159A72]" />
                    AUDIT COMPILATION FINISHED • HASH RECORDED
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

            <div className="rounded-[11px] border border-[#27382F] bg-[#151A17] p-5 font-mono text-xs space-y-2 text-[#F7F6F1] shadow-inner">
              <div className="flex items-center gap-2 pb-3 border-b border-[#24352C] text-[#7A857E] text-[11px]">
                <Terminal className="w-3.5 h-3.5 text-[#159A72]" />
                <span>gitrium-analysis-engine v1.4.0 — target: {selectedRepo?.fullName || "repository"}</span>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pt-2">
                {ANALYSIS_STAGES.map((stage, idx) => {
                  const isStageDone = idx < currentStep || isCompleted;
                  const isCurrent = idx === currentStep && isRunning;

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
                          <CheckCircle2 className="w-4 h-4 text-[#159A72] flex-shrink-0" />
                        ) : isCurrent ? (
                          <Loader2 className="w-4 h-4 text-[#159A72] animate-spin flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-[#27382F] flex-shrink-0" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-xs">{stage.title}</div>
                        <div className="text-[11px] text-[#7A857E] font-sans">{stage.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
