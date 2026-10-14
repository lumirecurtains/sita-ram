# Human Governance Gate Decision Record: M0-FIX-03 Implementation Authorization

**Record Identifier**: DECISION-WORK-AUTH-M0-FIX-03-20261014  
**Target Work Item**: M0-FIX-03 (Tenant Isolation & Safe Lifecycle Handling for `idempotency_keys`)  
**Lifecycle Transition**: Stage 3 (Design/Specification) → Stage 4 (Controlled Implementation)  
**Status**: **RATIFIED & APPROVED**  
**Ratification Date**: 2026-10-14  
**Authority**: Project Owner / Chief Technology Officer (Explicit Sign-off, 2026-10-14)  
**Repository**: `C:\Users\Lex-leo\Sita-Ram`  
**Git Baseline Commit**: `9125d7ac30a592579714d9bb947f5bdf8014f630`

---

## 1. Executive Summary & Authorization Scope

On 2026-10-14, the Project Owner formally convened the governance gate and issued explicit approval:

> _"I approve DECISION-WORK-AUTH-M0-FIX-03-20261014. I authorize controlled implementation of M0-FIX-03 only, under the proposed technical decisions and scope. M0-FIX-02 and Correction #4 remain unauthorized."_

This decision enacts Stage 4 (Controlled Implementation) strictly and exclusively for **M0-FIX-03**, ratifying the technical determinations documented in [`docs/security/design/M0-FIX-03-FINAL-DECISION-PACKAGE-20261014.md`](file:///C:/Users/Lex-leo/Sita-Ram/docs/security/design/M0-FIX-03-FINAL-DECISION-PACKAGE-20261014.md).

---

## 2. Ratified Technical Decisions

1. **`DECISION-IDEM-PATH`**: **Alternative A (Root Collection `/idempotency_keys/{keyId}`)** is formally adopted, preserving repository-wide architectural homogeneity with `/orders/` and `/audit_logs/`.
2. **`DECISION-IDEM-PLATFORMADMIN-READ`**: PlatformAdmin client read access to transient idempotency records is **DENIED by default** under least-privilege principles.
3. **`DECISION-IDEM-SCHEMA-ACTOR-KEY`**: The canonical dual identifier model (`userId` for staff, `customerId` for patrons) is formally ratified with create-time field exclusivity. A unified polymorphic model is rejected.
4. **Hardened Candidate Rule Specification**: Section 4.3 of the decision package is ratified, enforcing split `allow get` and `allow list` blocks and client immutability (`allow update, delete: if false;`).

---

## 3. Strict Technical Boundaries for Stage 4

- **Authorized Implementation Scope**:
  1. `firestore.rules`: Replace placeholder lines 147–149 with the ratified hardened rule set.
  2. `tests/security/rules-test-helper.ts`: Seed baseline idempotency fixtures (`idem_live_01` for Tenant A, and `idem_cust_ananya_01` for Customer Ananya) in `seedBaselineFixtures()`.
  3. `tests/security/firestore-rules.behavioral.test.ts`: Implement behavioral test cases `RUT-IDEM-01` through `RUT-IDEM-22`.
- **Workflow Isolation**:
  - Implementation is performed as Stage 4 only.
  - Zero commits, pushes, tags, or deployments are authorized during Stage 4.
  - Advancing to Release / Delivery requires subsequent completion of Stage 5 (Testing), Stage 6 (Independent Audit), and Stage 7 (Commit Gate).

---

## 4. Reaffirmation of Standing Prohibitions

- **`M0-FIX-02` remains STRICTLY NOT AUTHORIZED and NOT STARTED.**
- **`Correction #4` remains STRICTLY NOT AUTHORIZED and NOT STARTED.**
- **Zero unrelated application code, package, or configuration modifications are authorized.**

---

## 5. Ratification Sign-Off Record

| Signatory Role          | Name / Identifier   | Decision     | Date       |
| :---------------------- | :------------------ | :----------- | :--------- |
| **Project Owner / CTO** | Authorized Operator | **APPROVED** | 2026-10-14 |
