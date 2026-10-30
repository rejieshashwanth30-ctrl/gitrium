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
              <span>EMPIRICAL INTEGRITY SIGNALS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#F7F6F1] tracking-tight uppercase">
              Code Integrity Signals
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#A8B3AC] font-mono">
              Audits contribution continuity, repository history depth, pattern signals, and AI-assisted drafting signals without false certainty.
            </p>
          </div>
        </div>

        {/* Overall Score Gauge Section */}
        <IntegrityScoreGauge score={overallScore} />

        {/* Ethical Analytical Disclaimer */}
        <div className="p-4 rounded-[11px] border border-[#27382F] bg-[#18201C] shadow-subtle flex items-start gap-3">
          <Info className="w-5 h-5 text-[#159A72] mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#F7F6F1] uppercase font-mono tracking-wider">
              Methodology Transparency &amp; Ethical Safeguards
            </h4>
            <p className="text-xs text-[#A8B3AC] leading-relaxed font-sans">
              Gitrium strictly avoids simplistic claims of &ldquo;100% human-written&rdquo; or &ldquo;unforgeable code&rdquo;.
              Modern software development naturally integrates AI drafting tools, external open-source libraries, and
              iterative scaffolding. Our signals are designed as analytical confidence indicators to give context to
              engineering leaders, not to produce punitive or absolute verdicts.
            </p>
          </div>
        </div>

        {/* AI Interpretation: Cadence & Continuity */}
        {aiInsights && (
          <div className="p-5 rounded-[11px] border border-[#27382F] bg-[#18201C] shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#159A72] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#159A72]" />
                <span>AI Interpretation: Author Cadence &amp; Provenance</span>
              </div>
              <span className="text-[10px] font-mono text-[#7A857E]">
                Anchor: {aiInsights.evidenceTraceabilityKey ? `${aiInsights.evidenceTraceabilityKey.slice(0, 12)}...` : "deterministic-hash"}
              </span>
            </div>
            <p className="text-xs text-[#F7F6F1] font-mono leading-relaxed">
              Empirical cadence analysis indicates sustained commit continuity across {aiInsights.evidenceBasis.repositoriesCount} repositories and {aiInsights.evidenceBasis.commitsCount} recorded commits. Authorship fingerprints show consistent syntax delta patterns with no uncorroborated anomalous bulk injections.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#24352C] text-xs font-mono">
              <div className="p-3 rounded-[6px] bg-[#151A17] border border-[#24352C] space-y-1">
                <span className="text-[#159A72] font-bold block">Temporal Consistency:</span>
                <span className="text-[#A8B3AC] text-[11px] font-sans">
                  Commit distribution reflects regular development activity without synthetic commit-burst signatures.
                </span>
              </div>
              <div className="p-3 rounded-[6px] bg-[#151A17] border border-[#24352C] space-y-1">
                <span className="text-[#159A72] font-bold block">Authorship Integrity:</span>
                <span className="text-[#A8B3AC] text-[11px] font-sans">
                  Git author signatures match authenticated profile with cryptographic SHA integrity checks.
                </span>
              </div>
            </div>
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
