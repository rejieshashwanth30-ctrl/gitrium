/**
 * ADYK Gitrium — Product Feature Configuration & Flags
 * Controls gated or in-validation feature rollouts across production surfaces.
 */

export const FEATURE_FLAGS = {
  /**
   * Career Match:
   * Temporarily disabled from primary navigation for production stability while core
   * project analysis, skill evidence, multi-user isolation, and AI interpretation take precedence.
   * Direct visits to /career or /career-match display an evidence-focused Coming Soon view.
   *
   * Toggle to true once multi-user role matching satisfies all validation criteria.
   */
  CAREER_MATCH: false,
};
