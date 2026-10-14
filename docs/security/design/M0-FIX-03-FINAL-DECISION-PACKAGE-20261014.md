# Stage 3.2 Final Design Decision Package: M0-FIX-03 Idempotency Keys Security

**Document Identifier**: M0-FIX-03-FINAL-DECISION-PACKAGE-20261014  
**Work Item**: M0-FIX-03 (Tenant Isolation & Safe Lifecycle Handling for `idempotency_keys`)  
**Lifecycle Stage**: Pre-Implementation Governance Decision Package & Security Validation ONLY  
**Date**: 2026-10-14  
**Author**: Antigravity Autonomous Pair Programmer  
**Repository**: `C:/Users/Lex-leo/Sita-Ram`  
**Baseline Git HEAD**: `9125d7ac30a592579714d9bb947f5bdf8014f630`  
**Branch**: `main`  
**Governing Gate**: Sita Ram Master Delivery Lifecycle Specification (Locked Stages 0–7)  
**Status**: RECOMMENDATIONS & SECURITY VALIDATION RECORDED — PENDING FORMAL HUMAN AUTHORIZATION GATE (`WORK-AUTH-01`)  
**Implementation Authority**: STRICTLY NOT AUTHORIZED

---

## 1. Current Verified Status & Baseline

This decision package consolidates and synthesizes the findings of the prior security deliverables without repeating full technical audits:

1. **`CORRECTION-4-STAGE-1-DESIGN-20261014.md`**: Verified that test claims pass valid credentials; reclassified the issue as harness type safety and actor coverage (`HARNESS-TYPING-01`), confirming zero security bypass.
2. **`M0-FIX-03-STAGE-1-DESIGN-20261014.md`**: Confirmed critical security flaw in [`firestore.rules:147–149`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L147-L149) (`allow read, write: if isAuthenticated();`), which exposes all idempotency keys to unconstrained cross-tenant mutation and enumeration.
3. **`M0-FIX-03-STAGE-2-INDEPENDENT-REVIEW-20261014.md`**: Issued `CONDITIONAL PASS` and identified that all 8 domain entities in `firestore.rules` are flat root collections, recommending Alternative A (Root Collection) over Stage 1's Subcollection to preserve architectural homogeneity.
4. **`M0-FIX-03-STAGE-3-TEST-SPECIFICATION-20261014.md` (with Stage 3.1 Verification)**: Formulated 22 behavioral test cases across 12 dimensions; verified assumptions against canonical contracts; corrected customer vs. staff identifier models; and established fixture prerequisites.

### Repository Baseline Verification:

- **Baseline & Current HEAD**: `9125d7ac30a592579714d9bb947f5bdf8014f630` (100% synchronized with `origin/main`).
- **Working Tree**: Clean tracked files; zero modifications to application code, tests, rules, or configuration.
- **Static Quality Suite**: Prettier (`npm run format:check`), TypeScript (`npm run typecheck`), ESLint (`npm run lint`), and offline unit tests (`npm test`: 60/60 passing) all pass with exit code `0`.
- **Behavioral Test Suite**: Zero behavioral tests have been executed against an emulator; all 22 test cases represent formal paper specifications.

---

## 2. Recommended Design Decisions

The following recommendations represent engineering proposals based on repository evidence. They do **not** constitute or fabricate human governance approval.

### 2.1 DECISION-IDEM-PATH: Document Path & Structural Model

- **Recommendation**: **Retain Root Collection `/idempotency_keys/{keyId}`** with explicit tenant, actor, and role authorization.
- **Rationale**:
  1. _Architectural Homogeneity_: In [`firestore.rules:74–142`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L74-L142), every entity (`organizations`, `brands`, `outlets`, `customers`, `menu_items`, `orders`, `audit_logs`) is a top-level root collection. Retaining `/idempotency_keys/` at root level preserves 100% repository architectural consistency.
  2. _Security Reality_: Security in Firestore depends entirely on rule evaluation logic, not document path nesting. A subcollection without rules is insecure; a root collection with explicit tenant and actor authorization is robust.
  3. _Global Uniqueness_: Root keys enforce platform-wide uniqueness of the `IdempotencyKey` nominal type, eliminating accidental key collisions across outlets or brands.
  4. _Zero Client Path Rewrites_: Client applications targeting `/idempotency_keys/` require no URL/path restructuring.
