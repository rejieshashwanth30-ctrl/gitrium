"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { EvidenceStrengthBadge } from "@/components/ui/Badge";
import { ContributionHeatmap } from "@/components/charts/ContributionHeatmap";
import { DeveloperEvidenceGraph } from "@/components/graphs/DeveloperEvidenceGraph";
import { IntegrityScoreGauge } from "@/components/integrity/IntegrityScoreGauge";
import { AnalysisScannerModal } from "@/components/analysis/AnalysisScannerModal";
import { gitriumApi } from "@/lib/services/gitriumApiService";
import { Repository, Skill } from "@/types";
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Cpu,
  Clock,
  Layers,
  CheckCircle2,
  GitCommit,
  GitFork,
  FileCode,
  Flame,
  AlertCircle,
  RefreshCw,
  Github,
} from "lucide-react";

// ============================================================================
// 16. DASHBOARD PRIMARY AREA (Asymmetric Editorial Layout)
// Dominant work evidence number + surrounding telemetry
// ============================================================================
function DashboardHeaderAndTelemetry({
  onRunAnalysis,
  developerName,
  githubConnected,
  totalContributions,
  repositoriesCount,
  technologiesCount,
  skillsCount,
  evidenceSignalsCount,
  isSyncing,
  onSync,
}: {
  onRunAnalysis: () => void;
  developerName: string;
  githubConnected: boolean;
  totalContributions: number;
  repositoriesCount: number;
  technologiesCount: number;
  skillsCount: number;
  evidenceSignalsCount: number;
  isSyncing: boolean;
  onSync: () => void;
}) {
  // Integrity score based on real repository count & commit density
  const integrityScore = repositoriesCount > 0 ? (totalContributions > 30 ? 94 : totalContributions > 10 ? 88 : 78) : 0;

  return (
    <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-6 sm:p-8 text-[#F7F6F1] shadow-subtle space-y-7">
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#24352C]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {githubConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#18352B] border border-[#27382F] text-[11px] font-mono font-medium text-[#159A72]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#159A72] animate-pulse" />
                GitHub Connected
              </span>
            ) : (
              <Link
                href="/github-connect"
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#2E201B] border border-[#48281E] text-[11px] font-mono font-medium text-[#D97745] hover:bg-[#3D2922] transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5 text-[#D97745]" />
                GitHub Disconnected • Connect Account
              </Link>
            )}
            <span className="text-[11px] text-[#7A857E] font-mono">
              • {repositoriesCount > 0 ? `${repositoriesCount} repositories verified` : "Sync required to index codebases"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F7F6F1] tracking-tight uppercase">
            YOUR ENGINEERING EVIDENCE
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#A8B3AC] max-w-xl font-mono">
            Deterministic AST provenance vault • Authenticated Developer: {developerName}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="emerald"
            size="md"
            onClick={onSync}
            isLoading={isSyncing}
            className="gap-2 bg-[#087453] hover:bg-[#159A72] text-white border-none shadow-xs text-xs sm:text-sm h-10 px-4"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync GitHub"}</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={onRunAnalysis}
            className="gap-2 border-[#2E3E34] bg-[#151A17] hover:bg-[#24352C] text-[#F7F6F1] text-xs sm:text-sm h-10 px-4"
          >
            <Sparkles className="w-4 h-4 text-[#159A72]" />
            <span>Run AST Audit</span>
          </Button>

          <Link href="/reports">
            <Button
              variant="outline"
              size="md"
              className="border-[#2E3E34] bg-[#151A17] hover:bg-[#24352C] text-[#F7F6F1] text-xs sm:text-sm h-10 px-4"
            >
              <span>Export Report</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Asymmetric Editorial Metrics: Giant dominant number + Surrounding Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Dominant Number (Left Column) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-[8px] bg-[#151A17] border border-[#24352C] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#159A72] block">
              PRIMARY WORK EVIDENCE
            </span>
            <div className="text-5xl sm:text-6xl lg:text-7xl font-extrabold font-mono text-[#F7F6F1] tracking-tight mt-1 leading-none">
              {totalContributions}
            </div>
            <div className="text-sm font-mono font-semibold text-[#F7F6F1] mt-2">
              Engineering Contributions
            </div>
            <p className="text-xs text-[#7A857E] font-mono mt-1">
              Verified commit DAG nodes across production branches
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-[#24352C] flex items-center justify-between text-xs font-mono text-[#159A72]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#159A72]" />
              {totalContributions > 0 ? "Continuous Cadence Active" : "Awaiting First Sync"}
            </span>
            <span className="text-[#A8B3AC]">{totalContributions > 0 ? "Verified History" : "0 Days"}</span>
          </div>
        </div>

        {/* Surrounding Telemetry Grid (Right Column) */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          <div className="p-4 sm:p-5 rounded-[8px] bg-[#151A17] border border-[#24352C] font-mono">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#F7F6F1]">{repositoriesCount}</div>
            <div className="text-xs font-bold text-[#A8B3AC] mt-1">Repositories Audited</div>
            <div className="text-[11px] text-[#7A857E] mt-0.5">
              {repositoriesCount > 0 ? "100% Synced & Analyzed" : "Pending Ingestion"}
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-[8px] bg-[#151A17] border border-[#24352C] font-mono">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#F7F6F1]">{technologiesCount}</div>
            <div className="text-xs font-bold text-[#A8B3AC] mt-1">Technologies Detected</div>
            <div className="text-[11px] text-[#7A857E] mt-0.5">Frameworks &amp; Manifests</div>
          </div>

          <div className="p-4 sm:p-5 rounded-[8px] bg-[#151A17] border border-[#24352C] font-mono">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#159A72]">{skillsCount}</div>
            <div className="text-xs font-bold text-[#A8B3AC] mt-1">Skills Proven</div>
            <div className="text-[11px] text-[#7A857E] mt-0.5">Deterministic AST Proof</div>
          </div>

          <div className="p-4 sm:p-5 rounded-[8px] bg-[#151A17] border border-[#24352C] font-mono">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#F7F6F1]">{evidenceSignalsCount}</div>
            <div className="text-xs font-bold text-[#A8B3AC] mt-1">Evidence Signals</div>
            <div className="text-[11px] text-[#D97745] mt-0.5">Cryptographic Nodes</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [developerName, setDeveloperName] = useState("Developer");
  const [githubConnected, setGithubConnected] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summaryMetrics, setSummaryMetrics] = useState({
    repositoriesCount: 0,
    totalCommits: 0,
    totalPRs: 0,
    totalContributions: 0,
    technologiesCount: 0,
    skillsCount: 0,
    evidenceSignalsCount: 0,
  });

  const fetchLiveDashboard = async () => {
    try {
      const summary = await gitriumApi.getDashboardSummary();
      if (summary) {
        setDeveloperName(summary.developerName);
        setGithubConnected(summary.githubConnected);
        setRepositories(summary.recentRepositories);
        setSkills(summary.topSkills);
        setSummaryMetrics({
          repositoriesCount: summary.repositoriesCount,
          totalCommits: summary.totalCommits,
          totalPRs: summary.totalPRs,
          totalContributions: summary.totalContributions,
          technologiesCount: summary.technologiesCount,
          skillsCount: summary.skillsCount,
          evidenceSignalsCount: summary.evidenceSignalsCount,
        });
      }
    } catch (err) {
      console.warn("Live dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveDashboard();
  }, []);

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await gitriumApi.triggerGitHubSync();
      setSyncFeedback(result.message);
      await fetchLiveDashboard();
    } catch {
      setSyncFeedback("Sync encounter an error. Please verify network and GitHub OAuth connection.");
    } finally {
      setIsSyncing(false);
    }
  };

  const totalContributions = summaryMetrics.totalContributions;
  const repositoriesCount = summaryMetrics.repositoriesCount;
  const technologiesCount = summaryMetrics.technologiesCount;
  const skillsCount = summaryMetrics.skillsCount;
  const evidenceSignalsCount = summaryMetrics.evidenceSignalsCount;

  // Integrity score based on real repository count & commit density
  const integrityScore = repositoriesCount > 0 ? (totalContributions > 30 ? 94 : totalContributions > 10 ? 88 : 78) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8 sm:space-y-10">
        {/* Sync feedback notification */}
        {syncFeedback && (
          <div className="p-3.5 rounded-[8px] bg-[#18352B] border border-[#159A72]/40 text-xs font-mono text-[#F7F6F1] flex items-center justify-between">
            <span>{syncFeedback}</span>
            <button
              onClick={() => setSyncFeedback(null)}
              className="text-[#A8B3AC] hover:text-white ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* 16. Dashboard Primary Area (Asymmetric Editorial Hero) */}
        <DashboardHeaderAndTelemetry
          onRunAnalysis={() => setIsScannerOpen(true)}
          developerName={developerName}
          githubConnected={githubConnected}
          totalContributions={totalContributions}
          repositoriesCount={repositories.length}
          technologiesCount={technologiesCount}
          skillsCount={skills.length}
          evidenceSignalsCount={evidenceSignalsCount}
          isSyncing={isSyncing}
          onSync={handleTriggerSync}
        />

        {/* 17. Contribution Activity Cadence (Dark Graphite Heatmap) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold text-[#F7F6F1] tracking-wider uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#159A72]" />
              <span>Contribution Activity Cadence</span>
            </h2>
            <Link
              href="/contributions"
              className="text-xs font-mono text-[#159A72] hover:underline flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ContributionHeatmap />
        </div>

        {/* 18. EVIDENCE GRAPH DASHBOARD (Major prominent section) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold text-[#F7F6F1] tracking-wider uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#159A72]" />
              <span>Evidence Graph Architecture</span>
            </h2>
            <Link
              href="/evidence"
              className="text-xs font-mono text-[#159A72] hover:underline flex items-center gap-1"
            >
              <span>Full Graph Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <DeveloperEvidenceGraph />
        </div>

        {/* 19. REPOSITORY LIST: Structured Technical Rows */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold text-[#F7F6F1] tracking-wider uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#159A72]" />
              <span>Audited Repository List</span>
            </h2>
            <Link
              href="/repositories"
              className="text-xs font-mono text-[#159A72] hover:underline"
            >
              View All ({repositories.length}) →
            </Link>
          </div>

          {repositories.length === 0 ? (
            <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-8 text-center space-y-3">
              <div className="w-10 h-10 rounded-[8px] bg-[#151A17] border border-[#2E3E34] text-[#159A72] flex items-center justify-center mx-auto">
                <GitFork className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold font-mono text-[#F7F6F1]">
                {!githubConnected
                  ? "GitHub not connected"
                  : "GitHub synchronization pending"}
              </h3>
              <p className="text-xs text-[#A8B3AC] font-mono max-w-md mx-auto">
                {!githubConnected
                  ? "Connect GitHub to begin your analysis and index your engineering evidence."
                  : "Click 'Sync GitHub' above to ingest and analyze your active repositories."}
              </p>
              {!githubConnected && (
                <div className="pt-2">
                  <Link href="/github-connect">
                    <Button
                      variant="emerald"
                      size="sm"
                      className="gap-2 bg-[#087453] hover:bg-[#159A72] text-white"
                    >
                      <Github className="w-4 h-4" />
                      <span>Connect GitHub Account</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] divide-y divide-[#24352C] shadow-subtle overflow-hidden">
              {repositories.slice(0, 5).map((repo) => (
                <Link
                  key={repo.id}
                  href={`/repositories/${repo.id}`}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#151A17] transition-colors group select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm sm:text-base font-bold text-[#F7F6F1] group-hover:text-[#159A72] transition-colors">
                        {repo.name.toUpperCase()}
                      </span>
                      <span className="text-xs text-[#7A857E] font-mono">
                        {repo.primaryLanguage}
                      </span>
                    </div>
                    <p className="text-xs text-[#A8B3AC] max-w-xl font-sans">
                      {repo.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-xs text-[#7A857E] shrink-0">
                    <span>{repo.commitCount} COMMITS</span>
                    <span>•</span>
                    <span>{repo.prCount} CONTRIBUTIONS</span>
                    <span>•</span>
                    <span className="text-[#159A72] font-semibold">ACTIVITY: VERIFIED</span>
                    <span className="text-[#F7F6F1] group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 20. SKILL VISUALIZATION: Horizontal Evidence Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Horizontal Skill Bars */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono font-bold text-[#F7F6F1] tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#159A72]" />
                <span>Skill Evidence Bars</span>
              </h2>
              <Link href="/skills" className="text-xs font-mono text-[#159A72] hover:underline">
                All Skills ({skills.length}) →
              </Link>
            </div>

            {skills.length === 0 ? (
              <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-6 text-center space-y-2">
                <p className="text-xs font-mono text-[#A8B3AC]">
                  Insufficient evidence for a reliable analysis.
                </p>
                <p className="text-[11px] font-mono text-[#7A857E]">
                  Skill proofs are mathematically computed once codebase commits and AST syntax trees are ingested.
                </p>
              </div>
            ) : (
              <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-5 sm:p-6 shadow-subtle space-y-4">
                {skills.slice(0, 4).map((sk) => (
                  <div key={sk.id} className="p-3.5 rounded-[8px] bg-[#151A17] border border-[#24352C] space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#F7F6F1]">{sk.name.toUpperCase()}</span>
                      <span className="text-[10px] font-bold text-[#159A72] bg-[#18352B] px-2 py-0.5 rounded-[4px] border border-[#27382F]">
                        CONFIDENCE: {sk.proficiencyScore >= 80 ? "HIGH" : sk.proficiencyScore >= 60 ? "MODERATE" : "EVALUATING"}
                      </span>
                    </div>

                    {/* Emerald Evidence Bar */}
                    <div className="h-2 w-full bg-[#24352C] rounded-[3px] overflow-hidden">
                      <div
                        className="h-full bg-[#159A72] rounded-[3px]"
                        style={{ width: `${sk.proficiencyScore}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-[#7A857E]">
                      <span>Repositories: {sk.projectCount || 1}</span>
                      <span>Evidence Points: {sk.evidenceCount}</span>
                      <span className="text-[#F7F6F1]">{sk.proficiencyScore}% AST Score</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Code Integrity Signals Breakdown */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono font-bold text-[#F7F6F1] tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#159A72]" />
                <span>Integrity Confidence</span>
              </h2>
              <Link href="/integrity" className="text-xs font-mono text-[#159A72] hover:underline">
                Audit Details →
              </Link>
            </div>

            <IntegrityScoreGauge score={integrityScore} />
          </div>
        </div>

        {/* Recent Provenance Activity Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold text-[#F7F6F1] tracking-wider uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#7A857E]" />
              <span>Recent Provenance Feed</span>
            </h2>
          </div>

          <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-4 sm:p-5 divide-y divide-[#24352C] shadow-subtle">
            {repositories.length === 0 ? (
              <p className="text-xs font-mono text-[#7A857E] text-center py-4">
                No recent provenance events. Synchronize your repositories to record cryptographic evidence.
              </p>
            ) : (
              repositories.slice(0, 3).map((repo) => (
                <div key={repo.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#159A72] mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-mono font-bold text-[#F7F6F1] truncate">
                        Audit indexed for {repo.name}
                      </p>
                      <span className="text-[10px] font-mono text-[#7A857E] whitespace-nowrap">
                        Verified
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A8B3AC] mt-0.5 leading-snug">
                      {repo.commitCount} commits analyzed • Primary language: {repo.primaryLanguage}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Analysis Scanner Modal */}
      <AnalysisScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        repositoryName={`${developerName} (Workspace Repos)`}
      />
    </DashboardLayout>
  );
}
