# GSD Workflows Mapping

This file lists the recommended workflows (skills) to be run to achieve the goals defined in the GSD roadmap (`.gsd/ROADMAP.md`). These workflows can be invoked to systematically improve the project.

---

## 🚀 Phase 1.8: Advanced Analytics & UX

### Performance Audit
*   **Goal**: "Optimize bundle size and Framer Motion animations."
*   **Recommended Workflow**: `react-component-performance`
*   **Action**: Use this workflow to analyze component render cycles, optimize heavy components, and ensure smooth animations. It helps diagnose slow React components and suggest targeted fixes.

---

## 📅 Phase 2.0: Production Launch

### Compliance
*   **Goal**: "Ensure GDPR/CCPA readiness for local data handling."
*   **Recommended Workflow**: `gdpr-data-handling`
*   **Action**: Use this workflow to audit local storage practices and ensure proper data portability (export/import) and deletion capabilities, aligning with privacy regulations.

### Deployment
*   **Goal**: "Optimize Vercel configuration for the PWA."
*   **Recommended Workflow**: `vercel-deployment`
*   **Action**: Use this workflow to review `vercel.json` and ensure optimal caching and performance settings for the production deployment.

### Final Security Review
*   **Goal**: "Final review of encryption and local storage safety."
*   **Recommended Workflow**: `007` (or `security-auditor`)
*   **Action**: Run this workflow again after implementing the database encryption (Phase 1.6) to verify that the vulnerabilities identified in the previous audit have been resolved.

---

## 🛠️ Continuous Improvement

### Accessibility (A11y)
*   **Goal**: Ensure a premium, inclusive experience.
*   **Recommended Workflow**: `ui-a11y`
*   **Action**: Audit the StyleSeed-based components or pages for WCAG 2.2 AA issues and apply practical accessibility fixes.

---

## How to Run These Workflows
To run any of these workflows, you can prompt the agent like this:
`@<workflow-name> analyze the project and implement the goals for Phase X.`
