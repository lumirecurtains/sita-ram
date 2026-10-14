# Stage 2 Independent Design Review: M0-FIX-03 Idempotency Keys Security & Scoping

**Document Identifier**: M0-FIX-03-STAGE-2-INDEPENDENT-REVIEW-20261014  
**Work Item**: M0-FIX-03 (Tenant Scoping & Safe Lifecycle Handling for `idempotency_keys`)  
**Lifecycle Stage**: Stage 2 — Independent Design Review  
**Date**: 2026-10-14  
**Author**: Independent Architecture & Security Gate Reviewer  
**Repository**: `C:/Users/Lex-leo/Sita-Ram`  
**Baseline Git HEAD**: `9125d7ac30a592579714d9bb947f5bdf8014f630`  
**Target Document Reviewed**: [`docs/security/design/M0-FIX-03-STAGE-1-DESIGN-20261014.md`](file:///C:/Users/Lex-leo/Sita-Ram/docs/security/design/M0-FIX-03-STAGE-1-DESIGN-20261014.md)  
**Governing Framework**: Sita Ram Master Delivery Lifecycle Specification (Locked Stages 0–7)  
**Review Verdict**: **CONDITIONAL PASS** (Ready for Human Gate Decision `WORK-AUTH-01`)

---

## 1. Baseline & Evidence Inventory

Prior to conducting this independent evaluation, the repository state was verified against authoritative references:

| Verification Target     | Expected State                                 | Actual Observed State                                     | Status        |
| :---------------------- | :--------------------------------------------- | :-------------------------------------------------------- | :------------ |
| **Git Baseline HEAD**   | `9125d7ac30a592579714d9bb947f5bdf8014f630`     | `9125d7ac30a592579714d9bb947f5bdf8014f630`                | **VERIFIED**  |
| **Current Branch**      | `main`                                         | `main`                                                    | **VERIFIED**  |
| **Remote Parity**       | Synchronized with `origin/main`                | In sync (`Your branch is up to date with 'origin/main'.`) | **VERIFIED**  |
| **Tracked Changes**     | 0 modified tracked files                       | 0 modified tracked files (`git diff` is empty)            | **CLEAN**     |
| **Untracked Documents** | Design deliverables in `docs/security/design/` | `CORRECTION-4-...md` and `M0-FIX-03-...md` preserved      | **PRESERVED** |

### Authoritative Repository Code Citations Inspected

1. [`firestore.rules:147–149`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L147-L149): Current active rule:
   ```javascript
   match /idempotency_keys/{keyId} {
     allow read, write: if isAuthenticated();
   }
   ```
2. [`firestore.rules:12–63`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L12-L63): Helper functions: `isAuthenticated()`, `isPlatformAdmin()`, `isTenantMember(orgId)`, `hasRole(role)`, `isStaffMember(orgId)`, `isCustomerOwner(customerId)`.
3. [`firestore.rules:138–142`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L138-L142): Canonical append-only audit trail rules on `/audit_logs/{logId}`.
4. [`firestore.rules:120–133`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L120-L133): Order collection rules illustrating dual staff/customer ownership models.
5. [`packages/core-contracts/src/identifiers/index.ts:4–13`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/identifiers/index.ts#L4-L13): ADR-025 tripartite model defining `ClientOperationId`, `IdempotencyKey`, and `ServerRecordId`.
6. [`packages/core-contracts/src/dtos/order.dto.ts:44`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/dtos/order.dto.ts#L44): Order DTO structure mandating `idempotencyKey: IdempotencyKey` alongside `orgId` and `customerId`.
7. [`packages/core-contracts/src/dtos/payment.dto.ts:10`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/dtos/payment.dto.ts#L10): Payment intent mandating `idempotencyKey: IdempotencyKey`.
8. [`apps/`](file:///C:/Users/Lex-leo/Sita-Ram/apps): Application directory containing only `.gitkeep`.
9. [`tests/security/firestore-rules.behavioral.test.ts`](file:///C:/Users/Lex-leo/Sita-Ram/tests/security/firestore-rules.behavioral.test.ts): 16 active behavioral tests; zero tests exercising `idempotency_keys`.

---

## 2. Independent Vulnerability Verdict & Severity Rationale

### Independent Verdict: **CRITICAL SECURITY FLAW CONFIRMED (P1)**

The vulnerability reported in the Red Team Audit and Stage 1 design is **100% verified by actual rules logic**.

### Severity Rationale:

1. **Rule Evaluation Semantics**: In Firestore Security Rules, `allow write` unconditionally grants `create`, `update`, and `delete`. `allow read` unconditionally grants `get` and `list`.
2. **Absence of Authorization Boundaries**: The single condition `isAuthenticated()` requires only a valid Firebase Auth token. Any user signed into Firebase across any organization, brand, or anonymous customer profile can read, list, create, overwrite, or delete every document in `/idempotency_keys/`.
3. **Compromise of Architectural Invariants**: ADR-025 establishes idempotency keys as the foundational mechanism preventing double-execution of financial and order transactions. Permitting client-initiated deletion or cross-tenant mutation completely dismantles this guarantee.

---

## 3. Attack-Scenario Evidence Matrix

To separate factual findings from theoretical risks, each scenario claimed in Stage 1 was independently evaluated against repository evidence:

| Attack Scenario                    | Claimed Impact                                                    | Independent Evaluation                                                                                                                                                                                                                        | Evidence Quality & Status |
| :--------------------------------- | :---------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------ |
| **Cross-Tenant Key Deletion**      | Tenant B user deletes Tenant A idempotency records.               | **CONFIRMED DIRECT RISK.** The rules engine grants `delete` to any authenticated UID. A simple client call `deleteDoc(doc(db, 'idempotency_keys', 'keyA'))` succeeds.                                                                         | **FACT (Rule-Level)**     |
| **Replay Attack / Double Charge**  | Deleted key permits re-execution of a payment/order.              | **ARCHITECTURAL RISK (MERELY PLAUSIBLE AT RUNTIME).** While the theoretical mechanism is real, `apps/` currently contains zero payment or order code. No active exploit path exists today because no billing server or POS client is running. | **REASONED RISK**         |
| **Key Pre-Creation & Hijacking**   | Attacker pre-creates predictable keys to cause denial-of-service. | **CONFIRMED DIRECT RISK.** Any authenticated user can execute `setDoc` with an arbitrary key ID, pre-empting legitimate transactions.                                                                                                         | **FACT (Rule-Level)**     |
| **Platform-Wide Data Enumeration** | Attacker runs collection query to harvest transaction keys.       | **CONFIRMED DIRECT RISK.** `allow read` enables `list`. A client executing `getDocs(collection(db, 'idempotency_keys'))` receives all stored keys.                                                                                            | **FACT (Rule-Level)**     |
| **Client Application Dependency**  | Breaking changes if schema/path changes.                          | **DISPROVED / UNFOUNDED.** `apps/` is an empty scaffold. Zero code, tests, or seed scripts write to `/idempotency_keys/`. A schema/path adjustment has **zero breaking impact**.                                                              | **FACT (Codebase)**       |

---

## 4. Architecture & Naming Compatibility Review

### Critical Finding: Stage 1 Architectural Inconsistency

Stage 1 recommended Alternative B: `/organizations/{orgId}/idempotency_keys/{keyId}`.  
However, an independent structural audit of [`firestore.rules`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules) reveals an essential architectural pattern that Stage 1 overlooked:

1. **Every business collection in `firestore.rules` is a FLAT ROOT COLLECTION:**
   - `/organizations/{orgId}` (Root)
   - `/brands/{brandId}` (Root)
   - `/outlets/{outletId}` (Root)
   - `/users/{userId}` (Root)
   - `/customers/{customerId}` (Root)
   - `/menu_items/{itemId}` (Root — scoped via `resource.data.orgId`)
   - `/orders/{orderId}` (Root — scoped via `resource.data.orgId`)
   - `/audit_logs/{logId}` (Root — scoped via `resource.data.orgId`)
2. **There is NOT A SINGLE SUBCOLLECTION in `firestore.rules`:**  
   Introducing `/organizations/{orgId}/idempotency_keys/{keyId}` makes `idempotency_keys` the **sole nested subcollection in the entire Firestore schema**, breaking architectural consistency with `orders` and `audit_logs`.
3. **The Established `audit_logs` Precedent:**  
   [`firestore.rules:138–142`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L138-L142) provides an exact, hardened model for immutable root-level records:
   ```javascript
   match /audit_logs/{logId} {
     allow read: if isAuthenticated() && (isPlatformAdmin() || (hasRole('Accountant') && isTenantMember(resource.data.orgId)) || isOrgOwner(resource.data.orgId));
     allow create: if isAuthenticated() && isStaffMember(request.resource.data.orgId);
     allow update, delete: if false; // Strictly Immutable
   }
   ```
   A root-level `/idempotency_keys/{keyId}` collection leveraging this established pattern preserves 100% architectural homogeneity across `firestore.rules`.

---

## 5. CRUD-by-Actor Authorization Matrix

The table below defines the required authorization boundaries across canonical actors:

| Actor Identity                 | Target Resource | `get` (Read)      | `list` (Query)    | `create`             | `update`          | `delete`          |
| :----------------------------- | :-------------- | :---------------- | :---------------- | :------------------- | :---------------- | :---------------- |
| **Unauthenticated**            | Any Key         | ❌ DENY           | ❌ DENY           | ❌ DENY              | ❌ DENY           | ❌ DENY           |
| **Tenant A Staff**             | Tenant A Key    | ✅ ALLOW          | ✅ ALLOW (Scoped) | ✅ ALLOW (`own uid`) | ❌ DENY           | ❌ DENY           |
| **Tenant A Staff**             | Tenant B Key    | ❌ DENY           | ❌ DENY           | ❌ DENY              | ❌ DENY           | ❌ DENY           |
| **Customer (Ananya)**          | Own Key         | ✅ ALLOW          | ❌ DENY           | ✅ ALLOW (`own uid`) | ❌ DENY           | ❌ DENY           |
| **Customer (Ananya)**          | Other's Key     | ❌ DENY           | ❌ DENY           | ❌ DENY              | ❌ DENY           | ❌ DENY           |
| **PlatformAdmin**              | Any Key         | ✅ ALLOW          | ✅ ALLOW          | ❌ DENY              | ❌ DENY           | ❌ DENY           |
| **Backend Server (Admin SDK)** | Any Key         | ✅ Bypasses Rules | ✅ Bypasses Rules | ✅ Bypasses Rules    | ✅ Bypasses Rules | ✅ Bypasses Rules |

### Client Immutability Constraint & Server-Side Clarification

- **Client Immutability (`allow update, delete: if false;`)**:  
  Clients must NEVER update or delete idempotency keys. Once created, a key represents an immutable intent record.
- **Response Caching & Status Updates**:  
  If order processing transitions a key from `PENDING` to `COMPLETED`, this transition must be executed by **trusted backend services** (Cloud Functions / API server) using the Firebase Admin SDK, which inherently bypasses client rules. If POS clients are required to update keys offline, a tightly scoped transition rule (`request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'updatedAtIso'])`) would be mandatory. In pre-Phase 1 foundation, full client immutability is the safest fail-closed choice.

---

## 6. Positive & Negative Behavioral Test Matrix

When Stage 3 implementation is authorized, acceptance must be governed by this exact behavioral suite:

```
================================================================================
M0-FIX-03 BEHAVIORAL VERIFICATION MATRIX (LOCAL FIRESTORE EMULATOR)
================================================================================
Positive Scenarios (assertSucceeds):
  1. RUT-IDEM-01: Tenant A Manager creates idempotency key in Tenant A matching own UID.
  2. RUT-IDEM-02: Tenant A Cashier reads existing Tenant A idempotency key.
  3. RUT-IDEM-03: Customer Ananya creates idempotency key for own order matching own UID.
  4. RUT-IDEM-04: Customer Ananya reads own idempotency key.
  5. RUT-IDEM-05: PlatformAdmin reads any tenant idempotency key.

Negative Scenarios (assertFails):
  6. RUT-IDEM-06: Unauthenticated actor attempts get() on any key.
  7. RUT-IDEM-07: Unauthenticated actor attempts set() on any key.
  8. RUT-IDEM-08: Tenant B Manager attempts get() on Tenant A key (Cross-tenant read).
  9. RUT-IDEM-09: Tenant B Manager attempts set() on Tenant A key (Cross-tenant write).
 10. RUT-IDEM-10: Tenant A Manager attempts update() on existing key (Immutability).
 11. RUT-IDEM-11: Tenant A Owner attempts delete() on existing key (Immutability).
 12. RUT-IDEM-12: PlatformAdmin attempts delete() on existing key (Immutability).
 13. RUT-IDEM-13: Tenant A Manager creates key with mismatched userId != auth.uid.
 14. RUT-IDEM-14: Customer Rahul attempts to read Customer Ananya's key.
 15. RUT-IDEM-15: Customer Ananya attempts list() query over collection.
================================================================================
```

---

## 7. Server-Side Processing & TTL / Lifecycle Requirements

1. **TTL Deletion Invariant**:  
   Firestore security rules cannot schedule or execute document deletion. Leaving idempotency records in Firestore indefinitely creates table bloat and cost leakage.
2. **Phase 1 Lifecycle Requirement**:  
   Prior to Phase 1 production deployment, one of two mechanisms must be provisioned:
   - **GCP Firestore Native TTL Policy**: Configured on a designated `expiresAt` timestamp attribute (e.g. 24-hour TTL).
   - **Scheduled Cloud Function**: Running a periodic purge query on `expiresAtIso < now()`.
3. **No Phantom TTL in Stage 1/2**:  
   The rules must not assume a TTL engine is currently active. The schema must require an `expiresAtIso` field on `create` to prepare for native TTL activation.

---

## 8. Comparison of Alternatives & Reviewer Recommendation

### Detailed Comparative Analysis

| Evaluation Criterion                   | Alternative A: Root Collection (`/idempotency_keys/{keyId}`)                                    | Alternative B: Subcollection (`/organizations/{orgId}/idempotency_keys/{keyId}`) |
| :------------------------------------- | :---------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| **Consistency with `firestore.rules`** | **EXCELLENT.** Matches `orders`, `menu_items`, `audit_logs`. 100% flat collection architecture. | **POOR.** Introduces the only subcollection in the entire ruleset.               |
| **Cross-Tenant Isolation**             | **STRONG.** Enforced via `isTenantMember(resource.data.orgId)`. Proven pattern.                 | **STRONG.** Enforced by path segment (`{orgId}`).                                |
| **Customer Access Handling**           | Uses `(resource.data.customerId == request.auth.uid)`, identical to `orders` (L123).            | Requires overriding tenant check for customer role.                              |
| **Query & Indexing Burden**            | Requires composite index if querying by `orgId` + timestamp.                                    | Subcollection query is naturally partitioned.                                    |
| **Platform-Wide TTL Cleanup**          | Simple: single TTL rule on root `idempotency_keys`.                                             | Requires Collection Group index on `idempotency_keys`.                           |
| **Global Key Uniqueness**              | Guaranteed database-wide.                                                                       | Scoped only within tenant.                                                       |

### Reviewer Recommendation: **ADOPT ALTERNATIVE A (ENHANCED ROOT COLLECTION)**

While Stage 1 recommended Alternative B, this independent review recommends **Alternative A (Root Collection with Mandatory Tenant & Identity Binding)**.  
**Rationale**: Alternative A preserves the established structural architectural style of Sita Ram OS (`orders`, `audit_logs`, and `menu_items` are all root collections). It models dual staff/customer access using the exact precedent established in `orders` (`firestore.rules:120–133`) and immutability from `audit_logs` (`firestore.rules:138–142`), avoiding an unnecessary schema bifurcation.

However, both Alternative A and Alternative B provide robust security. The selection is an architectural preference for the Project Owner.

---

## 9. Unresolved Governance Questions & Dependencies

1. **Human Decision on Structural Model**:  
   Project Owner / CTO must formally select between:
   - **Alternative A (Recommended)**: Flat root collection `/idempotency_keys/{keyId}` matching `orders` and `audit_logs`.
   - **Alternative B**: Nested subcollection `/organizations/{orgId}/idempotency_keys/{keyId}`.
2. **Dependency on Test Harness (`Correction #4`)**:  
   The behavioral test matrix relies on the typed actor claims factories designed in `CORRECTION-4-STAGE-1-DESIGN-20261014.md`.

---

## 10. Gate Verdict & Exact Next Action

### Gate Verdict: **CONDITIONAL PASS**

- **Verdict Meaning**: The Stage 1 design has been rigorously and independently reviewed. The security defect is confirmed, invariants are formalized, and behavioral tests are defined. The design is **sufficiently mature for Stage 2 Gate presentation**.
- **Condition**: The Project Owner must decide between Alternative A (Root Collection) and Alternative B (Subcollection) during the human decision gate.
- **Implementation Authorization**: **NONE**. This verdict does **NOT** authorize modifying code, rules, or tests.

### Exact Next Action

Present this review package and the Stage 1 design to the Project Owner for formal human gate evaluation under decision record **`WORK-AUTH-01`**.
