export const PRODUCT_INFO = {
  name: "ADYK GITRIUM",
  tagline: "THE TRUSTED VAULT OF CODE EVIDENCE",
  statement: "Don't just claim your engineering skills. Prove them through your work.",
  description:
    "Gitrium is an evidence-backed developer intelligence platform that analyzes your GitHub repositories, contributions, project history and development activity to build an evidence-backed view of your engineering skills.",
  company: "ADYK Multi Venture Company",
  founder: {
    name: "Rejiesh Ashwanth",
    role: "Co-Founder — ADYK Multi Venture Company",
    linkedin: "https://www.linkedin.com/in/rejiesh-ashwanth-v-33ab1b37b",
    x: "https://x.com/rejieshashhh",
  },
  social: {
    linkedin: "https://www.linkedin.com/in/adyk-a-multi-venture-company-38782a431",
    instagram: "https://www.instagram.com/buildby.adyk",
    x: "https://x.com/adyk_inn",
  },
};

export const NAV_LINKS = [
  { label: "Product", href: "#what-gitrium-does" },
  { label: "Features", href: "#features" },
  { label: "Evidence Graph", href: "#evidence-graph" },
  { label: "Integrity", href: "#integrity" },
  { label: "Career", href: "#career" },
  { label: "About", href: "#about" },
];

export const MOBILE_NAV_LINKS = [
  { label: "Product", href: "#what-gitrium-does" },
  { label: "Features", href: "#features" },
  { label: "Evidence Graph", href: "#evidence-graph" },
  { label: "Integrity", href: "#integrity" },
  { label: "Career", href: "#career" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const DASHBOARD_NAV = [
  { label: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Repositories", href: "/repositories", icon: "GitFork" },
  { label: "Contributions", href: "/contributions", icon: "GitCommit" },
  { label: "Skills", href: "/skills", icon: "Cpu" },
  { label: "Evidence", href: "/evidence", icon: "FileCode" },
  { label: "Code Integrity", href: "/integrity", icon: "ShieldCheck" },
  { label: "Analysis Engine", href: "/analysis", icon: "Scan" },
  { label: "Career Match", href: "/career", icon: "Briefcase" },
  { label: "Reports", href: "/reports", icon: "FileText" },
  { label: "Profile", href: "/profile", icon: "UserCheck" },
  { label: "Settings", href: "/settings", icon: "Settings" },
];

export const ANALYSIS_STAGES = [
  { id: 1, title: "Connecting to repository", description: "Authenticating and fetching branch metadata & tree refs" },
  { id: 2, title: "Reading repository structure", description: "Parsing directory hierarchy, configuration files, and manifests" },
  { id: 3, title: "Reading commit history", description: "Traversing commit DAG, diff sizes, authorship timestamp deltas" },
  { id: 4, title: "Mapping contributors", description: "Correlating author signatures, co-authors, and PR ownership" },
  { id: 5, title: "Analyzing technologies", description: "Detecting frameworks, runtimes, package dependencies, and toolchains" },
  { id: 6, title: "Analyzing project evolution", description: "Evaluating architectural refactors, modularity shifts, and cadence" },
  { id: 7, title: "Extracting skill evidence", description: "Isolating concrete code patterns, test suites, API implementations" },
  { id: 8, title: "Evaluating integrity signals", description: "Analyzing commit continuity, external source signals, history depth" },
  { id: 9, title: "Building evidence graph", description: "Synthesizing relational nodes connecting repositories to skills" },
  { id: 10, title: "Generating audit report", description: "Compiling verifiable findings, confidence bounds, and recommendations" },
];
