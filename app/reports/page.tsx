"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { EvidenceStrengthBadge } from "@/components/ui/Badge";
import { gitriumApi } from "@/lib/services/gitriumApiService";
import { Repository } from "@/types";
import { formatDate } from "@/lib/utils";
import { FileText, ArrowRight, ShieldCheck, GitFork, Loader2, Sparkles } from "lucide-react";
import { AnalysisScannerModal } from "@/components/analysis/AnalysisScannerModal";

export default function ReportsPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    async function loadRepos() {
      setIsLoading(true);
      try {
        const repos = await gitriumApi.getRepositories();
        if (Array.isArray(repos)) {
          setRepositories(repos);
        }
      } catch (e) {
        console.warn("Failed to load repositories for reports:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadRepos();
  }, []);

  const selectedRepos = repositories.filter((r) => r.isSelected);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#24352C]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#18352B] border border-[#27382F] text-[#159A72] text-xs font-mono font-semibold mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>EXPORT-READY AUDITS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#F7F6F1] tracking-tight uppercase">
              Evidence Audit Reports
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#A8B3AC] font-mono">
              Download, print, or share verifiable technical audits derived from your real code evidence.
            </p>
          </div>

          <Button
            variant="emerald"
            size="md"
            onClick={() => setIsScannerOpen(true)}
            className="gap-2 bg-[#087453] hover:bg-[#159A72] text-white"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Comprehensive Audit</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] text-[#F7F6F1] font-mono space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#159A72]" />
            <p className="text-xs text-[#A8B3AC]">Loading evidence reports...</p>
          </div>
        ) : repositories.length === 0 ? (
          <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-10 text-center space-y-4 font-mono text-[#F7F6F1]">
            <GitFork className="w-10 h-10 text-[#7A857E] mx-auto" />
            <h3 className="text-sm font-bold">No Repositories Synchronized</h3>
            <p className="text-xs text-[#A8B3AC] max-w-md mx-auto font-sans">
              Connect your GitHub account and synchronize codebases to generate cryptographic evidence audit reports.
            </p>
            <div className="pt-2">
              <Link href="/github-connect">
                <Button variant="emerald" size="sm" className="bg-[#087453] hover:bg-[#159A72] text-white">
                  Connect GitHub Account
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 font-mono">
            {/* Aggregate Multi-Repository Audit Card */}
            {selectedRepos.length > 1 && (
              <div className="p-5 rounded-[11px] border-2 border-[#159A72]/60 bg-[#182820] shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-[6px] bg-[#159A72]/20 border border-[#159A72] text-[#159A72] flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#F7F6F1]">
                        Comprehensive Multi-Repository Audit ({selectedRepos.length} Codebases)
                      </h3>
                      <EvidenceStrengthBadge strength="Strong Evidence" />
                    </div>
                    <p className="text-xs text-[#A8B3AC] mt-1 max-w-xl font-sans">
                      Combined provenance audit aggregating: {selectedRepos.map((r) => r.name).join(", ")}.
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-[#7A857E] font-mono mt-2">
                      <span>{selectedRepos.reduce((acc, r) => acc + (r.commitCount || 0), 0)} Total Commits</span>
                      <span>•</span>
                      <span>{selectedRepos.length} Repositories In Scope</span>
                      <span>•</span>
                      <span className="text-[#159A72] font-semibold">Active Verified Scope</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link href="/reports/aggregate">
                    <Button variant="emerald" size="sm" className="gap-1.5 bg-[#087453] hover:bg-[#159A72] text-white">
                      <span>View Aggregate Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Individual Repository Reports */}
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="p-5 rounded-[11px] border border-[#27382F] bg-[#18201C] shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#159A72] transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-[6px] bg-[#151A17] border border-[#24352C] text-[#159A72] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#F7F6F1]">{repo.name}</h3>
                      <EvidenceStrengthBadge strength={repo.evidenceStrength} />
                    </div>
                    <p className="text-xs text-[#A8B3AC] mt-1 max-w-xl font-sans">{repo.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-[#7A857E] font-mono mt-2">
                      <span>Ecosystem: {repo.primaryLanguage || "Ecosystem"}</span>
                      <span>•</span>
                      <span>{repo.commitCount} verified commits</span>
                      <span>•</span>
                      <span>Last Activity: {formatDate(repo.lastActivity || repo.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link href={`/reports/${repo.id}`}>
                    <Button variant="emerald" size="sm" className="gap-1.5 bg-[#087453] hover:bg-[#159A72] text-white">
                      <span>View Audit Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnalysisScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        repositoryName={`${selectedRepos.length} Selected Codebases`}
        repositoryIds={selectedRepos.map((r) => r.id)}
      />
    </DashboardLayout>
  );
}
