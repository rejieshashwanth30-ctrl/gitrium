"use client";

import React from "react";
import { Info, FolderGit2, GitCommit, TrendingUp, CheckCircle2, FileText } from "lucide-react";
import { EvidenceStrengthBadge } from "@/components/ui/Badge";
import { IntegritySignal, EvidenceStrength } from "@/types";

interface IntegrityScoreGaugeProps {
  score?: number;
  signals?: IntegritySignal[];
  showDetails?: boolean;
  className?: string;
}

const DEFAULT_DIMENSIONS = [
  { name: "Repository Consistency", icon: FolderGit2, key: "repo", weight: 0.98 },
  { name: "Commit Consistency", icon: GitCommit, key: "commit", weight: 1.0 },
  { name: "Project Evolution", icon: TrendingUp, key: "evolution", weight: 0.94 },
  { name: "Testing Evidence", icon: CheckCircle2, key: "testing", weight: 0.82 },
  { name: "Documentation Rigor", icon: FileText, key: "doc", weight: 0.9 },
];

export function IntegrityScoreGauge({
  score = 88,
  signals = [],
  showDetails = true,
  className = "",
}: IntegrityScoreGaugeProps) {
  // SVG gauge constants
  const size = 150;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const strength: EvidenceStrength =
    score >= 80 ? "Strong Evidence" : score >= 50 ? "Moderate Evidence" : "Limited Evidence";

  const dimensionData =
    signals.length > 0
      ? signals.map((s, idx) => ({
          name: s.name || s.category,
          score: s.score,
          icon: DEFAULT_DIMENSIONS[idx % DEFAULT_DIMENSIONS.length].icon,
        }))
      : DEFAULT_DIMENSIONS.map((d) => ({
          name: d.name,
          score: Math.min(100, Math.max(30, Math.round(score * d.weight))),
          icon: d.icon,
        }));

  return (
    <div
      className={`w-full rounded-[11px] border border-[#27382F] bg-[#18201C] p-5 sm:p-6 text-[#F7F6F1] shadow-subtle ${className}`}
    >
      <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 justify-between">
        {/* Radial Circular Gauge */}
        <div className="flex flex-col items-center text-center shrink-0">
          <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
              <defs>
                <linearGradient id="gaugeGradEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#087453" />
                  <stop offset="50%" stopColor="#159A72" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
              </defs>
              {/* Background Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#24352C"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Dynamic Progress Stroke */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="url(#gaugeGradEmerald)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Inner Score Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none font-mono">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#F7F6F1] tracking-tight">
                {score}
              </span>
              <span className="text-xs text-[#7A857E] font-medium">/ 100</span>
            </div>
          </div>

          <div className="mt-3">
            <EvidenceStrengthBadge strength={strength} />
          </div>
        </div>

        {/* Signals Breakdown Bars */}
        {showDetails && (
          <div className="flex-1 w-full space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-[#24352C]">
              <h4 className="text-xs font-bold text-[#F7F6F1] uppercase tracking-wider">
                Integrity Signal Dimensions
              </h4>
              <span className="text-[11px] text-[#7A857E]">Deterministic Evidence</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {dimensionData.map((dim, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#A8B3AC] flex items-center gap-1.5 font-sans">
                      <dim.icon className="w-3.5 h-3.5 text-[#159A72]" />
                      <span>{dim.name}</span>
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        dim.score >= 80 ? "text-[#159A72]" : dim.score >= 50 ? "text-[#D97745]" : "text-[#7A857E]"
                      }`}
                    >
                      {dim.score} / 100
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#24352C] rounded-[3px] overflow-hidden">
                    <div
                      className={`h-full rounded-[3px] transition-all duration-500 ${
                        dim.score >= 80 ? "bg-[#159A72]" : dim.score >= 50 ? "bg-[#D97745]" : "bg-[#7A857E]"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(4, dim.score))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ethical Transparency Notice */}
      <div className="mt-5 pt-3 border-t border-[#24352C] flex items-start gap-2.5 bg-[#151A17] rounded-[7px] p-3 text-[11px] text-[#A8B3AC]">
        <Info className="w-4 h-4 text-[#159A72] shrink-0 mt-0.5" />
        <p className="leading-relaxed font-sans">
          <strong className="text-[#F7F6F1] font-mono">Evidence-Based Integrity Principle:</strong> Gitrium
          scores represent empirical development patterns derived from commit timing, repository evolution, and
          project structure. They describe engineering patterns, not whether code was written by a human or AI.
        </p>
      </div>
    </div>
  );
}
