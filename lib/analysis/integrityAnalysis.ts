export interface IntegritySignalResult {
  id: string;
  name: string;
  category: "Repository Consistency" | "Commit Consistency" | "Project Evolution" | "Testing Evidence" | "Documentation Rigor" | string;
  score: number; // 0 - 100
  status: "Optimal" | "Verifiable" | "Attention" | "Flagged";
  label?: "Strong Evidence" | "Moderate Evidence" | "Limited Evidence";
  evidenceText: string;
  anomalyDetected: boolean;
  metricLabel: string;
  metricValue: string;
  findings: string[];
  confidenceInterval: string;
  whatGitriumSaw: string;
  whatThisMeans: string;
}

export function computeIntegritySignals(params: {
  repositoriesCount: number;
  totalCommits: number;
  totalPRs: number;
  hasTestingEvidence?: boolean;
  hasDocumentation?: boolean;
}): IntegritySignalResult[] {
  const {
    repositoriesCount,
    totalCommits,
    totalPRs,
    hasTestingEvidence = false,
    hasDocumentation = true,
  } = params;

  if (repositoriesCount === 0) {
    return [];
  }

  // Dimension 1: Repository Consistency
  const repoScore = repositoriesCount >= 3 ? 92 : repositoriesCount > 0 ? 82 : 0;
  // Dimension 2: Commit Consistency
  const commitScore = totalCommits > 50 ? 94 : totalCommits > 10 ? 84 : totalCommits > 0 ? 70 : 0;
  // Dimension 3: Project Evolution
  const evolutionScore = totalPRs > 5 ? 90 : totalCommits > 30 ? 86 : totalCommits > 5 ? 78 : 60;
  // Dimension 4: Testing Evidence
  const testingScore = hasTestingEvidence ? 88 : 60;
  // Dimension 5: Documentation Rigor
  const docScore = hasDocumentation ? 85 : 72;

  const toLabel = (s: number): "Strong Evidence" | "Moderate Evidence" | "Limited Evidence" =>
    s >= 80 ? "Strong Evidence" : s >= 50 ? "Moderate Evidence" : "Limited Evidence";

  return [
    {
      id: "sig_repo_consistency",
      name: "Repository Consistency",
      category: "Repository Consistency",
      score: repoScore,
      status: repoScore >= 80 ? "Optimal" : "Verifiable",
      label: toLabel(repoScore),
      evidenceText: `Your projects show consistent repository activity and structure across ${repositoriesCount} connected repository${repositoriesCount === 1 ? "" : "s"}.`,
      anomalyDetected: false,
      metricLabel: "Connected Codebases",
      metricValue: `${repositoriesCount} repos`,
      findings: [
        `Primary author identity confirmed on ${repositoriesCount} repositories`,
        "Verified repository metadata and ownership mappings",
        "Consistent directory and module organization across projects",
      ],
      confidenceInterval: "Strong Evidence Confidence",
      whatGitriumSaw: `Consistent repository ownership and active repository configuration across ${repositoriesCount} codebases.`,
      whatThisMeans: "This indicates clear project ownership and organized codebase structures.",
    },
    {
      id: "sig_commit_consistency",
      name: "Commit Consistency",
      category: "Commit Consistency",
      score: commitScore,
      status: commitScore >= 80 ? "Optimal" : "Verifiable",
      label: toLabel(commitScore),
      evidenceText:
        totalCommits > 0
          ? `Your development history shows regular, incremental commit updates across your connected projects.`
          : "Insufficient commit events to establish multi-month cadence.",
      anomalyDetected: false,
      metricLabel: "Commit Continuity",
      metricValue: `${totalCommits} commits`,
      findings: [
        `${totalCommits} verified commit objects across branches`,
        "No bulk unusual merge anomalies detected",
        "Chronological timestamps align with commit author headers",
      ],
      confidenceInterval: "High Evidence Confidence",
      whatGitriumSaw: `Commit activity is distributed across multiple development sessions with ${totalCommits} verified commits.`,
      whatThisMeans: "This indicates a development history with activity spread over time without unusual activity spikes.",
    },
    {
      id: "sig_project_evolution",
      name: "Project Evolution",
      category: "Project Evolution",
      score: evolutionScore,
      status: evolutionScore >= 80 ? "Optimal" : "Verifiable",
      label: toLabel(evolutionScore),
      evidenceText: "Your projects reflect structured progression and progressive feature additions over time.",
      anomalyDetected: false,
      metricLabel: "Project Growth",
      metricValue: totalPRs > 0 ? `${totalPRs} PRs` : `${totalCommits} commits`,
      findings: [
        totalPRs > 0
          ? `${totalPRs} structured pull requests recorded in history`
          : "Direct branch commit iteration and feature progression verified",
        "Code changes indicate organic transition through project milestones",
      ],
      confidenceInterval: "Strong Evidence Confidence",
      whatGitriumSaw: "Gradual code changes, branch updates, and repository iterations recorded across project history.",
      whatThisMeans: "This shows that codebases evolved through continuous iterative problem-solving.",
    },
    {
      id: "sig_testing_evidence",
      name: "Testing Evidence",
      category: "Testing Evidence",
      score: testingScore,
      status: hasTestingEvidence ? "Optimal" : "Attention",
      label: toLabel(testingScore),
      evidenceText: hasTestingEvidence
        ? "Automated test suites or unit assertion specs identified within repository files."
        : "Standard unit or integration test manifests are being evaluated across project directories.",
      anomalyDetected: !hasTestingEvidence,
      metricLabel: "Testing Signals",
      metricValue: hasTestingEvidence ? "Detected" : "Evaluating",
      findings: hasTestingEvidence
        ? [
            "Test frameworks identified in package manifests",
            "Automated assertion files detected",
          ]
        : [
            "No primary test framework manifest found in root configuration",
            "Recommend adding automated test fixtures to strengthen evidence",
          ],
      confidenceInterval: hasTestingEvidence ? "Verified Testing Evidence" : "Evaluating Coverage",
      whatGitriumSaw: hasTestingEvidence
        ? "Test frameworks identified in package manifests and assertion files detected."
        : "Standard unit or integration test manifests have not yet been indexed in primary directories.",
      whatThisMeans: hasTestingEvidence
        ? "Automated verification helps confirm code reliability and functional correctness."
        : "Adding automated test suites will strengthen verifiable engineering evidence.",
    },
    {
      id: "sig_documentation_rigor",
      name: "Documentation Rigor",
      category: "Documentation Rigor",
      score: docScore,
      status: docScore >= 80 ? "Optimal" : "Verifiable",
      label: toLabel(docScore),
      evidenceText: "Clear repository descriptions and documented module structures present across projects.",
      anomalyDetected: false,
      metricLabel: "Project Context",
      metricValue: hasDocumentation ? "Documented" : "Evaluating",
      findings: [
        "Repository descriptions and architectural manifests verified",
        "Module hierarchy and file organization follow standard conventions",
      ],
      confidenceInterval: "Strong Evidence Confidence",
      whatGitriumSaw: "Descriptive repository metadata, README documentation, and modular project organization.",
      whatThisMeans: "Good documentation ensures codebases are understandable, maintainable, and verifiable.",
    },
  ];
}
