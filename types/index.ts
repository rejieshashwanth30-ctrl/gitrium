// ============================================================================
// ADYK GITRIUM — TYPE DEFINITIONS & DOMAIN MODELS
// ============================================================================

export type EvidenceStrength = "Strong Evidence" | "Moderate Evidence" | "Limited Evidence" | "Needs Review";

export type VerificationStatus = "verified" | "pending" | "unverified";

export type RoleAlignment = "High Alignment" | "Moderate Alignment" | "Developing";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  location: string;
  company?: string;
  website?: string;
  createdAt: string;
  joinedDate?: string;
  isVerified: boolean;
  tier: "Free" | "Pro" | "Enterprise";
}

export interface GitHubAccount {
  id: string;
  userId: string;
  username: string;
  profileUrl: string;
  avatarUrl: string;
  publicRepos: number;
  totalCommits: number;
  totalPRs: number;
  followers: number;
  following: number;
  accountAgeYears: number;
  lastSyncedAt: string;
  connectionStatus: "connected" | "syncing" | "disconnected" | "error";
}

export interface Technology {
  id: string;
  name: string;
  category: "Language" | "Framework" | "Database" | "DevOps" | "Testing" | "Architecture" | "Library" | "Mobile";
  icon?: string;
  color: string;
}

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  isPrivate: boolean;
  isFork: boolean;
  primaryLanguage: string;
  technologies: Technology[];
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  lastActivity: string;
  createdAt: string;
  commitCount: number;
  prCount: number;
  linesOfCode: number;
  complexity: "Low" | "Medium" | "High" | "Architectural";
  evidenceStrength: EvidenceStrength;
  architectureType: string;
  testCoverageEstimate: string;
  documentationScore: number; // 0 - 100
  analysisStatus: "completed" | "analyzing" | "queued" | "failed";
  isSelected?: boolean;
}

export interface Commit {
  id: string;
  sha: string;
  repositoryId: string;
  repositoryName: string;
  message: string;
  authorName: string;
  authorDate: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  primarySkill: string;
  isMergeCommit: boolean;
  integrityVerified: boolean;
}

export interface PullRequest {
  id: string;
  number: number;
  repositoryId: string;
  repositoryName: string;
  title: string;
  state: "merged" | "open" | "closed";
  createdAt: string;
  mergedAt?: string;
  author: string;
  reviewsCount: number;
  commentsCount: number;
  changedFiles: number;
  additions: number;
  deletions: number;
  primarySkills: string[];
}

export interface Contribution {
  id: string;
  repositoryId: string;
  repositoryName: string;
  date: string;
  type: "commit" | "pr_created" | "pr_merged" | "code_review" | "issue_resolved";
  count: number;
  impactScore: number;
  skillTags: string[];
}

export interface EvidenceNode {
  id: string;
  sourceType: "Repository" | "Commit" | "PullRequest" | "File" | "Architecture" | "Test" | "Deployment";
  sourceName: string;
  sourceIdentifier: string;
  timestamp: string;
  description: string;
  strength: EvidenceStrength;
  weight: number; // 1 - 100
  associatedSkills: string[];
  metadata?: Record<string, string | number>;
}

export interface SkillEvidence {
  skillId: string;
  skillName: string;
  category: "Frontend" | "Backend" | "Mobile" | "Data/AI" | "DevOps" | "Database" | "Architecture" | "Language";
  score: number; // 0 - 100
  strength: EvidenceStrength;
  totalRepositories: number;
  totalCommits: number;
  totalPullRequests: number;
  totalPRs?: number;
  activeMonths: number;
  firstObserved: string;
  lastObserved: string;
  testingDetected: boolean;
  productionDeploymentDetected: boolean;
  architecturePatterns: string[];
  relatedTechnologies: string[];
  evidenceNodes: EvidenceNode[];
  breakdownByRepo?: Record<string, { count: number; lastObserved: string }> | any[];
}

export interface Skill {
  id: string;
  name: string;
  category: "Frontend" | "Backend" | "Mobile" | "Data/AI" | "DevOps" | "Database" | "Architecture" | "Language";
  proficiencyScore: number; // 0 - 100
  evidenceStrength: EvidenceStrength;
  evidenceCount: number;
  projectCount: number;
  confidence: number; // 0 - 100
  lastObserved: string;
  relatedTechnologies: string[];
  evidenceSummary: string;
}

export interface IntegritySignal {
  id: string;
  category: "Repository History" | "Contribution Consistency" | "Project Evolution" | "Code Pattern Signals" | "Development Continuity";
  score: number; // 0 - 100
  label: EvidenceStrength;
  description: string;
  findings: string[];
  isAnalyticalSignalOnly: true; // Explicit ethical flag
  confidenceInterval: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  repositoryId: string;
  role: string;
  period: string;
  technologies: string[];
  evidenceStrength: EvidenceStrength;
  highlightMetrics: {
    commits: number;
    files: number;
    durationMonths: number;
  };
}

export interface CareerMatch {
  roleTitle: string;
  matchPercentage: number;
  alignment: RoleAlignment;
  demonstratedSkills: string[];
  evidenceBackedStrengths: string[];
  missingEvidenceAreas: string[];
  recommendedProjects: string[];
  roleDescription: string;
}

export interface ActivityEvent {
  id: string;
  type: "commit" | "pr" | "analysis" | "verification" | "skill_update";
  title: string;
  description: string;
  repository?: string;
  timestamp: string;
  skill?: string;
}

export interface Analysis {
  id: string;
  repositoryId: string;
  repositoryName: string;
  status: "idle" | "running" | "completed" | "failed";
  progressPercent: number;
  currentStepIndex: number;
  currentStepLabel: string;
  startedAt: string;
  completedAt?: string;
  steps: {
    id: number;
    title: string;
    description: string;
    status: "pending" | "in_progress" | "completed";
  }[];
}

export interface AnalysisReport {
  id: string;
  repositoryId: string;
  repositoryName: string;
  owner: string;
  generatedAt: string;
  overallEvidenceScore: number;
  overallIntegrityScore?: number;
  primaryArchetype?: string;
  totalCommitsAnalyzed?: number;
  totalPRsAnalyzed?: number;
  linesOfCodeAnalyzed?: number;
  architecturalFindings?: string[];
  topDemonstratedSkills?: string[];
  evidenceStrength: EvidenceStrength;
  summary: string;
  repositoryStats: {
    totalCommits: number;
    totalContributors: number;
    primaryLanguage: string;
    linesOfCode: number;
    architectureType: string;
    documentationScore: number;
    testRatio: string;
  };
  skillBreakdown: Skill[];
  integrityBreakdown: {
    overallScore: number;
    signals: IntegritySignal[];
    note: string;
  };
  recommendations: string[];
  codeIntegrity?: {
    overallScore: number;
    signals: IntegritySignal[];
  };
  summaryNarrative?: string;
  evidenceTraceabilityHash?: string;
}

export interface DeveloperProfile {
  user: User;
  github: GitHubAccount;
  evidenceScore: number;
  evidenceStrength: EvidenceStrength;
  keyStats: {
    repositories: number;
    commits: number;
    pullRequests: number;
    projects: number;
    skillsVerified: number;
    evidenceDataPoints: number;
  };
  skills: Skill[];
  topProjects: Project[];
  integritySignals: IntegritySignal[];
  careerMatches: CareerMatch[];
  recentActivity: ActivityEvent[];
  metrics?: {
    totalContributions: number;
    repositoriesCount: number;
    technologiesCount: number;
    skillsCount?: number;
    overallIntegrityScore?: number;
    evidenceSignalsCount?: number;
  };
}