- **Alternatives Considered**:
  - _Alternative B (Tenant Subcollection `/organizations/{orgId}/idempotency_keys/{keyId}`)_: Proposed in Stage 1 design. Rejected because it breaks architectural consistency with `/orders/` and `/audit_logs/`, requires client SDK query changes, and complicates customer order placement where the patron has no `orgId` membership.
- **Exact Evidence**:
  - [`firestore.rules:74–142`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L74-L142) (all 8 collections are root).
  - [`firestore.rules:138–142`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L138-L142) (append-only immutable root collection precedent).
  - [`packages/core-contracts/src/dtos/order.dto.ts:44–48`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/dtos/order.dto.ts#L44-L48) (`idempotencyKey` is bound to `orgId` as an attribute, not a path component).
- **Risks & Mitigations**:
  - _Risk_: Cross-tenant key collision or unauthorized query enumeration.
  - _Mitigation_: Rule enforces that `allow read` and `allow create` require `isTenantMember(resource.data.orgId) && isStaffMember(...)` or `resource.data.customerId == request.auth.uid`. Cross-tenant queries fail closed (`RUT-IDEM-22`).
- **Remaining Uncertainty**: None. High confidence.

---

### 2.2 DECISION-IDEM-PLATFORMADMIN-READ: PlatformAdmin Client Inspection Scope

- **Recommendation**: **DENY PlatformAdmin client read access to transient `/idempotency_keys/{keyId}` records by default.** `RUT-IDEM-19` will evaluate to `assertFails`.
- **Rationale**:
  1. _Principle of Least Privilege_: Idempotency keys are transient transactional deduplication artifacts that may carry sensitive customer payment or order operation hashes. They are not administrative governance records (unlike `organizations` or `audit_logs`).
  2. _Absence of Policy Justification_: In [`packages/core-contracts/src/scopes/index.ts:10–12`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/scopes/index.ts#L10-L12), `PlatformScopeContext` defines platform-level scope, but no architecture decision authorizes platform admin client inspection of idempotency keys.
  3. _Zero Privilege by Assumption_: As established during Stage 3.1 verification, privileges must not be introduced by assumption.
  4. _Trusted Server Administration_: Legitimate platform diagnostics, system health monitoring, and dispute resolution can be performed via the Firebase Admin SDK on trusted server infrastructure, bypassing client rules safely.
- **Alternatives Considered**:
  - _Grant PlatformAdmin Cross-Tenant Read_: Adding `isPlatformAdmin()` to `allow read`. Rejected as unnecessary for client SDK operations and potentially violating tenant data privacy boundaries.
- **Exact Evidence**:
  - [`packages/core-contracts/src/scopes/index.ts:10–12`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/scopes/index.ts#L10-L12) (`PlatformScopeContext`).
  - [`packages/core-contracts/src/enums/roles.ts:7`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/enums/roles.ts#L7) (`UserRole.PLATFORM_ADMIN`).
  - [`firestore.rules:16–25`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L16-L25) (helper functions).
- **Risks & Mitigations**:
  - _Risk_: Platform administrators cannot directly inspect a failed idempotency record from a client web UI.
  - _Mitigation_: Backend administrative services using Firebase Admin SDK can surface operational health dashboards safely without weakening client security rules.
- **Remaining Uncertainty**: Subject to formal Project Owner policy review if platform-level client monitoring is explicitly required in the future.

---

### 2.3 DECISION-IDEM-SCHEMA-ACTOR-KEY: Actor Identification Model

- **Recommendation**: **Retain separate, optional `userId` (for staff) and `customerId` (for patron) fields. Do NOT introduce a unified `actorId`/`actorType` schema.**
- **Rationale**:
  1. _Contract Fidelity & Zero-Change Compatibility_: In [`packages/core-contracts/src/identifiers/index.ts:20–23`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/identifiers/index.ts#L20-L23), `UserId` and `CustomerId` are distinct branded types (`UserId !== CustomerId`). `OrderDTO` explicitly binds `customerId: CustomerId` and tracks staff as `actorUserId?: UserId` in `statusHistory`. Retaining separate fields requires **zero modifications** to existing core contracts.
  2. _Smallest Safe Change_: Adopts the exact dual staff/customer authorization model already proven and deployed in [`firestore.rules:120–133`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L120-L133) for `/orders/`.
  3. _Avoids Unjustified Abstraction_: A unified `actorId` / `actorType` polymorphic schema would require creating new branded types, updating DTO schemas, writing custom Zod validators, and altering future client models without providing any additional security benefit.
- **Alternatives Considered**:
  - _Polymorphic Model (`actorId: string, actorType: 'STAFF' | 'CUSTOMER'`)_: Adds unnecessary indirection and breaks alignment with existing `OrderDTO` and Firestore rules conventions.
  - _Enforcing `userId` on All Records_: Rejected in Stage 3.1 because customer patrons have no `userId` or `orgId` claims.
- **Exact Evidence**:
  - [`packages/core-contracts/src/identifiers/index.ts:20–23`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/identifiers/index.ts#L20-L23) (`UserId` vs `CustomerId`).
  - [`packages/core-contracts/src/dtos/customer.dto.ts:13–20`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/dtos/customer.dto.ts#L13-L20) (`id: CustomerId`).
  - [`packages/core-contracts/src/dtos/order.dto.ts:48`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/dtos/order.dto.ts#L48) (`customerId: CustomerId`).
  - [`firestore.rules:120–133`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L120-L133) (dual staff/customer ownership in `/orders/`).
- **Risks & Mitigations**:
  - _Risk_: An actor might submit neither field, or submit conflicting fields.
  - _Mitigation_: Enforce strict mutual exclusivity on create (Staff create requires `userId` and forbids `customerId`; Customer create requires `customerId` and forbids `userId`).
- **Remaining Uncertainty**: None. Fully evidenced.

---

## 3. Initial Candidate Rule Set Under Evaluation

The baseline rule set evaluated during security validation was:

```javascript
match /idempotency_keys/{keyId} {
  // Read Authorization:
  // - PlatformAdmin: DENIED by default (DECISION-IDEM-PLATFORMADMIN-READ)
  // - Tenant staff: can read keys belonging to their organization
  // - Customers: can read ONLY keys matching their own authenticated customerId
  allow read: if isAuthenticated() && (
    (isTenantMember(resource.data.orgId) && isStaffMember(resource.data.orgId)) ||
    (resource.data.customerId == request.auth.uid) ||
    (resource.data.userId == request.auth.uid)
  );

  // Create Authorization:
  // - Mandatory fields: orgId and createdAtIso must be strings
  // - Staff path: caller must be member and staff of target orgId, and bind userId == request.auth.uid
  // - Customer path: caller must bind customerId == request.auth.uid
  allow create: if isAuthenticated() &&
    request.resource.data.orgId is string &&
    request.resource.data.createdAtIso is string &&
    (
      // 1. Staff Path:
      (
        request.resource.data.userId == request.auth.uid &&
        isTenantMember(request.resource.data.orgId) &&
        isStaffMember(request.resource.data.orgId)
      ) ||
      // 2. Customer Path:
      (
        request.resource.data.customerId == request.auth.uid
      )
    );

  // Client Updates and Deletions are Strictly Prohibited (Client Immutability):
  // Prevents replay attacks, cache poisoning, and transaction hijacking.
  // Trusted backend services (Admin SDK / Cloud Functions) bypass this restriction.
  allow update, delete: if false;
}
```

---

## 4. Candidate Rule Security Validation

### 4.1 Attack Scenario Evaluation Matrix

The initial candidate rule set above was rigorously evaluated against all 8 mandated attack scenarios:

| Scenario # | Attack Scenario Description                                                                                         | Rule Branch Evaluated                                | Evaluation Outcome         | Policy Alignment                   | Technical Justification & Codebase Citation                                                                                                                                                                                                                                                                                                                                                                                            |
| :--------- | :------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------- | :------------------------- | :--------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SC-01**  | Authenticated customer submits own `customerId` but an `orgId` of another organization.                             | `allow create` Branch 2 (Customer)                   | **ALLOW**                  | **MATCHES POLICY**                 | Customers are cross-tenant restaurant patrons ([`packages/core-contracts/src/dtos/customer.dto.ts`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/dtos/customer.dto.ts)). Like [`firestore.rules:125–128`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L125-L128) (`/orders/`), customers can create records targeting any organization, but read access remains strictly bound to their authentic `customerId`. |
| **SC-02**  | Staff user supplies own `userId` but has no valid membership or staff role in target `orgId`.                       | `allow create` Branch 1 (Staff)                      | **DENY**                   | **MATCHES POLICY**                 | `isTenantMember(targetOrgId)` evaluates to `false` because `request.auth.token.orgId != targetOrgId` ([`firestore.rules:20–25`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L20-L25)). Branch 1 fails closed.                                                                                                                                                                                                                    |
| **SC-03**  | Staff user attempts to read record using `userId == request.auth.uid` branch while lacking valid tenant membership. | `allow read` Branch 3 (`userId == request.auth.uid`) | **ALLOW (UNSAFE)**         | **FAILS POLICY (CRITICAL DEFECT)** | **VULNERABILITY IDENTIFIED**: The standalone disjunction `(resource.data.userId == request.auth.uid)` in `allow read` does NOT verify `isTenantMember(resource.data.orgId)`. A former staff member whose token `orgId` changed can read cross-tenant records they previously authored, bypassing tenant scoping!                                                                                                                       |
| **SC-04**  | Customer attempts to read a staff-created POS idempotency record.                                                   | `allow read` (All branches)                          | **DENY**                   | **MATCHES POLICY**                 | Customer fails `isTenantMember` (no staff claim), fails `resource.data.customerId == request.auth.uid` (staff key has no customerId), and fails `userId == uid`. Fails closed.                                                                                                                                                                                                                                                         |
| **SC-05**  | Staff member attempts to read a customer record outside member's authorized tenant.                                 | `allow read` (All branches)                          | **DENY**                   | **MATCHES POLICY**                 | Staff of Tenant B fails `isTenantMember(org_A)` ([`firestore.rules:20–25`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L20-L25)), fails `customerId == uid`, and fails `userId == uid`. Fails closed.                                                                                                                                                                                                                            |
| **SC-06**  | PlatformAdmin attempts client reads, creates, updates, and deletes.                                                 | `allow read, create, update, delete`                 | **DENY ALL**               | **MATCHES POLICY**                 | PlatformAdmin lacks staff roles in `isStaffMember` ([`firestore.rules:40–49`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L40-L49)), lacks `customerId`, and is blocked by `update, delete: if false;`. Satisfies `DECISION-IDEM-PLATFORMADMIN-READ`.                                                                                                                                                                            |
| **SC-07**  | Caller supplies both `userId` and `customerId`, omits one, or submits mismatched actor fields.                      | `allow create` (Branch 1 vs Branch 2)                | **PARTIAL ALLOW (UNSAFE)** | **FAILS POLICY (SECURITY DEFECT)** | **ACTOR INJECTION DEFECT**: Branch 2 allows an arbitrary `userId` to be saved as long as `customerId == uid`. Branch 1 allows an arbitrary `customerId` to be saved if `userId == uid`. This causes actor confusion and violates nominal type purity ([`packages/core-contracts/src/identifiers/index.ts:20–23`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/identifiers/index.ts#L20-L23)).                         |
| **SC-08**  | Client attempts overwrite, update, delete, and collection enumeration.                                              | `allow update, delete: if false;` & query evaluator  | **DENY ALL**               | **MATCHES POLICY**                 | Calling `.set()` on an existing doc triggers the `update` rule (fails closed). Client `update` and `delete` fail closed. Unscoped queries fail closed because constraints cannot satisfy rules.                                                                                                                                                                                                                                        |

---

### 4.2 Unsafe Branches & Missing Invariants Identified

The security validation discovered two specific rule defects in the initial candidate draft:

1. **Defect 1: Unsafe Standalone `userId` Read Branch (Scenario 3)**:
   - _Flaw_: Line 116 (`resource.data.userId == request.auth.uid`) allows any authenticated user matching the document's `userId` to read the document regardless of their current organization membership.
   - _Invariant Violated_: `INV-IDEM-02` (Staff read access must always be tenant-scoped: `isTenantMember(orgId) && isStaffMember(orgId)`).
   - _Remediation_: Completely remove the standalone `(resource.data.userId == request.auth.uid)` branch from `allow read`. Staff read access is already 100% covered by `(isTenantMember(resource.data.orgId) && isStaffMember(resource.data.orgId))`. Customer read access is covered by `(resource.data.customerId == request.auth.uid)`.

2. **Defect 2: Actor Field Injection & Confusion (Scenario 7)**:
   - _Flaw_: `allow create` allows a customer to inject an arbitrary `userId` field into the document, or a staff member to inject an arbitrary `customerId`.
   - _Invariant Violated_: Nominal identifier purity and strict segregation of patron vs. staff identity contexts (`UserId !== CustomerId`).
   - _Remediation_: Enforce strict field exclusivity on document creation:
     - For Staff path: `request.resource.data.userId == request.auth.uid` AND `!('customerId' in request.resource.data)`.
     - For Customer path: `request.resource.data.customerId == request.auth.uid` AND `!('userId' in request.resource.data)`.

3. **Defect 3: Query Ambiguity Resolution (Scenario 8)**:
   - _Flaw_: Combining `get` and `list` under a disjunctive `allow read` can cause ambiguous query evaluation in Firestore client SDKs.
   - _Remediation_: Split `allow read` into explicit, deterministic `allow get` and `allow list` blocks.

---

### 4.3 Minimum Required Hardened Candidate Rule Set

Incorporating the remediation for Defects 1, 2, and 3, the final hardened candidate rule specification is:

```javascript
match /idempotency_keys/{keyId} {
  // Read Authorization:
  // - PlatformAdmin: DENIED (DECISION-IDEM-PLATFORMADMIN-READ)
  // - Tenant staff: can read keys belonging to their organization
  // - Customers: can read ONLY keys matching their own authenticated customerId
  allow get: if isAuthenticated() && (
    (isTenantMember(resource.data.orgId) && isStaffMember(resource.data.orgId)) ||
    (resource.data.customerId == request.auth.uid)
  );

  allow list: if isAuthenticated() && (
    (isTenantMember(resource.data.orgId) && isStaffMember(resource.data.orgId)) ||
    (resource.data.customerId == request.auth.uid)
  );

  // Create Authorization:
  // - Mandatory fields: orgId and createdAtIso must be strings
  // - Staff path: caller must be member and staff of target orgId, bind userId == request.auth.uid, and NOT set customerId
  // - Customer path: caller must bind customerId == request.auth.uid, and NOT set userId
  allow create: if isAuthenticated() &&
    request.resource.data.orgId is string &&
    request.resource.data.createdAtIso is string &&
    (
      // 1. Staff Path (Field Exclusivity Enforced):
      (
        request.resource.data.userId == request.auth.uid &&
        !('customerId' in request.resource.data) &&
        isTenantMember(request.resource.data.orgId) &&
        isStaffMember(request.resource.data.orgId)
      ) ||
      // 2. Customer Path (Field Exclusivity Enforced):
      (
        request.resource.data.customerId == request.auth.uid &&
        !('userId' in request.resource.data)
      )
    );

  // Client Updates and Deletions are Strictly Prohibited (Client Immutability):
  // Prevents replay attacks, cache poisoning, and transaction hijacking.
  // Trusted backend services (Admin SDK / Cloud Functions) bypass this restriction.
  allow update, delete: if false;
}
```

---

### 4.4 Final Implementation-Readiness Verdict

$$\mathbf{VERDICT:\ PASS\ (CONDITIONAL\ ON\ HARDENED\ RULE\ ADOPTION)}$$

The candidate rule design is sound, fully justified, and thoroughly validated. Adoption of the hardened rule specification in Section 4.3 successfully closes all 8 attack vectors. Implementation remains strictly gated pending formal human authorization (`WORK-AUTH-01`).

---

## 5. Unresolved Technical Matters

1. **Fixture Seeding Requirement**: `seedBaselineFixtures()` in [`tests/security/rules-test-helper.ts:98–148`](file:///C:/Users/Lex-leo/Sita-Ram/tests/security/rules-test-helper.ts#L98-L148) must seed `idem_live_01` (Tenant A staff key) and `idem_cust_ananya_01` (Customer Ananya key) before behavioral tests can execute in Stage 4.
2. **Actor Helper Typing Expansion (`Correction #4`)**: The type-safe actor helpers designed in `CORRECTION-4-STAGE-1-DESIGN-20261014.md` should be leveraged during Stage 4 implementation to prevent stringly-typed claim errors.
3. **Future Backend & Lifecycle Services**: As clarified in Stage 3.1, server-side status updates (`PENDING` $\to$ `COMPLETED`) via Admin SDK, client retry handling logic, and TTL purge workers remain future architecture milestones and are not implemented today.

---

## 6. Stage 4 Implementation Gate Prerequisites

Before Stage 4 (Implementation) can begin, the following **mandatory conditions** must be formally satisfied:

1. **Formal Governance Authorization (`WORK-AUTH-01`)**:
   Formal approval for Stage 4 execution must be recorded through the authorized governance decision process by the Project Owner.
2. **Approved Policy Documentation**:
   The selected path (`/idempotency_keys/{keyId}`), denial of PlatformAdmin client read, dual `userId`/`customerId` actor binding with field exclusivity, and split `get`/`list` rules must be formally ratified.
3. **Behavioral Test Specification Alignment**:
   [`docs/security/design/M0-FIX-03-STAGE-3-TEST-SPECIFICATION-20261014.md`](file:///C:/Users/Lex-leo/Sita-Ram/docs/security/design/M0-FIX-03-STAGE-3-TEST-SPECIFICATION-20261014.md) must be confirmed as the authoritative behavioral test baseline.
4. **Fixture & Emulator Setup Readiness**:
   Required baseline fixtures and local Firestore emulator configuration must be staged.
5. **Strict Prohibitions Enforced**:
   `M0-FIX-02` and `Correction #4` must remain strictly prohibited from implementation unless separately authorized.
6. **Sequential Workflow Separation**:
   Implementation, testing, independent audit, documentation, and Git delivery must remain separate, sequentially gated workflows.

> [!IMPORTANT]
> The presence of these recommendations does **NOT** satisfy the gate conditions. Stage 4 remains strictly blocked pending formal human authorization.

---

## 7. Explicit Non-Authorization Statement

In strict compliance with the locked Sita Ram Master Delivery Lifecycle Specification (Stages 0–7):

- **This document represents a pre-implementation design decision package ONLY.**
- **No implementation authorization is granted by this document.**
- **Zero human approvals have been assumed or fabricated.**
- **`M0-FIX-03`, `M0-FIX-02`, and `Correction #4` remain STRICTLY NOT AUTHORIZED and NOT STARTED for implementation.**
- **Zero lines of application code, security rules (`firestore.rules`), test code, or configurations were modified.**
- **Zero Git commits, pushes, tags, deployments, or remote Firebase changes were performed.**
