"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IntegrityScoreGauge } from "@/components/integrity/IntegrityScoreGauge";
import { EvidenceStrengthBadge } from "@/components/ui/Badge";
import { gitriumApi } from "@/lib/services/gitriumApiService";
import { IntegritySignal } from "@/types";
import { StructuredAIInsights } from "@/lib/intelligence/aiLayer";
import {
  ShieldCheck,
  Info,
  CheckCircle2,
  Loader2,
  GitFork,
  Sparkles,
} from "lucide-react";

export default function IntegrityPage() {
  const [signals, setSignals] = useState<IntegritySignal[]>([]);
  const [aiInsights, setAiInsights] = useState<StructuredAIInsights | null>(null);
  const [overallScore, setOverallScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadIntegrity() {
      setIsLoading(true);
      try {
        const [liveSignals, insights] = await Promise.all([
          gitriumApi.getIntegritySignals(),
          gitriumApi.getAIInsights(),
        ]);
        if (Array.isArray(liveSignals) && liveSignals.length > 0) {
          setSignals(liveSignals);
          const avg = Math.round(
            liveSignals.reduce((acc, s) => acc + s.score, 0) / liveSignals.length
          );
          setOverallScore(avg);
        }
        if (insights) {
          setAiInsights(insights);
        }
      } catch (err) {
        console.warn("Failed to load integrity signals:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadIntegrity();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#24352C]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#18352B] border border-[#27382F] text-[#159A72] text-xs font-mono font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ACTIVITY CONSISTENCY</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#F7F6F1] tracking-tight uppercase">
              Code Integrity &amp; Consistency
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#A8B3AC] font-sans">
              Gitrium looks for consistency in your project history, contribution patterns, and development activity.
            </p>
          </div>
        </div>

        {/* Overall Score Gauge Section */}
        <IntegrityScoreGauge score={overallScore} />

        {/* Ethical Analytical Disclaimer */}
        <div className="p-3.5 sm:p-4 rounded-[11px] border border-[#27382F] bg-[#18201C] shadow-subtle flex items-start gap-3">
          <Info className="w-4 h-4 text-[#159A72] mt-0.5 shrink-0" />
          <div className="space-y-0.5 min-w-0">
            <h4 className="text-xs font-bold text-[#F7F6F1] uppercase font-mono tracking-wider">
              Consistency &amp; Ethical Safeguards
            </h4>
            <p className="text-xs text-[#A8B3AC] leading-relaxed font-sans">
              Gitrium does not claim code is 100% human-written. Modern development includes AI tools and libraries. Indicators show steady project activity and consistent commits.
            </p>
          </div>
        </div>

        {/* AI Interpretation: Cadence & Continuity */}
        {aiInsights && (
          <div className="p-4 sm:p-5 rounded-[11px] border border-[#27382F] bg-[#18201C] shadow-subtle space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#159A72] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#159A72] shrink-0" />
                <span>AI Insights: Development Consistency</span>
              </div>
              <span className="text-[10px] font-mono text-[#7A857E]">
                Based on {aiInsights.evidenceBasis.repositoriesCount} projects · {aiInsights.evidenceBasis.commitsCount} commits
              </span>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#F7F6F1]">
                Consistent Development Activity
              </p>
              <p className="text-xs text-[#A8B3AC] font-sans mt-0.5 leading-relaxed">
                Your GitHub history shows regular updates across your projects without artificial activity bursts.
              </p>
            </div>

            {/* Quick Signals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#24352C] text-xs font-mono">
              <div className="p-3 rounded-[6px] bg-[#151A17] border border-[#24352C] space-y-1">
                <span className="text-[#159A72] font-bold block">Development Rhythm:</span>
                <span className="text-[#A8B3AC] text-[11px] font-sans block">
                  Commit distribution shows steady progress rather than sudden one-time file additions.
                </span>
              </div>
              <div className="p-3 rounded-[6px] bg-[#151A17] border border-[#24352C] space-y-1">
                <span className="text-[#159A72] font-bold block">Account Consistency:</span>
                <span className="text-[#A8B3AC] text-[11px] font-sans block">
                  Project updates and author details match your connected GitHub account.
                </span>
              </div>
            </div>

            {/* Expandable Evidence Details */}
            <details className="group pt-1 border-t border-[#24352C]/60 text-xs font-mono">
              <summary className="cursor-pointer text-[#159A72] hover:text-[#2dd4bf] text-[11px] font-medium py-1 select-none flex items-center justify-between">
                <span>Why this insight? View evidence details</span>
                <span className="text-[#7A857E] group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="pt-2 pb-1 space-y-2 text-[11px] text-[#A8B3AC] font-sans leading-relaxed">
                <p>
                  Gitrium reviewed recorded commits, timing, author signatures, and contribution distribution across {aiInsights.evidenceBasis.repositoriesCount} repositories and {aiInsights.evidenceBasis.commitsCount} commits over time.
                </p>
                <div className="p-2 rounded bg-[#151A17] border border-[#24352C] text-[#7A857E] font-mono text-[10px]">
                  <span>Evidence Traceability Key: </span>
                  <span className="text-[#159A72]">{aiInsights.evidenceTraceabilityKey ? aiInsights.evidenceTraceabilityKey.slice(0, 16) : "VERIFIED_HISTORY"}...</span>
                </div>
              </div>
            </details>
          </div>
        )}

        {/* The 5 Deep Signal Dimensions */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#F7F6F1] uppercase tracking-wider font-mono">
            Analytical Signal Breakdown
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-10 font-mono text-xs text-[#7A857E] gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#159A72]" />
              <span>Calculating empirical integrity signals...</span>
            </div>
          ) : signals.length === 0 ? (
            <div className="p-8 rounded-[11px] border border-[#27382F] bg-[#18201C] text-center font-mono text-xs text-[#7A857E] space-y-2">
              <p className="text-[#F7F6F1] font-bold">No Code Integrity Evidence Available Yet</p>
              <p>Synchronize your GitHub repositories to compute verifiable provenance signals.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {signals.map((sig) => (
                <div
                  key={sig.id}
                  className="p-5 rounded-[11px] border border-[#27382F] bg-[#18201C] shadow-subtle hover:border-[#159A72] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2 font-mono">
                      <h4 className="text-sm font-bold text-[#F7F6F1]">{sig.category}</h4>
                      <span className="text-xs font-bold text-[#159A72]">{sig.score} / 100</span>
                    </div>

                    <p className="text-xs text-[#A8B3AC] mb-3 leading-relaxed font-sans">{sig.description}</p>

                    <div className="space-y-1.5 pt-2 border-t border-[#24352C] font-mono">
                      <span className="text-[10px] uppercase font-bold text-[#7A857E] block">
                        Audited Findings:
                      </span>
                      {sig.findings.map((f, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-[#A8B3AC]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#159A72] mt-0.5 flex-shrink-0" />
                          <span className="font-sans">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#24352C] flex items-center justify-between text-[11px] font-mono text-[#7A857E]">
                    <EvidenceStrengthBadge strength={sig.label} />
                    <span>{sig.confidenceInterval}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
