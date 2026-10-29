"use client";

import React from "react";
import { ShieldCheck, Info } from "lucide-react";
import { EvidenceStrengthBadge } from "@/components/ui/Badge";
import { IntegritySignal } from "@/types";

interface IntegrityScoreGaugeProps {
  score?: number;
  signals?: IntegritySignal[];
  showDetails?: boolean;
}

export function IntegrityScoreGauge({
  score = 88,
  signals = [],
  showDetails = true,
}: IntegrityScoreGaugeProps) {
  // SVG gauge constants
  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="w-full rounded-[11px] border border-[#27382F] bg-[#18201C] p-5 sm:p-6 text-[#F7F6F1] shadow-subtle">
      <div className="flex flex-col lg:flex-row items-center gap-8 justify-between">
        {/* Radial Circular Gauge */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
              <defs>
                <linearGradient id="gaugeGradEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#159A72" />
                  <stop offset="100%" stopColor="#10B981" />
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
                className="transition-all duration-500 ease-out"
              />
            </svg>

            {/* Inner Score Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none font-mono">
              <span className="text-3xl font-extrabold text-[#F7F6F1] tracking-tight">{score}</span>
              <span className="text-xs text-[#7A857E] font-medium">/ 100</span>
              <span className="text-[9px] text-[#159A72] uppercase tracking-widest mt-0.5">Verified</span>
            </div>
          </div>

          <div className="mt-3">
            <EvidenceStrengthBadge strength="Strong Evidence" />
          </div>
        </div>

        {/* Signals Breakdown Bars */}
        <div className="flex-1 w-full space-y-3 font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-[#24352C]">
            <h4 className="text-xs font-bold text-[#F7F6F1] uppercase tracking-wider">
              Integrity Signal Dimensions
            </h4>
            <span className="text-[11px] text-[#7A857E]">Deterministic Audit</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#A8B3AC]">Repository Continuity</span>
                <span className="text-[#159A72] font-bold">92 / 100</span>
              </div>
              <div className="h-1.5 w-full bg-[#24352C] rounded-[3px] overflow-hidden">
                <div className="h-full bg-[#159A72] rounded-[3px]" style={{ width: "92%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#A8B3AC]">Commit Consistency</span>
                <span className="text-[#159A72] font-bold">89 / 100</span>
              </div>
              <div className="h-1.5 w-full bg-[#24352C] rounded-[3px] overflow-hidden">
                <div className="h-full bg-[#159A72] rounded-[3px]" style={{ width: "89%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#A8B3AC]">Project Evolution</span>
                <span className="text-[#159A72] font-bold">86 / 100</span>
              </div>
              <div className="h-1.5 w-full bg-[#24352C] rounded-[3px] overflow-hidden">
                <div className="h-full bg-[#159A72] rounded-[3px]" style={{ width: "86%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#A8B3AC]">Testing Evidence</span>
                <span className="text-[#159A72] font-bold">84 / 100</span>
              </div>
              <div className="h-1.5 w-full bg-[#24352C] rounded-[3px] overflow-hidden">
                <div className="h-full bg-[#159A72] rounded-[3px]" style={{ width: "84%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#A8B3AC]">Documentation Rigor</span>
                <span className="text-[#D97745] font-bold">78 / 100</span>
              </div>
              <div className="h-1.5 w-full bg-[#24352C] rounded-[3px] overflow-hidden">
                <div className="h-full bg-[#D97745] rounded-[3px]" style={{ width: "78%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ethical Transparency Notice */}
      <div className="mt-5 pt-3 border-t border-[#24352C] flex items-start gap-2.5 bg-[#151A17] rounded-[7px] p-3 text-[11px] text-[#A8B3AC]">
        <Info className="w-4 h-4 text-[#159A72] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#F7F6F1]">Analytical Confidence Principle:</strong> Gitrium scores represent empirical
          patterns derived from Git DAG timelines, AST parsing, and authorship continuity. They are verifiable analytical signals
          designed for human context.
        </p>
      </div>
    </div>
  );
}
