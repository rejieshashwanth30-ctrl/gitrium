"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ANALYSIS_STAGES } from "@/lib/constants";
import { CheckCircle2, Loader2, ArrowRight, ShieldCheck, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { gitriumApi } from "@/lib/services/gitriumApiService";

interface AnalysisScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  repositoryName: string;
  repositoryId?: string;
  repositoryIds?: string[];
}

export function AnalysisScannerModal({
  isOpen,
  onClose,
  repositoryName,
  repositoryId,
  repositoryIds,
}: AnalysisScannerModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setIsDone(false);
      setGeneratedReportId(null);
      return;
    }

    // Trigger real report synthesis in parallel with visual analysis steps
    gitriumApi.generateReport(repositoryId, repositoryIds).then((res) => {
      if (res.success && res.reportId) {
        setGeneratedReportId(res.reportId);
      }
    });

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < ANALYSIS_STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsDone(true);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen, repositoryId, repositoryIds]);

  const progressPercent = Math.round(((currentStep + 1) / ANALYSIS_STAGES.length) * 100);

  const handleViewReport = () => {
    onClose();
    if (generatedReportId) {
      router.push(`/reports/${generatedReportId}`);
    } else if (repositoryId) {
      router.push(`/reports/${repositoryId}`);
    } else {
      router.push("/reports");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Gitrium AST & Provenance Scanner"
      description={`Synthesizing verifiable evidence for ${repositoryName}`}
    >
      <div className="space-y-5 text-[#17201B]">
        {/* Progress Bar & Header */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-2">
            <span className="text-[#159A72] font-semibold flex items-center gap-1.5">
              {!isDone ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ANALYZING CODEBASE ARTIFACTS...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#159A72]" />
                  AUDIT GENERATED SUCCESSFULLY
                </>
              )}
            </span>
            <span className="text-[#17201B] font-bold">{progressPercent}%</span>
          </div>

          <div className="h-2 w-full bg-[#EFEEE8] rounded-[4px] overflow-hidden border border-[#DDE1DC]">
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-[4px]",
                isDone ? "bg-[#087453]" : "bg-[#159A72]"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Console View */}
        <div className="rounded-[8px] border border-[#27382F] bg-[#151A17] p-4 font-mono text-xs max-h-60 overflow-y-auto space-y-2 text-[#F7F6F1] shadow-inner">
          <div className="flex items-center gap-2 pb-2 border-b border-[#24352C] text-[#7A857E] text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-[#159A72]" />
            <span>gitrium-provenance-engine v1.4.0 — target: {repositoryName}</span>
          </div>

          {ANALYSIS_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStep || isDone;
            const isCurrent = idx === currentStep && !isDone;

            return (
              <div
                key={stage.id}
                className={cn(
                  "flex items-start gap-2.5 transition-opacity duration-200 py-1",
                  isCompleted ? "text-[#F7F6F1]" : isCurrent ? "text-[#159A72]" : "text-[#56635C] opacity-40"
                )}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#159A72] flex-shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#159A72] animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-[#2E3E34] flex-shrink-0" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-xs leading-none mb-0.5">{stage.title}</div>
                  <div className="text-[11px] text-[#7A857E] font-sans">{stage.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#EFEEE8]">
          <span className="text-xs text-[#7A857E] font-mono">
            {isDone ? "Evidence compilation complete." : "Deterministic tree extraction running..."}
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={!isDone}
              className="px-3.5 h-10 sm:h-9 text-xs font-mono shrink-0"
            >
              Close
            </Button>
            <Button
              variant="emerald"
              size="sm"
              disabled={!isDone}
              onClick={handleViewReport}
              className="gap-2 bg-[#087453] hover:bg-[#159A72] text-white whitespace-nowrap px-4 h-10 sm:h-9 text-xs font-mono shrink-0 flex-1 sm:flex-initial"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>View Audit Report</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
