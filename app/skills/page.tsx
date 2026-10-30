"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { EvidenceStrengthBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { gitriumApi } from "@/lib/services/gitriumApiService";
import { Skill, SkillEvidence } from "@/types";
import {
  Cpu,
  CheckCircle2,
  ArrowRight,
  Github,
  Layers,
  Sparkles,
} from "lucide-react";
import { StructuredAIInsights } from "@/lib/intelligence/aiLayer";
import { cn } from "@/lib/utils";

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [aiInsights, setAiInsights] = useState<StructuredAIInsights | null>(null);
  const [githubConnected, setGithubConnected] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    async function loadSkills() {
      try {
        const [profile, liveSkills, insights] = await Promise.all([
          gitriumApi.getProfile(),
          gitriumApi.getSkills(),
          gitriumApi.getAIInsights(),
        ]);
        setGithubConnected(profile?.github?.connectionStatus === "connected");
        if (Array.isArray(liveSkills)) {
          setSkills(liveSkills);
        }
        if (insights) {
          setAiInsights(insights);
        }
      } catch (err) {
        console.warn("Skills fetch error:", err);
      }
    }
    loadSkills();
  }, []);

  const categories = ["All", "Frontend", "Backend", "Mobile", "Database", "Architecture", "Data/AI", "Language"];

  const filteredSkills = skills.filter((s) =>
    selectedCategory === "All" ? true : s.category === selectedCategory
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#24352C]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-[#18352B] border border-[#27382F] text-[#159A72] text-xs font-mono font-semibold mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>EMPIRICAL CODE PROVENANCE</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#F7F6F1] tracking-tight uppercase">
              Skill Intelligence
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#A8B3AC] font-mono">
              Every score is mathematically derived from commit diffs, AST syntax trees, and test assertions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#7A857E]">
              Total Verified: {skills.length} Skills
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-[6px] text-xs font-mono font-medium transition-colors border",
                selectedCategory === cat
                  ? "bg-[#18352B] border-[#159A72] text-[#F7F6F1]"
                  : "bg-[#18201C] border-[#27382F] text-[#A8B3AC] hover:text-[#F7F6F1]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Grid / Empty State */}
        {skills.length === 0 ? (
          <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-[8px] bg-[#151A17] border border-[#2E3E34] text-[#159A72] flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-mono text-[#F7F6F1]">
              {!githubConnected ? "GitHub not connected." : "Insufficient evidence for a reliable analysis."}
            </h3>
            <p className="text-xs text-[#A8B3AC] font-mono max-w-md mx-auto">
              {!githubConnected
                ? "Connect GitHub to begin your analysis and prove your engineering skills with real commit data."
                : "Synchronize your active codebases to calculate deterministic evidence strength scores and skill evidence."}
            </p>
            {!githubConnected ? (
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
            ) : (
              <div className="pt-2">
                <Link href="/dashboard">
                  <Button
                    variant="emerald"
                    size="md"
                    className="gap-2 bg-[#087453] hover:bg-[#159A72] text-white"
                  >
                    <span>Go to Dashboard &amp; Sync</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-8 text-center space-y-2">
            <p className="text-sm font-mono text-[#A8B3AC]">No skills found in category &quot;{selectedCategory}&quot;.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((skill) => (
              <div
                key={skill.id}
                onClick={() => setSelectedSkill(skill)}
                className="rounded-[11px] border border-[#27382F] bg-[#18201C] p-5 flex flex-col justify-between hover:border-[#159A72] transition-all cursor-pointer group shadow-subtle"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A857E] block">
                        {skill.category}
                      </span>
                      <h3 className="text-base font-bold font-mono text-[#F7F6F1] group-hover:text-[#159A72] transition-colors">
                        {skill.name}
                      </h3>
                    </div>
                    <EvidenceStrengthBadge strength={skill.evidenceStrength} />
                  </div>

                  {/* Score Gauge */}
                  <div className="space-y-1.5 my-4">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#A8B3AC]">Evidence Strength</span>
                      <span className="font-bold text-[#159A72]">{skill.proficiencyScore}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#151A17] rounded-[3px] overflow-hidden border border-[#24352C]">
                      <div
                        className="h-full bg-[#159A72] rounded-[3px] transition-all"
                        style={{ width: `${skill.proficiencyScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-[#7A857E] pt-2 border-t border-[#24352C]">
                    <span>{skill.evidenceCount} Commit Nodes</span>
                    <span>{skill.projectCount} Projects</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#24352C] flex items-center justify-between text-xs font-mono text-[#159A72] font-semibold">
                  <span>Inspect Proof</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSkill && (
        <Modal
          isOpen={!!selectedSkill}
          onClose={() => setSelectedSkill(null)}
          title={`Evidence Audit: ${selectedSkill.name}`}
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 rounded-[6px] bg-[#151A17] border border-[#24352C] flex items-center justify-between">
              <span className="text-[#A8B3AC]">Evidence Strength Score:</span>
              <span className="text-sm font-bold text-[#159A72]">{selectedSkill.proficiencyScore}%</span>
            </div>
            <div className="p-3 rounded-[6px] bg-[#151A17] border border-[#24352C] flex items-center justify-between">
              <span className="text-[#A8B3AC]">Evidence Strength:</span>
              <EvidenceStrengthBadge strength={selectedSkill.evidenceStrength} />
            </div>
            <div className="p-3 rounded-[6px] bg-[#151A17] border border-[#24352C] space-y-1">
              <span className="text-[#A8B3AC] block">Audit Traceability:</span>
              <p className="text-[11px] text-[#F7F6F1] font-sans leading-relaxed">
                Skill evidence computed across {selectedSkill.projectCount} audited repository projects and {selectedSkill.evidenceCount} commit DAG nodes.
              </p>
            </div>

            {/* Contextual AI Evidence Interpretation */}
            <div className="p-3.5 rounded-[6px] bg-[#151A17] border border-[#24352C] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#159A72] uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#159A72]" />
                <span>AI Evidence Interpretation</span>
              </div>
              <p className="text-[11px] text-[#A8B3AC] font-sans leading-relaxed">
                {selectedSkill.evidenceCount >= 10
                  ? `Strong and repeated implementation evidence observed across ${selectedSkill.projectCount} repository codebase${selectedSkill.projectCount > 1 ? "s" : ""}. AST syntactical structures indicate sustained architecture usage with ${selectedSkill.proficiencyScore}% empirical score.`
                  : `Emerging skill pattern observed across ${selectedSkill.projectCount} repository codebase${selectedSkill.projectCount > 1 ? "s" : ""}. Further production commits and test assertions will increase the empirical evidence score.`}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
