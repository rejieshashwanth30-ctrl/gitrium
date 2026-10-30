"use client";

import React from "react";
import { StructuredAIInsights } from "@/lib/intelligence/aiLayer";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  Compass,
} from "lucide-react";
import Link from "next/link";

interface AiInterpretationSectionProps {
  insights: StructuredAIInsights | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  compact?: boolean;
}

export function AiInterpretationSection({
  insights,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
  compact = false,
}: AiInterpretationSectionProps) {
  if (isLoading) {
    return (
      <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-6 text-[#F7F6F1] shadow-subtle animate-pulse space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-[#24352C]" />
          <div className="h-4 w-48 bg-[#24352C] rounded" />
        </div>
        <div className="h-16 bg-[#151A17] rounded-[8px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 bg-[#151A17] rounded-[8px]" />
          <div className="h-28 bg-[#151A17] rounded-[8px]" />
          <div className="h-28 bg-[#151A17] rounded-[8px]" />
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-6 text-[#F7F6F1] shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#159A72] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#159A72]" />
            <span>AI Insights</span>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="text-xs font-mono text-[#A8B3AC] hover:text-[#F7F6F1] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Generate Insights
            </button>
          )}
        </div>
        <p className="text-xs font-mono text-[#7A857E]">
          Gitrium has not generated insights yet. Connect your GitHub account to review your projects and skills.
        </p>
      </div>
    );
  }

  const {
    summary,
    strengths,
    emergingSkills,
    developmentAreas,
    recommendedNextSteps,
    careerSignals,
    evidenceTraceabilityKey,
    evidenceBasis,
    generatedAt,
  } = insights;

  return (
    <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-6 sm:p-7 text-[#F7F6F1] shadow-subtle space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#24352C]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#18352B] border border-[#27382F] text-[10px] font-mono font-bold text-[#159A72] uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#159A72]" />
              AI Insights
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#151A17] border border-[#24352C] text-[10px] font-mono text-[#A8B3AC]">
              Based on GitHub Evidence
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold font-mono text-[#F7F6F1] tracking-tight">
            WHAT YOUR WORK SHOWS
          </h2>
          <p className="text-xs text-[#A8B3AC] font-sans">
            Gitrium looks at your GitHub activity and explains what your work may indicate about your skills, strengths, growth areas, and career direction.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#2E3E34] bg-[#151A17] hover:bg-[#24352C] text-xs font-mono text-[#F7F6F1] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#159A72]" : ""}`} />
              <span>{isRefreshing ? "Updating..." : "Update Insights"}</span>
            </button>
          )}
          <Link
            href="/analysis"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[6px] border border-[#27382F] bg-[#18352B] text-xs font-mono text-[#159A72] hover:bg-[#1f4336] transition-colors"
          >
            <span>Project Analysis</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Executive Summary Block */}
      <div className="p-4 sm:p-5 rounded-[8px] bg-[#151A17] border-l-2 border-[#159A72] border-y border-r border-[#24352C] space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#7A857E]">
          <span className="uppercase tracking-wider font-bold text-[#159A72]">
            Gitrium studied your GitHub activity. Here&apos;s what stands out:
          </span>
          <span>{new Date(generatedAt).toLocaleDateString()}</span>
        </div>
        <p className="text-xs sm:text-sm text-[#F7F6F1] leading-relaxed font-sans">
          {summary}
        </p>
      </div>

      {/* Primary 3-Column Structured Interpretations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Your Strengths */}
        <div className="p-4 rounded-[8px] bg-[#151A17] border border-[#24352C] space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#159A72] uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-[#159A72] shrink-0" />
            <span>Your Strengths</span>
          </div>
          <div className="space-y-3">
            {strengths.slice(0, 3).map((item, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-xs font-bold text-[#F7F6F1]">
                  {item.title}
                </p>
                <p className="text-[11px] text-[#A8B3AC] leading-snug font-sans">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Skills You're Building & Career Direction */}
        <div className="p-4 rounded-[8px] bg-[#151A17] border border-[#24352C] space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#D97745] uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-[#D97745] shrink-0" />
            <span>Skills You&apos;re Building</span>
          </div>
          <div className="space-y-3">
            {emergingSkills.slice(0, 2).map((item, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-xs font-bold text-[#F7F6F1]">
                  {item.skill}
                </p>
                <p className="text-[11px] text-[#A8B3AC] leading-snug font-sans">
                  {item.explanation}
                </p>
              </div>
            ))}
            {careerSignals.slice(0, 1).map((signal, idx) => (
              <div key={`career-${idx}`} className="pt-2 border-t border-[#24352C] space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#7A857E] uppercase">
                  <Compass className="w-3 h-3 text-[#159A72]" />
                  <span>Career Direction:</span>
                </div>
                <p className="text-xs font-bold text-[#F7F6F1]">
                  {signal.role}
                </p>
                <p className="text-[11px] text-[#A8B3AC] leading-snug font-sans">
                  {signal.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: What You Could Improve & Next Step */}
        <div className="p-4 rounded-[8px] bg-[#151A17] border border-[#24352C] space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#A8B3AC] uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-[#159A72] shrink-0" />
            <span>What You Could Improve</span>
          </div>
          <div className="space-y-3">
            {developmentAreas.slice(0, 1).map((area, idx) => (
              <div key={`dev-${idx}`} className="space-y-1">
                <p className="text-xs font-bold text-[#F7F6F1]">
                  {area.title}
                </p>
                <p className="text-[11px] text-[#A8B3AC] leading-snug font-sans">
                  {area.explanation}
                </p>
              </div>
            ))}
            {recommendedNextSteps.slice(0, 1).map((item, idx) => (
              <div key={`step-${idx}`} className="pt-2 border-t border-[#24352C] space-y-1">
                <span className="text-[10px] font-mono text-[#7A857E] uppercase block">
                  Recommended Next Step:
                </span>
                <p className="text-xs font-bold text-[#F7F6F1]">
                  {item.title}
                </p>
                <p className="text-[11px] text-[#A8B3AC] leading-snug font-sans">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Basis Footer */}
      <div className="pt-3 border-t border-[#24352C] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono text-[#7A857E]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[#A8B3AC]">
            Based on: {evidenceBasis.repositoriesCount} projects · {evidenceBasis.commitsCount} commits · {evidenceBasis.technologiesCount} technologies · {evidenceBasis.skillsCount} skills
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#7A857E]">
          <span>Based on code &amp; project files in your repositories</span>
          {evidenceTraceabilityKey && (
            <span className="text-[#159A72] bg-[#151A17] px-1.5 py-0.5 rounded border border-[#24352C]">
              {evidenceTraceabilityKey.slice(0, 8)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
