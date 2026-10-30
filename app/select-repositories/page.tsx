"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GitriumLogo } from "@/components/logo/GitriumLogo";
import { Button } from "@/components/ui/Button";
import { AnalysisScannerModal } from "@/components/analysis/AnalysisScannerModal";
import { gitriumApi } from "@/lib/services/gitriumApiService";
import { Repository } from "@/types";
import {
  Search,
  CheckSquare,
  Square,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FolderGit2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function SelectRepositoriesPage() {
  const router = useRouter();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const loadRepositories = async () => {
    setIsLoading(true);
    try {
      const repos = await gitriumApi.getRepositories();
      if (Array.isArray(repos) && repos.length > 0) {
        setRepositories(repos);
        setSelectedIds(repos.map((r) => r.id));
      } else {
        // Automatically attempt an initial sync if no repositories are indexed yet
        setIsSyncing(true);
        try {
          const syncRes = await gitriumApi.triggerGitHubSync();
          if (!syncRes.success) {
            setSyncFeedback(syncRes.message);
            if (syncRes.status === "TOKEN_EXPIRED") {
              setIsTokenExpired(true);
            }
          }
          const syncedRepos = await gitriumApi.getRepositories();
          if (Array.isArray(syncedRepos) && syncedRepos.length > 0) {
            setRepositories(syncedRepos);
            setSelectedIds(syncedRepos.map((r) => r.id));
          }
        } catch {
          // If sync encounters rate limit or no token, keep empty
        } finally {
          setIsSyncing(false);
        }
      }
    } catch (err) {
      console.warn("Failed to load repositories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRepositories();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const syncRes = await gitriumApi.triggerGitHubSync();
      if (!syncRes.success) {
        setSyncFeedback(syncRes.message);
        if (syncRes.status === "TOKEN_EXPIRED") {
          setIsTokenExpired(true);
        }
      }
      const repos = await gitriumApi.getRepositories();
      if (Array.isArray(repos)) {
        setRepositories(repos);
        setSelectedIds(repos.map((r) => r.id));
      }
    } catch (err: any) {
      setSyncFeedback(err?.message || "Sync failed. Please check network connection.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Derive unique languages
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    repositories.forEach((r) => {
      if (r.primaryLanguage) langs.add(r.primaryLanguage);
    });
    return Array.from(langs);
  }, [repositories]);

  const filteredRepos = useMemo(() => {
    return repositories.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.description || "").toLowerCase().includes(search.toLowerCase());
      const matchLang =
        selectedLanguage === "All" || r.primaryLanguage === selectedLanguage;
      return matchSearch && matchLang;
    });
  }, [repositories, search, selectedLanguage]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRepos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRepos.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleAnalyzeSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      await gitriumApi.selectRepositories(selectedIds);
    } catch (e) {
      console.warn("Selection persistence error:", e);
    }
    setIsScannerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F1] text-[#17201B] flex flex-col justify-start py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto w-full mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DDE1DC]">
        <GitriumLogo variant="horizontal" size="md" textColor="dark" />

        <div className="flex items-center gap-3 font-mono">
          <Button
            variant="outline"
            size="md"
            onClick={handleManualSync}
            isLoading={isSyncing}
            className="gap-2 border-[#DDE1DC] text-[#17201B] hover:bg-[#EFEEE8]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>Sync Repositories</span>
          </Button>

          <span className="text-xs text-[#159A72] font-semibold">
            {selectedIds.length} of {repositories.length} Repositories Selected
          </span>
          <Button
            variant="emerald"
            size="md"
            disabled={selectedIds.length === 0}
            onClick={handleAnalyzeSelected}
            className="gap-2 bg-[#087453] hover:bg-[#159A72] text-white"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Analyze Selected ({selectedIds.length})</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </Button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#17201B] tracking-tight uppercase">
            Select Repositories for Evidence Audit
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#56635C]">
            Gitrium will parse commit trees, identify core frameworks, and compile verified skill nodes.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-[11px] border border-[#DDE1DC] bg-white shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#7A857E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-[6px] bg-[#F7F6F1] border border-[#DDE1DC] text-xs text-[#17201B] placeholder-[#7A857E] focus:outline-none focus:border-[#159A72]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={toggleSelectAll}
              className="text-xs text-[#159A72] hover:underline font-semibold flex items-center gap-1.5"
            >
              {selectedIds.length === filteredRepos.length ? (
                <>
                  <CheckSquare className="w-4 h-4" />
                  <span>Deselect All</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4" />
                  <span>Select All ({filteredRepos.length})</span>
                </>
              )}
            </button>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-[#F7F6F1] border border-[#DDE1DC] text-xs text-[#17201B] rounded-[6px] px-3 py-2 focus:outline-none focus:border-[#159A72]"
            >
              <option value="All">All Ecosystems</option>
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center rounded-[11px] border border-[#DDE1DC] bg-white font-mono text-xs text-[#7A857E] space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#159A72]" />
            <p>Scanning GitHub code evidence vault...</p>
          </div>
        )}

        {/* Feedback Banner */}
        {syncFeedback && (
          <div className="p-3.5 rounded-[8px] bg-[#FAF0ED] border border-[#F3E3D8] text-xs font-mono text-[#D97745] flex items-center justify-between">
            <span>{syncFeedback}</span>
            <button
              onClick={() => setSyncFeedback(null)}
              className="text-[#7A857E] hover:text-[#17201B] ml-2 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredRepos.length === 0 && (
          <div className="p-12 text-center rounded-[11px] border border-[#DDE1DC] bg-white font-mono text-xs text-[#7A857E] space-y-3">
            <FolderGit2 className="w-8 h-8 mx-auto text-[#7A857E]" />
            <p className="font-bold text-[#17201B]">
              {isTokenExpired ? "GitHub Authorization Expired" : "No repositories found."}
            </p>
            <p className="text-[11px] max-w-sm mx-auto">
              {isTokenExpired
                ? "Your GitHub access token is no longer active. Reconnect your GitHub account to authorize repository ingestion."
                : "Ensure your GitHub account is authorized and contains public or accessible repositories."}
            </p>
            {isTokenExpired ? (
              <Link href="/github-connect">
                <Button variant="emerald" size="sm" className="mt-2 text-xs bg-[#087453] hover:bg-[#159A72] text-white">
                  Reconnect GitHub
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSync}
                isLoading={isSyncing}
                className="mt-2 text-xs"
              >
                Sync Now
              </Button>
            )}
          </div>
        )}

        {/* Repositories List */}
        {!isLoading && filteredRepos.length > 0 && (
          <div className="space-y-2.5">
            {filteredRepos.map((repo) => {
              const isSelected = selectedIds.includes(repo.id);

              return (
                <div
                  key={repo.id}
                  onClick={() => toggleSelectOne(repo.id)}
                  className={`p-4 rounded-[11px] border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isSelected
                      ? "border-[#159A72] bg-[#FFFFFF] shadow-subtle"
                      : "border-[#DDE1DC] bg-[#FFFFFF] opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectOne(repo.id);
                      }}
                      className="mt-0.5 sm:mt-0 text-[#159A72] focus:outline-none"
                      aria-label={`Select repository ${repo.name}`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-[#159A72]" />
                      ) : (
                        <Square className="w-5 h-5 text-[#7A857E]" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-sm font-bold text-[#17201B]">{repo.name}</span>
                        {repo.primaryLanguage && (
                          <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-[#F7F6F1] text-[#56635C] border border-[#DDE1DC]">
                            {repo.primaryLanguage}
                          </span>
                        )}
                        {repo.isPrivate && (
                          <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-[#FAF0ED] text-[#D97745] border border-[#F3E3D8]">
                            Private
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#56635C] mt-0.5">
                        {repo.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#7A857E] font-mono shrink-0 self-end sm:self-center">
                    <span>{repo.commitCount || 0} commits</span>
                    <span>•</span>
                    <span>{repo.prCount || 0} PRs</span>
                    <span>•</span>
                    <span>{formatDate(repo.lastActivity || repo.createdAt || new Date())}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnalysisScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        repositoryName={
          selectedIds.length === 1
            ? repositories.find((r) => r.id === selectedIds[0])?.name || "Repository"
            : `${selectedIds.length} Selected Repositories`
        }
        repositoryId={selectedIds.length === 1 ? selectedIds[0] : undefined}
        repositoryIds={selectedIds}
      />
    </div>
  );
}
