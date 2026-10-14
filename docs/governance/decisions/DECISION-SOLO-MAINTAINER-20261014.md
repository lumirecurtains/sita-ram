# Human Governance Decision Record: Solo-Maintainer Dual-Verification Model

**Record Identifier**: DECISION-SOLO-MAINTAINER-20261014  
**Lifecycle Target**: Delivery Lifecycle Stage 7 / Stage 9 PR Review Protocol  
**Authority**: Project Owner / Chief Technology Officer (Explicit Sign-Off, 2026-10-14)  
**Date**: 2026-10-14  
**Repository**: `C:/Users/Lex-leo/Sita-Ram` (`https://github.com/lumirecurtains/sita-ram`)  
**Status**: **RATIFIED & APPROVED**

---

## 1. Context & Operational Reality

The Sita Ram Master Delivery Lifecycle Specification (Stages 0–7) mandates rigorous, independent verification prior to integrating changes into `main`. In multi-engineer teams, this requirement is fulfilled through peer review between distinct human engineers.

In the Sita Ram OS repository, the Project Owner operates as a sole human maintainer with no secondary human peer reviewer available. GitHub's native pull request rulesets prohibit pull request authors from approving their own PRs.

To prevent governance deadlock while strictly upholding engineering integrity:

1. Automated AI security audits must NEVER be logged as or substituted for human peer reviews.
2. The solo human maintainer retains ultimate architectural, operational, and legal responsibility for all repository releases.
3. The delivery process must enforce rigorous separation between deterministic machine validation, autonomous adversarial AI audits, and human release authority.

On 2026-10-14, the Project Owner formally convened the governance gate and issued explicit ratification:

> _"I approve the revised solo-maintainer governance decision in principle and explicitly acknowledge the residual risk of having zero required independent human approvals."_

---

## 2. Four-Layer Solo-Maintainer Verification Model

Every pull request targeting `main` must satisfy four distinct verification layers prior to merge. Enforced platform controls are strictly distinguished from documented workflow requirements:

| Verification Layer                                 | Nature of Control                     | Mechanism & Producer                                                                                                                                  | Failure & Enforcement Semantics                                                                          |
| :------------------------------------------------- | :------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| **Layer 1: CI Validation (`Validate Monorepo`)**   | **Enforced Platform Control**         | GitHub Actions Runner executing clean install (`npm ci`), Prettier format check, ESLint static analysis, TypeScript `tsc -b`, and offline unit tests. | **Enforced on GitHub**. GitHub physically blocks merging if this check fails.                            |
| **Layer 2: Local Emulator Behavioral Tests**       | **Documented Workflow Requirement**   | Local execution of behavioral Firestore security rules suite (38 / 38 passed) against Google Cloud Firestore Emulator.                                | **Documented Pre-Commit Discipline**. Mandatory local prerequisite; not an enforced GitHub status check. |
| **Layer 3: Autonomous Adversarial Security Audit** | **Documented Governance Requirement** | Static AST evaluation and threat modeling covering multi-tenant isolation, spoofing, query scoping, and immutability.                                 | **Documented Governance Prerequisite**. Provides automated evidence; not an automated platform check.    |
| **Layer 4: Owner Executive Gate Sign-Off**         | **Documented Governance Requirement** | Documented human gate sign-off by the Project Owner / CTO recording scope containment and risk acknowledgment.                                        | **Documented Governance Prerequisite**. Mandatory administrative sign-off; not a GitHub review approval. |

---

## 3. Disambiguation of Governance Terminology & Evidence

1. **AI Security Audits (`M0-FIX-03-INDEPENDENT-SECURITY-AUDIT-20261014.md` / `M0-FIX-03-PR-INDEPENDENT-REVIEW-20261014.md`)**:
   - Classified strictly as _Automated Adversarial Analysis_.
   - Evaluates rule ASTs, test assertions, and adversarial attack vectors.
   - Does NOT constitute human peer review, statutory certification, or legal sign-off.
2. **GitHub Review Approval Event**:
   - The platform-level UI checkbox. In a solo-maintainer setting without a second human seat, requiring $\ge 1$ approval creates an impassable platform dependency.
3. **Owner Gate Decision (`STAGE-7-HUMAN-GATE` / `DECISION-WORK-AUTH` / `DECISION-SOLO-MAINTAINER`)**:
   - The sole authoritative human sign-off governing repository releases.

---

## 4. GitHub Ruleset Configuration (`Protect main — Sita Ram`)

To reflect the solo-maintainer model without introducing bypass actors or compromising branch integrity, the GitHub repository ruleset `Protect main — Sita Ram` is configured as follows:

