"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ContributionHeatmap } from "@/components/charts/ContributionHeatmap";
import { gitriumApi, ContributionData } from "@/lib/services/gitriumApiService";
import {
  GitCommit,
  Layers,
  Clock,
  Loader2,
  GitFork,
  ArrowRight,
} from "lucide-react";

export default function ContributionsPage() {
  const [data, setData] = useState<ContributionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await gitriumApi.getContributions();
        if (res) {
          setData(res);
        }
      } catch (err) {
        console.warn("Contributions page data fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalCommits = data?.totalCommits || 0;
  const totalPRs = data?.totalPRs || 0;
  const currentStreak = data?.currentStreak || 0;
  const distribution = data?.distribution || [];
  const repositoriesCount = data?.repositoriesCount || 0;

  return (
    <DashboardLayout>
      <div className="space-y-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#24352C]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#18352B] border border-[#27382F] text-[#159A72] text-xs font-mono font-semibold mb-2">
              <GitCommit className="w-3.5 h-3.5" />
              <span>TEMPORAL ACTIVITY METRICS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#F7F6F1] tracking-tight uppercase">
              Contribution Intelligence
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#A8B3AC] font-mono">
              Audit the rhythm, cadence, and distribution of your code across {repositoriesCount} connected repositories.
            </p>
          </div>
        </div>

        {/* Contribution Heatmap */}
        <ContributionHeatmap />

        {/* KPI Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 font-mono">
          <div className="p-5 rounded-[11px] border border-[#27382F] bg-[#18201C] text-left shadow-subtle flex flex-col justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#F7F6F1] tracking-tight">{totalCommits}</div>
              <div className="text-xs font-medium text-[#A8B3AC] mt-1">Commits Recorded</div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#24352C]">
              <span className="text-[10px] text-[#159A72] font-medium px-2 py-0.5 rounded-[4px] bg-[#18352B] border border-[#27382F]">
                100% DAG Verified
              </span>
            </div>
          </div>

          <div className="p-5 rounded-[11px] border border-[#27382F] bg-[#18201C] text-left shadow-subtle flex flex-col justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#F7F6F1] tracking-tight">{totalPRs}</div>
              <div className="text-xs font-medium text-[#A8B3AC] mt-1">Pull Requests</div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#24352C]">
              <span className="text-[10px] text-[#159A72] font-medium px-2 py-0.5 rounded-[4px] bg-[#18352B] border border-[#27382F]">
                Feature Branches
              </span>
            </div>
          </div>

          <div className="p-5 rounded-[11px] border border-[#27382F] bg-[#18201C] text-left shadow-subtle flex flex-col justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#D97745] tracking-tight">{currentStreak} Days</div>
              <div className="text-xs font-medium text-[#A8B3AC] mt-1">Active Streak</div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#24352C]">
              <span className="text-[10px] text-[#7A857E] font-medium">Verified Continuity</span>
            </div>
          </div>

          <div className="p-5 rounded-[11px] border border-[#27382F] bg-[#18201C] text-left shadow-subtle flex flex-col justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#159A72] tracking-tight">{repositoriesCount}</div>
              <div className="text-xs font-medium text-[#A8B3AC] mt-1">Repositories Audited</div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#24352C]">
              <span className="text-[10px] text-[#A8B3AC] font-medium px-2 py-0.5 rounded-[4px] bg-[#151A17] border border-[#24352C]">
                Active Scope
              </span>
            </div>
          </div>
        </div>

        {/* Repository Distribution */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#F7F6F1] flex items-center gap-2 uppercase font-mono">
            <Layers className="w-4 h-4 text-[#159A72]" />
            <span>Contribution Distribution</span>
          </h3>

          <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-5 space-y-3.5 shadow-subtle font-mono">
            {isLoading ? (
              <div className="flex items-center justify-center py-6 text-xs text-[#7A857E] gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#159A72]" />
                <span>Calculating repository distribution...</span>
              </div>
            ) : distribution.length === 0 ? (
              <p className="text-xs text-[#7A857E] text-center py-4">
                No contribution distribution available. Synchronize repositories to index commits.
              </p>
            ) : (
              distribution.map((repo) => (
                <div key={repo.id} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/repositories/${repo.id}`}
                      className="font-bold text-[#F7F6F1] hover:text-[#159A72] transition-colors truncate max-w-xs"
                    >
                      {repo.name}
                    </Link>
                    <span className="text-[#7A857E]">
                      {repo.commitCount} commits ({repo.percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#24352C] rounded-[3px] overflow-hidden">
                    <div
                      className="h-full bg-[#159A72] rounded-[3px]"
                      style={{ width: `${Math.max(repo.percentage, 2)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
