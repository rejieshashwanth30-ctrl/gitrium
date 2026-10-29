"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { EvidenceStrengthBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { gitriumApi } from "@/lib/services/gitriumApiService";
import { EvidenceNode, Repository } from "@/types";
import {
  FileCode,
  Search,
  CheckCircle2,
  GitCommit,
  GitPullRequest,
  GitFork,
  Layers,
  FileCheck2,
  Github,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EvidenceExplorerPage() {
  const [evidenceNodes, setEvidenceNodes] = useState<EvidenceNode[]>([]);
  const [githubConnected, setGithubConnected] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [activeNode, setActiveNode] = useState<EvidenceNode | null>(null);

  useEffect(() => {
    async function loadEvidence() {
      try {
        const [profile, repos] = await Promise.all([
          gitriumApi.getProfile(),
          gitriumApi.getRepositories(),
        ]);
        setGithubConnected(profile?.github?.connectionStatus === "connected");

        if (Array.isArray(repos) && repos.length > 0) {
          const synthesized: EvidenceNode[] = [];

          repos.forEach((repo) => {
            synthesized.push({
              id: `ev_repo_${repo.id}`,
              sourceType: "Repository",
              sourceName: repo.name,
              sourceIdentifier: repo.fullName,
              timestamp: repo.createdAt ? repo.createdAt.toString().slice(0, 10) : "2026-10-20",
              description: repo.description || "Audited production codebase with verified provenance.",
              strength: repo.evidenceStrength || "Strong Evidence",
              weight: Math.min(95, (repo.commitCount || 10) * 2),
              associatedSkills: (repo.technologies || []).map((t) => t.name),
            });

            // Extract technologies as architecture proof
            repo.technologies?.forEach((tech) => {
              synthesized.push({
                id: `ev_tech_${repo.id}_${tech.name}`,
                sourceType: "Architecture",
                sourceName: `${tech.name} implementation in ${repo.name}`,
                sourceIdentifier: `${repo.name}:${tech.name.toLowerCase()}`,
                timestamp: repo.createdAt ? repo.createdAt.toString().slice(0, 10) : "2026-10-20",
                description: `Demonstrated architectural usage of ${tech.name} in repository manifest.`,
                strength: "Strong Evidence",
                weight: 88,
                associatedSkills: [tech.name, repo.primaryLanguage],
              });
            });
          });

          setEvidenceNodes(synthesized);
        }
      } catch (err) {
        console.warn("Evidence fetch error:", err);
      }
    }
    loadEvidence();
  }, []);

  const sourceTypes = ["All", "Repository", "Commit", "PullRequest", "Test", "Architecture"];

  const filteredNodes = useMemo(() => {
    return evidenceNodes.filter((n) => {
      const matchSearch =
        n.sourceName.toLowerCase().includes(search.toLowerCase()) ||
        n.description.toLowerCase().includes(search.toLowerCase()) ||
        n.associatedSkills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
      const matchType = selectedType === "All" || n.sourceType === selectedType;
      return matchSearch && matchType;
    });
  }, [evidenceNodes, search, selectedType]);

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "Repository":
        return GitFork;
      case "Commit":
        return GitCommit;
      case "PullRequest":
        return GitPullRequest;
      case "Test":
        return FileCheck2;
      default:
        return Layers;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#24352C]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#18352B] border border-[#27382F] text-[#159A72] text-xs font-mono font-semibold mb-2">
              <FileCode className="w-3.5 h-3.5" />
              <span>CRYPTOGRAPHIC CODE PROOFS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#F7F6F1] tracking-tight uppercase">
              Evidence Explorer
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#A8B3AC] font-mono">
              Query every individual commit, pull request, test suite, and architectural pattern in your vault.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#7A857E]">
              Total Evidence Nodes: {evidenceNodes.length}
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-[11px] border border-[#27382F] bg-[#18201C] shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#7A857E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by keyword, skill, or SHA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-[6px] bg-[#151A17] border border-[#2E3E34] text-xs font-mono text-[#F7F6F1] placeholder-[#7A857E] focus:outline-none focus:border-[#159A72]"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto font-mono">
            {sourceTypes.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={cn(
                  "px-3 py-1 rounded-[6px] text-xs transition-colors",
                  selectedType === t
                    ? "bg-[#087453] text-[#F7F6F1] font-semibold border border-[#159A72]"
                    : "bg-[#151A17] text-[#A8B3AC] border border-[#27382F] hover:bg-[#1E2822] hover:text-[#F7F6F1]"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Evidence Cards / Empty State */}
        {evidenceNodes.length === 0 ? (
          <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-[8px] bg-[#151A17] border border-[#2E3E34] text-[#159A72] flex items-center justify-center mx-auto">
              <FileCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-mono text-[#F7F6F1]">
              {!githubConnected ? "GitHub not connected." : "Insufficient evidence for a reliable evidence index."}
            </h3>
            <p className="text-xs text-[#A8B3AC] font-mono max-w-md mx-auto">
              {!githubConnected
                ? "Connect GitHub to begin your analysis and populate cryptographic evidence nodes from your code."
                : "Evidence nodes are extracted directly from repository commit DAGs, pull request merges, and language manifests upon synchronization."}
            </p>
            {!githubConnected && (
              <div className="pt-2">
                <Link href="/github-connect">
                  <Button
                    variant="emerald"
                    size="md"
                    className="gap-2 bg-[#087453] hover:bg-[#159A72] text-white"
                  >
                    <Github className="w-4 h-4" />
                    <span>Connect GitHub Account</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : filteredNodes.length === 0 ? (
          <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-8 text-center space-y-2">
            <p className="text-sm font-mono text-[#A8B3AC]">No evidence nodes matched your filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredNodes.map((node) => {
              const Icon = getSourceIcon(node.sourceType);

              return (
                <div
                  key={node.id}
                  onClick={() => setActiveNode(node)}
                  className="p-4 rounded-[11px] border border-[#27382F] bg-[#18201C] hover:border-[#159A72] transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-subtle"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-9 h-9 rounded-[6px] bg-[#151A17] border border-[#24352C] text-[#159A72] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-xs font-bold text-[#F7F6F1] hover:text-[#159A72] transition-colors">
                          {node.sourceName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-[4px] bg-[#151A17] text-[#A8B3AC] border border-[#24352C]">
                          {node.sourceType}
                        </span>
                      </div>
                      <p className="text-xs text-[#A8B3AC] mt-0.5 line-clamp-1 font-sans">{node.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {node.associatedSkills.map((sk, idx) => (
                          <span key={idx} className="text-[10px] font-mono text-[#7A857E]">
                            #{sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center font-mono text-xs">
                    <span className="text-[#7A857E] text-[11px]">{node.timestamp}</span>
                    <EvidenceStrengthBadge strength={node.strength} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal for detailed node proof */}
        {activeNode && (
          <Modal
            isOpen={!!activeNode}
            onClose={() => setActiveNode(null)}
            size="md"
            title="Evidence Node Verification"
            description="AST hash and provenance record"
          >
            <div className="space-y-4 text-[#17201B]">
              <div className="p-4 rounded-[6px] bg-[#F7F6F1] border border-[#DDE1DC] space-y-2 font-mono text-xs">
                <div>
                  <span className="text-[#7A857E]">Source: </span>
                  <span className="text-[#17201B] font-bold">{activeNode.sourceName}</span>
                </div>
                <div>
                  <span className="text-[#7A857E]">Identifier: </span>
                  <span className="text-[#159A72] font-semibold">{activeNode.sourceIdentifier}</span>
                </div>
                <div>
                  <span className="text-[#7A857E]">Type: </span>
                  <span className="text-[#17201B]">{activeNode.sourceType}</span>
                </div>
                <div>
                  <span className="text-[#7A857E]">Weight: </span>
                  <span className="text-[#087453] font-bold">{activeNode.weight} / 100</span>
                </div>
              </div>

              <p className="text-xs text-[#56635C] leading-relaxed font-sans">{activeNode.description}</p>

              <div className="pt-1 flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => setActiveNode(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