- **Source of Evidence**: Configuration established via Project Owner declaration and screenshots (2026-10-14). _No direct GitHub API inspection was conducted._
- **Enforced Rules**:
  1. `Require a pull request before merging`: **ACTIVE** (Direct pushes to `main` remain strictly prohibited).
  2. `Required approvals`: **0** (Accurately reflects the absence of a second human reviewer while preserving the PR workflow).
  3. `Required status checks to pass`: **ACTIVE** (`Validate Monorepo` must pass before merge).
  4. `Require branches to be up to date before merging`: **ACTIVE**.
  5. `Require conversation resolution`: **ACTIVE**.
  6. `Block force pushes`: **ACTIVE**.
  7. `Do not allow deletions`: **ACTIVE**.
  8. `Bypass list`: **EMPTY** (Zero bypass actors or administrative loopholes).

---

## 5. Strict Separation of Governance Model from Merge Authorization

Ratification of this Solo-Maintainer Decision Record establishes the operational framework for solo-maintainer governance only. **It does NOT authorize the merge of PR #1.**

- Merging PR #1 remains a separate, explicit executive gate decision.
- PR #1 **must remain unmerged** until the Project Owner convenes the Stage 7 Release Gate, conducts final review of all evidence, and issues explicit human authorization to merge.
- The AI pair programmer has zero authority to merge, approve, or modify PR #1.

---

## 6. Residual Risk Disclosure & Mandatory Owner Risk Acceptance

1. **Absence of Independent Human Peer Review**:
   - Operating with zero required GitHub approvals removes independent human four-eyes verification prior to merge.
   - The Project Owner **has affirmatively acknowledged and accepted** the residual risk of operating with zero required independent human approvals upon ratification of this decision record on 2026-10-14.
2. **Compensating Controls**:
   - Mandatory passing of Layer 1 (GitHub Actions `Validate Monorepo`), local verification of Layer 2 (38 emulator behavioral tests), and completion of Layer 3 (autonomous adversarial security audits).
3. **Sole Maintainer Accountability**:
   - The Project Owner retains sole legal, architectural, and operational responsibility for code integrated into `main`.

---

## 7. Status of Unresolved Governance Register Items

Adopting this governance decision record does **NOT** resolve or close open register items:

- **`HRD-01` (Remote Branch Protection on `origin/main`)**: Remains **`OPEN / UNRESOLVED`**. The ruleset `Protect main — Sita Ram` establishes operational protection on GitHub, but formal policy closure in the governance register requires a separate ratified addendum. The applicable governance gate for formal branch-protection policy closure remains blocked until this decision is made.
- **`HRD-02` (Gate Reviewer Delegation Authority)**: Remains **`OPEN / UNRESOLVED`**. No delegation policy exists; the Project Owner remains the sole human release authority. The applicable governance gate for delegation remains blocked until this decision is made.
- **`WORK-AUTH-01` (M0-FIX-02 Scope)**: Remains **`OPEN / UNRESOLVED (STRICTLY UNAUTHORIZED)`**. The applicable implementation gate remains blocked.
- **`WORK-AUTH-01` (Correction #4 Scope)**: Remains **`OPEN / UNRESOLVED (STRICTLY UNAUTHORIZED)`**. The applicable implementation gate remains blocked.

---

## 8. Chronological Reconciliation & Historical Document Integrity

1. **Preservation of Baseline Documents (Policy Constraint PC-12)**:
   - In accordance with audit trail immutability, historical records [`STAGE-7-HUMAN-GATE-20261014.md`](file:///C:/Users/Lex-leo/Sita-Ram/docs/governance/decisions/STAGE-7-HUMAN-GATE-20261014.md) and [`ADDENDUM-GOV-20261013-01.md`](file:///C:/Users/Lex-leo/Sita-Ram/docs/governance/addenda/ADDENDUM-GOV-20261013-01.md) remain strictly unedited.
2. **Specific Scope of Authorization**:
   - The implementation authorization granted in [`DECISION-WORK-AUTH-M0-FIX-03-20261014.md`](file:///C:/Users/Lex-leo/Sita-Ram/docs/governance/decisions/DECISION-WORK-AUTH-M0-FIX-03-20261014.md) superseded earlier blanket prohibitions strictly and exclusively for **M0-FIX-03**.
3. **Reaffirmation of Standing Prohibitions**:
   - **`M0-FIX-02` remains STRICTLY NOT AUTHORIZED and NOT STARTED.**
   - **`Correction #4` remains STRICTLY NOT AUTHORIZED and NOT STARTED.**
   - Zero application code, contract, or test changes outside of M0-FIX-03 are authorized.
