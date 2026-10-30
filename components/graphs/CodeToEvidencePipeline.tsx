"use client";

import React, { useState } from "react";
import {
  FileCode,
  GitCommit,
  Cpu,
  Layers,
  ShieldCheck,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const WORKFLOW_STAGES = [
  {
    id: "code",
    label: "CODE",
    sub: "Source Trees & AST",
    icon: FileCode,
    details:
      "Deterministic syntactic parsing across directory trees, file signatures, and language syntax trees.",
    metric: "42,800 Lines Audited",
  },
  {
    id: "contribution",
    label: "CONTRIBUTION",
    sub: "Commit DAG Lineage",
    icon: GitCommit,
    details:
      "Authorship continuity, diff sizes, merge frequency, and sustained repository activity cadence.",
    metric: "842 Verified Commits",
  },
  {
    id: "technology",
    label: "TECHNOLOGY",
    sub: "Frameworks & Toolchains",
    icon: Cpu,
    details:
      "Package manifests, build systems, configuration scripts, and runtime library dependencies.",
    metric: "27 Tech Stacks Identified",
  },
  {
    id: "skill",
    label: "SKILL",
    sub: "Demonstrated Mastery",
    icon: Layers,
    details:
      "Synthesized technology evidence strength scores backed strictly by production commits and tests.",
    metric: "14 Quantified Skills",
  },
  {
    id: "evidence",
    label: "EVIDENCE",
    sub: "Cryptographic Proof Points",
    icon: ShieldCheck,
    details:
      "Deterministic cross-references, test pass ratios, PR approvals, and cryptographic audit nodes.",
    metric: "918 Evidence Nodes",
  },
  {
    id: "intelligence",
    label: "INTELLIGENCE",
    sub: "Actionable Career Vault",
    icon: BrainCircuit,
    details:
      "Evidence-backed role alignment scores and verifiable developer credentials for employers.",
    metric: "87% Full-Stack Fit",
  },
];

export function CodeToEvidencePipeline() {
  const [activeIdx, setActiveIdx] = useState(4); // Default to Evidence stage

  const currentStage = WORKFLOW_STAGES[activeIdx];

  return (
    <div className="w-full">
      {/* ================================================================== */}
      {/* DESKTOP / TABLET: Horizontal Flow with Thin Dark Line & Emerald Nodes */}
      {/* ================================================================== */}
      <div className="hidden md:block relative py-6">
        {/* Connecting Line */}
        <div className="absolute top-[38px] left-[8%] right-[8%] h-[2px] bg-[#DDE1DC] z-0">
          <div
            className="h-full bg-[#159A72] transition-all duration-300"
            style={{ width: `${(activeIdx / (WORKFLOW_STAGES.length - 1)) * 100}%` }}
          />
        </div>

        {/* 6 Workflow Nodes */}
        <div className="relative z-10 grid grid-cols-6 gap-2 text-center">
          {WORKFLOW_STAGES.map((st, idx) => {
            const Icon = st.icon;
            const isCompleted = idx <= activeIdx;
            const isCurrent = idx === activeIdx;

            return (
              <button
                key={st.id}
                onClick={() => setActiveIdx(idx)}
                className="group flex flex-col items-center focus:outline-none select-none transition-transform active:scale-95"
              >
                {/* Node Circle */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-[8px] flex items-center justify-center transition-all duration-200 border",
                    isCurrent
                      ? "bg-[#151A17] border-[#159A72] text-[#159A72] shadow-sm scale-110"
                      : isCompleted
                      ? "bg-[#DDF4EA] border-[#159A72] text-[#087453]"
                      : "bg-[#FFFFFF] border-[#DDE1DC] text-[#7A857E] group-hover:border-[#A8B3AC]"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Node Label */}
                <div className="mt-3">
                  <span
                    className={cn(
                      "text-xs font-mono font-bold tracking-wider block transition-colors",
                      isCurrent
                        ? "text-[#151A17]"
                        : isCompleted
                        ? "text-[#18352B]"
                        : "text-[#7A857E]"
                    )}
                  >
                    {st.label}
                  </span>
                  <span className="text-[10px] text-[#7A857E] font-mono block mt-0.5">
                    {st.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================================== */}
      {/* MOBILE: Clean Vertical Process Flow                                */}
      {/* ================================================================== */}
      <div className="md:hidden space-y-2 py-4">
        {WORKFLOW_STAGES.map((st, idx) => {
          const Icon = st.icon;
          const isCompleted = idx <= activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <button
              key={st.id}
              onClick={() => setActiveIdx(idx)}
              className={cn(
                "w-full p-3 rounded-[8px] border text-left flex items-center justify-between transition-all select-none",
                isCurrent
                  ? "bg-[#151A17] border-[#159A72] text-[#F7F6F1]"
                  : isCompleted
                  ? "bg-[#FFFFFF] border-[#B7E7D4] text-[#17201B]"
                  : "bg-[#FFFFFF] border-[#DDE1DC] text-[#56635C]"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-[6px] flex items-center justify-center text-xs font-mono shrink-0 border",
                    isCurrent
                      ? "bg-[#18352B] border-[#159A72] text-[#159A72]"
                      : isCompleted
                      ? "bg-[#DDF4EA] border-[#159A72] text-[#087453]"
                      : "bg-[#EFEEE8] border-[#DDE1DC] text-[#7A857E]"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-mono text-xs font-bold tracking-wide flex items-center gap-2">
                    <span>{st.label}</span>
                    <span className="text-[10px] opacity-70 font-normal">({st.sub})</span>
                  </div>
                </div>
              </div>

              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-[#159A72] shrink-0" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 text-[#7A857E] shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Stage Inspection Panel */}
      <div className="mt-4 p-5 rounded-[10px] bg-[#FFFFFF] border border-[#DDE1DC] shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#159A72] font-bold uppercase tracking-wider">
              STAGE 0{activeIdx + 1} OF 06 — {currentStage.label}
            </span>
            <span className="text-[#7A857E]">•</span>
            <span className="text-[#56635C]">{currentStage.sub}</span>
          </div>
          <p className="text-xs sm:text-sm text-[#56635C] leading-relaxed max-w-2xl">
            {currentStage.details}
          </p>
        </div>

        <div className="p-3 rounded-[6px] bg-[#F7F6F1] border border-[#DDE1DC] text-left sm:text-right shrink-0">
          <span className="text-[10px] font-mono text-[#7A857E] uppercase block">STAGE OUTPUT</span>
          <span className="text-xs sm:text-sm font-mono font-bold text-[#17201B]">
            {currentStage.metric}
          </span>
        </div>
      </div>
    </div>
  );
}
