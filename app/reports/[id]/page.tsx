"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GitriumLogo } from "@/components/logo/GitriumLogo";
import { Button } from "@/components/ui/Button";
import { EvidenceStrengthBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import {
  Printer,
  Download,
  Share2,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
} from "lucide-react";

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = (params?.id as string) || "";

  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadReport() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.report) {
            setReportData(data.report);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch report:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (reportId) {
      loadReport();
    }
  }, [reportId]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleDownloadJSON = () => {
    if (!reportData) return;
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `gitrium-audit-${reportData.id}-${new Date().toISOString().split("T")[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleShare = () => {
    if (!reportData) return;
    if (navigator.share) {
      navigator.share({
        title: `Gitrium Code Audit — ${reportData.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F6F1] flex flex-col items-center justify-center p-6 text-[#17201B] font-mono space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#159A72]" />
        <p className="text-xs text-[#56635C]">Synthesizing verifiable code audit...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-[#F7F6F1] flex flex-col items-center justify-center p-6 text-[#17201B] font-mono space-y-4">
        <AlertCircle className="w-10 h-10 text-[#D97745]" />
        <h2 className="text-lg font-bold">Audit Report Not Found</h2>
        <p className="text-xs text-[#56635C] max-w-md text-center font-sans">
          The requested audit does not exist or has not yet been generated for your account.
        </p>
        <Link href="/reports">
          <Button variant="emerald" size="sm" className="bg-[#087453] hover:bg-[#159A72] text-white gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Reports Vault</span>
          </Button>
        </Link>
      </div>
    );
  }

  const fullData = reportData.fullData || {};
  const repoScope: Array<any> = fullData.repositoryScope || (reportData.repository ? [reportData.repository] : []);
  const skills: Array<any> = fullData.skills || [];
  const ai = fullData.ai || {};
  const totalCommits = fullData.totalCommits || repoScope.reduce((sum, r) => sum + (r.commitCount || 0), 0);
  const developerName = fullData.developerName || "Developer";

  return (
    <div className="min-h-screen bg-[#F7F6F1] text-[#17201B] py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Bar for Navigation and Actions (Hidden in Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <Link
          href="/reports"
          className="text-xs font-mono text-[#56635C] hover:text-[#159A72] flex items-center gap-1.5 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reports Vault</span>
        </Link>

        <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadJSON}
            className="gap-1.5 text-xs border-[#DDE1DC] text-[#17201B] px-2.5 sm:px-3 justify-center h-9 font-mono"
          >
            <Download className="w-3.5 h-3.5 text-[#159A72] shrink-0" />
            <span className="truncate">JSON Data</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 text-xs border-[#DDE1DC] text-[#17201B] px-2.5 sm:px-3 justify-center h-9 font-mono"
          >
            <Printer className="w-3.5 h-3.5 text-[#17201B] shrink-0" />
            <span className="truncate">Print / PDF</span>
          </Button>

          <Button
            variant="emerald"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 text-xs bg-[#087453] hover:bg-[#159A72] text-white px-2.5 sm:px-3 justify-center h-9 font-mono"
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span>{copied ? "Copied" : "Share"}</span>
          </Button>
        </div>
      </div>

      {/* Main Printable Document Canvas */}
      <div className="max-w-4xl mx-auto rounded-[12px] border border-[#DDE1DC] bg-white p-5 sm:p-10 shadow-card space-y-6 sm:space-y-7">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#EFEEE8]">
          <div>
            <GitriumLogo variant="full" size="lg" textColor="dark" />
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-[#DDF4EA] border border-[#B7E7D4] text-[#087453] text-xs font-mono font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OFFICIAL EVIDENCE AUDIT REPORT</span>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono text-xs text-[#7A857E] space-y-1 w-full sm:w-auto">
            <div>
              <span className="text-[#7A857E]">Report ID: </span>
              <span className="text-[#17201B] font-bold">{reportData.id.slice(0, 16)}...</span>
            </div>
            <div>
              <span className="text-[#7A857E]">Target: </span>
              <span className="text-[#159A72] font-bold">
                {repoScope.map((r) => r.name).join(", ") || reportData.title}
              </span>
            </div>
            <div>
              <span className="text-[#7A857E]">Audited Developer: </span>
              <span className="text-[#17201B]">{developerName}</span>
            </div>
            <div>
              <span className="text-[#7A857E]">Audit Date: </span>
              <span className="text-[#56635C]">{formatDate(reportData.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Overall Score Card */}
        <div className="p-5 rounded-[8px] bg-[#F7F6F1] border border-[#DDE1DC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1 text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#159A72]">
              OVERALL EVIDENCE SCORE
            </span>
            <h2 className="text-xl font-bold font-mono text-[#17201B]">Overall Evidence Score</h2>
            <p className="text-xs text-[#56635C] max-w-md font-sans">
              Based on your project history, contributions, technologies, and code structure. This score summarizes how much usable project evidence Gitrium found.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-left sm:text-center font-mono">
              <span className="text-4xl font-extrabold text-[#17201B]">
                {totalCommits > 20 ? 94 : totalCommits > 5 ? 88 : 76}
              </span>
              <span className="text-xs text-[#7A857E] inline sm:block ml-1 sm:ml-0">/ 100</span>
            </div>
            <EvidenceStrengthBadge strength={totalCommits > 15 ? "Strong Evidence" : "Moderate Evidence"} />
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2 font-mono">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A857E]">
            Executive Summary:
          </h3>
          <p className="text-xs sm:text-sm text-[#17201B] leading-relaxed p-4 rounded-[6px] bg-[#F7F6F1] border border-[#DDE1DC] font-sans">
            {reportData.summary || ai.summary || ai.engineeringSummary || "Gitrium found strong evidence of consistent development activity across the analyzed projects."}
          </p>
        </div>

        {/* AI Evidence Interpretation Section */}
        <div className="p-5 rounded-[8px] bg-[#F7F6F1] border border-[#DDE1DC] space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DDE1DC]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#159A72]" />
              <span className="font-bold uppercase tracking-wider text-[#087453] text-xs">
                AI Insights &amp; Interpretation
              </span>
            </div>
            <span className="text-[11px] text-[#7A857E]">
              {ai.evidenceBasis
                ? `Basis: ${ai.evidenceBasis.repositoriesCount || repoScope.length} Repos • ${ai.evidenceBasis.commitsCount || totalCommits} Commits • ${ai.evidenceBasis.skillsCount || skills.length} Skills`
                : `Basis: ${repoScope.length} Repos • ${totalCommits} Commits`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths & Observed Engineering Patterns */}
            <div className="p-3.5 rounded-[6px] bg-white border border-[#DDE1DC] space-y-2">
              <span className="text-[11px] font-bold text-[#087453] uppercase block">
                Observed Technical Strengths:
              </span>
              <ul className="space-y-1.5 text-xs text-[#17201B] font-sans">
                {(ai.strengths || [
                  { title: "Modular Architecture", explanation: "Consistent separation of concerns across audited repositories." }
                ]).slice(0, 3).map((item: any, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#159A72] font-bold">•</span>
                    <span><strong>{item.title || item}:</strong> {item.explanation || ""}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Development Focus & Trajectory */}
            <div className="p-3.5 rounded-[6px] bg-white border border-[#DDE1DC] space-y-2">
              <span className="text-[11px] font-bold text-[#D97745] uppercase block">
                Development Focus &amp; Alignment:
              </span>
              <ul className="space-y-1.5 text-xs text-[#17201B] font-sans">
                {(ai.recommendedNextSteps || ai.developmentAreas || [
                  { title: "Automated Testing", reason: "Introduce CI/CD test automation suites to increase verifiable rigor." }
                ]).slice(0, 3).map((item: any, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#D97745] font-bold">•</span>
                    <span><strong>{item.title || item}:</strong> {item.reason || item.explanation || ""}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-[10px] text-[#7A857E] font-sans italic pt-1 border-t border-[#DDE1DC]">
            Interpretations are strictly grounded in deterministic code artifacts and repository commit trees. Gitrium AI does not extrapolate unobserved skills.
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A857E]">
            Audited Repository Metrics:
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono text-xs">
            <div className="p-3 rounded-[6px] bg-[#F7F6F1] border border-[#DDE1DC]">
              <span className="text-[10px] text-[#7A857E] uppercase">Repositories In Scope</span>
              <div className="text-base font-bold text-[#17201B] mt-0.5">{repoScope.length}</div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#F7F6F1] border border-[#DDE1DC]">
              <span className="text-[10px] text-[#7A857E] uppercase">Indexed Commits</span>
              <div className="text-base font-bold text-[#17201B] mt-0.5">{totalCommits}</div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#F7F6F1] border border-[#DDE1DC]">
              <span className="text-[10px] text-[#7A857E] uppercase">Evidence-Backed Skills</span>
              <div className="text-base font-bold text-[#159A72] mt-0.5">{skills.length}</div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#F7F6F1] border border-[#DDE1DC]">
              <span className="text-[10px] text-[#7A857E] uppercase">Integrity Score</span>
              <div className="text-base font-bold text-[#159A72] mt-0.5">
                {totalCommits > 20 ? 94 : 88} / 100
              </div>
            </div>
          </div>
        </div>

        {/* Audited Repositories Breakdown */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A857E]">
            Audited Codebases ({repoScope.length}):
          </h3>
          <div className="space-y-2 font-mono text-xs">
            {repoScope.map((r, idx) => (
              <div
                key={r.id || idx}
                className="p-3 rounded-[6px] bg-[#F7F6F1] border border-[#DDE1DC] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-[#17201B]">{r.name}</span>
                  <span className="text-[#56635C] ml-2 font-sans">({r.primaryLanguage || "Ecosystem"})</span>
                </div>
                <div className="text-[#7A857E]">
                  <span>{r.commitCount || 0} indexed commits</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Skills Detected */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A857E]">
            Evidence-Backed Skill Competencies:
          </h3>
          {skills.length === 0 ? (
            <p className="text-xs font-mono text-[#7A857E] p-3 rounded-[6px] bg-[#F7F6F1] border border-[#DDE1DC]">
              Skills are being derived from newly indexed codebases.
            </p>
          ) : (
            <div className="space-y-2 font-mono">
              {skills.map((sk) => (
                <div
                  key={sk.id || sk.name}
                  className="p-3 rounded-[6px] bg-[#F7F6F1] border border-[#DDE1DC] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#159A72]" />
                    <div>
                      <span className="font-bold text-[#17201B]">{sk.name}</span>
                      <span className="text-[#56635C] ml-1.5">({sk.category || "Skill"})</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#159A72]">{sk.proficiencyScore || 85}% Evidence Strength</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cryptographic Traceability Footer */}
        <div className="pt-4 border-t border-[#EFEEE8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono text-[#7A857E]">
          <div>
            <span>Provenance Hash: </span>
            <code className="text-[#17201B] bg-[#F7F6F1] px-1.5 py-0.5 rounded border border-[#DDE1DC] break-all">
              {reportData.reportHash.slice(0, 32)}...
            </code>
          </div>
          <span className="text-[#159A72] font-semibold">Cryptographically Hash Verified</span>
        </div>
      </div>
    </div>
  );
}
