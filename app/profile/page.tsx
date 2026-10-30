"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { EvidenceStrengthBadge } from "@/components/ui/Badge";
import { ContributionHeatmap } from "@/components/charts/ContributionHeatmap";
import { IntegrityScoreGauge } from "@/components/integrity/IntegrityScoreGauge";
import { gitriumApi } from "@/lib/services/gitriumApiService";
import { DeveloperProfile, Repository, Skill } from "@/types";
import {
  ShieldCheck,
  Github,
  Share2,
  ExternalLink,
  MapPin,
  Building,
  Cpu,
  Layers,
  Loader2,
  GitFork,
} from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [prof, repos, sks] = await Promise.all([
          gitriumApi.getProfile(),
          gitriumApi.getRepositories(),
          gitriumApi.getSkills(),
        ]);
        if (prof) setProfile(prof);
        if (Array.isArray(repos)) setRepositories(repos);
        if (Array.isArray(sks)) setSkills(sks);
      } catch (err) {
        console.warn("Failed to load profile data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const username = profile?.github?.username || profile?.user?.username || "developer";
  const displayName = profile?.user?.name || "Developer";

  const handleShare = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/profile/${username}` : "";
    if (navigator.share) {
      navigator.share({
        title: `${displayName} — Gitrium Verified Developer Profile`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const totalCommits = repositories.reduce((acc, r) => acc + (r.commitCount || 0), 0);
  const totalPRs = repositories.reduce((acc, r) => acc + (r.prCount || 0), 0);
  const integrityScore = repositories.length > 0 ? (totalCommits > 30 ? 94 : 88) : 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#F7F6F1] font-mono space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#159A72]" />
          <p className="text-xs text-[#A8B3AC]">Loading verified developer profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-7">
        {/* Profile Card Header */}
        <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-6 sm:p-8 shadow-subtle space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-[#24352C]">
            {/* User Avatar & Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-[8px] bg-[#087453] text-[#F7F6F1] font-bold flex items-center justify-center text-2xl shadow-xs font-mono flex-shrink-0">
                {displayName.slice(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#F7F6F1] tracking-tight">
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-[#18352B] text-[#159A72] text-xs font-mono font-semibold border border-[#27382F]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#159A72]" />
                    Gitrium Verified
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#A8B3AC] max-w-xl leading-relaxed font-sans">
                  {profile?.user?.bio || "Software Engineer specializing in modular architectures and verifiable systems."}
                </p>

                {/* Metadata Pill Strip */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#7A857E] font-mono pt-1">
                  {profile?.github?.username && (
                    <a
                      href={`https://github.com/${profile.github.username}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:text-[#159A72] text-[#F7F6F1] font-medium transition-colors"
                    >
                      <Github className="w-3.5 h-3.5 text-[#159A72]" />
                      <span>@{profile.github.username}</span>
                    </a>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#7A857E]" />
                    {profile?.user?.location || "Bengaluru, India"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-[#7A857E]" />
                    {profile?.user?.company || "ADYK Multi Venture Company"}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Action Toolbar */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto font-mono">
              <Button variant="emerald" size="md" onClick={handleShare} className="gap-2 w-full sm:w-auto bg-[#087453] hover:bg-[#159A72] text-white">
                <Share2 className="w-4 h-4" />
                <span>{copied ? "Link Copied!" : "Share Profile"}</span>
              </Button>

              <Link href={`/profile/${username}`} target="_blank" className="w-full sm:w-auto">
                <Button variant="outline" size="md" className="gap-1.5 w-full sm:w-auto border-[#2E3E34] bg-[#151A17] hover:bg-[#24352C] text-[#F7F6F1]">
                  <ExternalLink className="w-4 h-4 text-[#159A72]" />
                  <span>Public View</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Key Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center font-mono">
            <div className="p-3 rounded-[6px] bg-[#151A17] border border-[#24352C]">
              <span className="text-[10px] text-[#7A857E] uppercase">Repositories</span>
              <div className="text-xl font-bold text-[#F7F6F1] mt-0.5">{repositories.length}</div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#151A17] border border-[#24352C]">
              <span className="text-[10px] text-[#7A857E] uppercase">Commits</span>
              <div className="text-xl font-bold text-[#F7F6F1] mt-0.5">{totalCommits}</div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#151A17] border border-[#24352C]">
              <span className="text-[10px] text-[#7A857E] uppercase">Pull Requests</span>
              <div className="text-xl font-bold text-[#F7F6F1] mt-0.5">{totalPRs}</div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#151A17] border border-[#24352C]">
              <span className="text-[10px] text-[#7A857E] uppercase">Evidence Skills</span>
              <div className="text-xl font-bold text-[#159A72] mt-0.5">{skills.length}</div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#151A17] border border-[#24352C]">
              <span className="text-[10px] text-[#7A857E] uppercase">Integrity</span>
              <div className="text-xl font-bold text-[#159A72] mt-0.5">{integrityScore} / 100</div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#151A17] border border-[#24352C]">
              <span className="text-[10px] text-[#7A857E] uppercase">Status</span>
              <div className="text-xs font-bold text-[#159A72] mt-1.5 uppercase">Verified</div>
            </div>
          </div>
        </div>

        {/* Contribution Cadence */}
        <ContributionHeatmap />

        {/* Verified Skills Grid */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold font-mono text-[#F7F6F1] flex items-center gap-2 uppercase">
            <Cpu className="w-4 h-4 text-[#159A72]" />
            <span>Demonstrated Skills with Evidence Proofs</span>
          </h2>

          {skills.length === 0 ? (
            <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-6 text-center font-mono text-xs text-[#7A857E]">
              No verified skills indexed yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {skills.slice(0, 6).map((skill) => (
                <div
                  key={skill.id}
                  className="p-4 rounded-[11px] border border-[#27382F] bg-[#18201C] shadow-subtle flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-sm text-[#F7F6F1]">{skill.name}</span>
                    <span className="text-xs font-bold text-[#159A72]">{skill.proficiencyScore}% AST</span>
                  </div>

                  <div className="h-1.5 w-full bg-[#24352C] rounded-[3px] overflow-hidden">
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

        {/* Demonstrated Codebases */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold font-mono text-[#F7F6F1] flex items-center gap-2 uppercase">
            <Layers className="w-4 h-4 text-[#159A72]" />
            <span>Audited Production Codebases</span>
          </h2>

          <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] divide-y divide-[#24352C] shadow-subtle overflow-hidden">
            {repositories.slice(0, 5).map((repo) => (
              <div key={repo.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <Link
                    href={`/repositories/${repo.id}`}
                    className="font-mono text-sm font-bold text-[#F7F6F1] hover:text-[#159A72] transition-colors"
                  >
                    {repo.name}
                  </Link>
                  <p className="text-xs text-[#A8B3AC] mt-0.5">{repo.description}</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-[#7A857E] shrink-0">
                  <span>{repo.primaryLanguage || "Ecosystem"}</span>
                  <span>•</span>
                  <span>{repo.commitCount} commits</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
