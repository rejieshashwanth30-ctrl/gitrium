"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GitriumLogo } from "@/components/logo/GitriumLogo";
import { Button } from "@/components/ui/Button";
import { EvidenceStrengthBadge } from "@/components/ui/Badge";
import { ContributionHeatmap } from "@/components/charts/ContributionHeatmap";
import { gitriumApi } from "@/lib/services/gitriumApiService";
import { DeveloperProfile, Skill, Repository } from "@/types";
import {
  ShieldCheck,
  Github,
  Share2,
  FileDown,
  Cpu,
  Loader2,
  AlertCircle,
  GitFork,
} from "lucide-react";

export default function PublicProfilePage() {
  const params = useParams();
  const routeUsername = (params?.username as string) || "";
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPublicData() {
      setIsLoading(true);
      try {
        const [prof, sks, repos] = await Promise.all([
          gitriumApi.getProfile(),
          gitriumApi.getSkills(),
          gitriumApi.getRepositories(),
        ]);
        if (prof) setProfile(prof);
        if (Array.isArray(sks)) setSkills(sks);
        if (Array.isArray(repos)) setRepositories(repos);
      } catch (err) {
        console.warn("Failed to load public profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPublicData();
  }, [routeUsername]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const displayName = profile?.user?.name || routeUsername || "Developer";
  const githubUser = profile?.github?.username || routeUsername || "developer";
  const totalCommits = repositories.reduce((sum, r) => sum + (r.commitCount || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F6F1] flex flex-col items-center justify-center font-mono text-xs text-[#56635C] space-y-2">
        <Loader2 className="w-6 h-6 animate-spin text-[#159A72]" />
        <span>Loading verified developer vault...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F1] text-[#17201B] flex flex-col justify-start">
      {/* Top Public Header */}
      <header className="border-b border-[#DDE1DC] bg-white/95 py-3.5 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <GitriumLogo variant="full" size="md" textColor="dark" />

        <div className="flex items-center gap-2.5 font-mono">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 hidden sm:inline-flex text-xs border-[#DDE1DC] text-[#17201B]">
            <FileDown className="w-3.5 h-3.5 text-[#159A72]" />
            <span>Download PDF</span>
          </Button>

          <Button variant="emerald" size="sm" onClick={handleShare} className="gap-1.5 text-xs bg-[#087453] hover:bg-[#159A72] text-white">
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? "Link Copied!" : "Share Profile"}</span>
          </Button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="max-w-5xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8 space-y-7">
        {/* Profile Identity Card */}
        <div className="rounded-[12px] border border-[#DDE1DC] bg-white p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#EFEEE8]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-[8px] bg-[#087453] text-white font-bold flex items-center justify-center text-2xl shadow-xs font-mono flex-shrink-0">
                {displayName.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#17201B]">{displayName}</h1>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#DDF4EA] text-[#087453] text-xs font-mono font-semibold border border-[#B7E7D4]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#087453]" />
                    Gitrium Verified
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#56635C] mt-1 max-w-xl font-sans">
                  {profile?.user?.bio || "Software Engineer specializing in modular architectures and verifiable systems."}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#7A857E] font-mono pt-2">
                  <a
                    href={`https://github.com/${githubUser}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-[#159A72] text-[#17201B] font-medium transition-colors"
                  >
                    <Github className="w-3.5 h-3.5 text-[#159A72]" />
                    <span>@{githubUser}</span>
                  </a>
                  <span>•</span>
                  <span>{profile?.user?.location || "Bengaluru, India"}</span>
                  <span>•</span>
                  <span>{profile?.user?.company || "ADYK Multi Venture Company"}</span>
                </div>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-[#7A857E] shrink-0 self-end sm:self-center">
              <div>Repositories Audited: <strong className="text-[#17201B]">{repositories.length}</strong></div>
              <div>Commits Verified: <strong className="text-[#159A72]">{totalCommits}</strong></div>
            </div>
          </div>
        </div>

        {/* Contribution Cadence */}
        <ContributionHeatmap />

        {/* Skills Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold font-mono text-[#17201B] flex items-center gap-2 uppercase">
            <Cpu className="w-4 h-4 text-[#159A72]" />
            <span>Demonstrated Skills with Evidence Proofs</span>
          </h2>

          {skills.length === 0 ? (
            <div className="rounded-[11px] border border-[#DDE1DC] bg-white p-6 text-center font-mono text-xs text-[#7A857E]">
              No verified skills indexed yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {skills.slice(0, 6).map((skill) => (
                <div
                  key={skill.id}
                  className="p-4 rounded-[11px] border border-[#DDE1DC] bg-white shadow-subtle flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-sm text-[#17201B]">{skill.name}</span>
                    <span className="text-xs font-bold text-[#159A72]">{skill.proficiencyScore}% AST</span>
                  </div>

                  <div className="h-1.5 w-full bg-[#EFEEE8] rounded-[3px] overflow-hidden">
                    <div
                      className="h-full bg-[#159A72] rounded-[3px]"
                      style={{ width: `${skill.proficiencyScore}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#7A857E]">
                    <span>Category: {skill.category}</span>
                    <EvidenceStrengthBadge strength={skill.evidenceStrength} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
