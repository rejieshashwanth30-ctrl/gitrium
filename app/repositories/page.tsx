"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { EvidenceStrengthBadge } from "@/components/ui/Badge";
import { gitriumApi } from "@/lib/services/gitriumApiService";
import { Repository } from "@/types";
import {
  GitFork,
  Star,
  Clock,
  Search,
  Plus,
  ArrowRight,
  Github,
  RefreshCw,
} from "lucide-react";
import { AnalysisScannerModal } from "@/components/analysis/AnalysisScannerModal";

export default function RepositoriesPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [githubConnected, setGithubConnected] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [profile, repos] = await Promise.all([
        gitriumApi.getProfile(),
        gitriumApi.getRepositories(),
      ]);
      setGithubConnected(profile?.github?.connectionStatus === "connected");
      if (Array.isArray(repos)) {
        setRepositories(repos);
      }
    } catch (err) {
      console.warn("Repositories fetch error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await gitriumApi.triggerGitHubSync();
      setSyncFeedback(res.message);
      await loadData();
    } catch (err: any) {
      setSyncFeedback(err?.message || "Sync encountered an error.");
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredRepos = useMemo(() => {
    return repositories.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase());
      const matchLang =
        selectedLanguage === "All" || r.primaryLanguage === selectedLanguage;
      return matchSearch && matchLang;
    });
  }, [repositories, search, selectedLanguage]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#24352C]">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#F7F6F1] tracking-tight uppercase">
              Repository Intelligence
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#A8B3AC] font-mono">
              Deterministic AST audits, modularity analysis, and concrete evidence across your codebases
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={handleSync}
              isLoading={isSyncing}
              className="gap-2 border-[#2E3E34] bg-[#151A17] hover:bg-[#24352C] text-[#F7F6F1]"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              <span>Sync GitHub</span>
            </Button>

            <Button
              variant="emerald"
              size="md"
              onClick={() => setIsScannerOpen(true)}
              className="gap-2 bg-[#087453] hover:bg-[#159A72] text-white"
            >
              <Plus className="w-4 h-4" />
              <span>Analyze New Repository</span>
            </Button>
          </div>
        </div>

        {/* Sync feedback notification */}
        {syncFeedback && (
          <div className="p-3.5 rounded-[8px] bg-[#18352B] border border-[#159A72]/40 text-xs font-mono text-[#F7F6F1] flex items-center justify-between">
            <span>{syncFeedback}</span>
            <button
              onClick={() => setSyncFeedback(null)}
              className="text-[#A8B3AC] hover:text-white ml-2 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-[11px] border border-[#27382F] bg-[#18201C] shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#7A857E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by repo name or tech..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-[6px] bg-[#151A17] border border-[#2E3E34] text-xs font-mono text-[#F7F6F1] placeholder-[#7A857E] focus:outline-none focus:border-[#159A72]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-[#151A17] border border-[#2E3E34] text-xs font-mono text-[#A8B3AC] rounded-[6px] px-3 py-2 focus:outline-none focus:border-[#159A72] w-full sm:w-auto"
            >
              <option value="All">All Ecosystems</option>
              <option value="TypeScript">TypeScript</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="Dart">Dart / Flutter</option>
              <option value="Go">Go / Systems</option>
            </select>
          </div>
        </div>

        {/* Repository Grid / Empty State */}
        {repositories.length === 0 ? (
          <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-[8px] bg-[#151A17] border border-[#2E3E34] text-[#159A72] flex items-center justify-center mx-auto">
              <GitFork className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-mono text-[#F7F6F1]">
              {!githubConnected ? "GitHub not connected." : "GitHub synchronization in progress."}
            </h3>
            <p className="text-xs text-[#A8B3AC] font-mono max-w-md mx-auto">
              {!githubConnected
                ? "Connect GitHub to begin your analysis and import your public and private repositories."
                : "Your analysis will appear after synchronization completes. Click 'Sync GitHub' to poll latest commits."}
            </p>
            {!githubConnected && (
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
            )}
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-8 text-center space-y-2">
            <p className="text-sm font-mono text-[#A8B3AC]">No repositories matched your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepos.map((repo) => (
              <div
                key={repo.id}
                className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-5 flex flex-col justify-between hover:border-[#159A72] transition-all group shadow-subtle"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#159A72]" />
                      <h3 className="text-sm font-bold font-mono text-[#F7F6F1] group-hover:text-[#159A72] transition-colors">
                        {repo.name}
                      </h3>
                    </div>
                    <EvidenceStrengthBadge strength={repo.evidenceStrength} />
                  </div>

                  <p className="text-xs text-[#A8B3AC] line-clamp-2 mb-3 leading-relaxed font-sans">
                    {repo.description}
                  </p>

                  {/* Tech Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {repo.technologies.map((t) => (
                      <span
                        key={t.id}
                        className="px-2 py-0.5 rounded-[4px] text-[10px] font-mono bg-[#151A17] text-[#A8B3AC] border border-[#24352C]"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#24352C] text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#7A857E] uppercase block">Complexity</span>
                      <span className="font-bold text-[#F7F6F1]">{repo.complexity}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7A857E] uppercase block">Primary Ecosystem</span>
                      <span className="font-bold text-[#159A72]">{repo.primaryLanguage}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-[#24352C] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#7A857E] flex items-center gap-1">
                    <GitFork className="w-3.5 h-3.5 text-[#159A72]" />
                    {repo.commitCount} commits
                  </span>

                  <Link
                    href={`/repositories/${repo.id}`}
                    className="text-[#159A72] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Inspect Audit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
        repositoryName="New Codebase Audit"
      />
    </DashboardLayout>
  );
}
