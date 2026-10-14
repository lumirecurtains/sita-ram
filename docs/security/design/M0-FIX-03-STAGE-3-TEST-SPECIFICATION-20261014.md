# Stage 3 / 3.1 Behavioral Test Specification & Verification: M0-FIX-03 Idempotency Keys Security

**Document Identifier**: M0-FIX-03-STAGE-3-TEST-SPECIFICATION-20261014  
**Work Item**: M0-FIX-03 (Tenant Isolation & Safe Lifecycle Handling for `idempotency_keys`)  
**Lifecycle Stage**: Stage 3 / 3.1 — Behavioral Test Design & Source Verification ONLY  
**Date**: 2026-10-14  
**Author**: Antigravity Autonomous Pair Programmer  
**Repository**: `C:/Users/Lex-leo/Sita-Ram`  
**Baseline Git HEAD**: `9125d7ac30a592579714d9bb947f5bdf8014f630`  
**Preferred Design Model**: Enhanced Root Collection (`/idempotency_keys/{keyId}`) with Explicit Tenant & Actor Binding  
**Governing Gate**: Sita Ram Master Delivery Lifecycle Specification (Locked Stages 0–7)  
**Status**: TEST SPECIFICATION VERIFIED & REVISED IN PLACE — PENDING HUMAN AUTHORIZATION GATE (`WORK-AUTH-01`)

---

## 1. Executive Summary & Design Model Under Evaluation

### 1.1 Objective

This Stage 3 / 3.1 document specifies the complete, evidence-based behavioral test suite for **`M0-FIX-03`** and records the independent verification of its underlying security, architectural, and test-harness assumptions against the canonical codebase. The specification is designed to evaluate and verify the remediation of the critical security flaw in [`firestore.rules:147–149`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L147-L149), where `allow read, write: if isAuthenticated();` currently exposes all idempotency keys to unconstrained cross-tenant mutation and enumeration.

### 1.2 Preferred Structural Model Under Evaluation

In alignment with the Stage 2 Independent Review recommendations, the preferred model under evaluation is:
$$\mathbf{Alternative\ A:\ Enhanced\ Root\ Collection\ (/idempotency\_keys/\{keyId\})}$$

**Architectural Justification**:

1. **Consistency**: Every business entity in `firestore.rules` (`organizations`, `brands`, `outlets`, `users`, `customers`, `menu_items`, `orders`, `audit_logs`) is a flat root collection. Retaining `/idempotency_keys/` at the root preserves 100% architectural homogeneity.
2. **Precedent**: Follows the exact append-only immutable pattern established in [`firestore.rules:138–142`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L138-L142) for `/audit_logs/` and the dual staff/customer ownership pattern in [`firestore.rules:120–133`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L120-L133) for `/orders/`.
3. **Global Uniqueness**: Enforces platform-wide idempotency key uniqueness, preventing accidental key collisions across outlets or brands.

---

## 2. Infrastructure Baseline & Code Citations

| File Path                                                                                                                                  | Lines   | Inspected Construct               | Technical Role in Test Infrastructure                                                                                                                                              |
| :----------------------------------------------------------------------------------------------------------------------------------------- | :------ | :-------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`firestore.rules`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules)                                                                     | 147–149 | `match /idempotency_keys/{keyId}` | Target rule block to be replaced upon Stage 4 authorization.                                                                                                                       |
| [`firestore.rules`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules)                                                                     | 12–63   | Security helper functions         | `isAuthenticated()`, `isPlatformAdmin()`, `isTenantMember(orgId)`, `isStaffMember(orgId)`, `isCustomerOwner(customerId)`. Evaluated by the test suite.                             |
| [`tests/security/rules-test-helper.ts`](file:///C:/Users/Lex-leo/Sita-Ram/tests/security/rules-test-helper.ts)                             | 41–92   | `TEST_ACTORS` & Tenant constants  | Supplies authenticated and unauthenticated test contexts (`platformAdmin`, `tenantAOwner`, `tenantAManager`, `tenantBOwner`, `tenantBManager`, `customerAnanya`, `customerRahul`). |
| [`tests/security/rules-test-helper.ts`](file:///C:/Users/Lex-leo/Sita-Ram/tests/security/rules-test-helper.ts)                             | 98–148  | `seedBaselineFixtures()`          | Uses `withSecurityRulesDisabled` during `beforeEach` setup to establish isolated baseline records. Currently seeds zero idempotency keys.                                          |
| [`tests/security/firestore-rules.behavioral.test.ts`](file:///C:/Users/Lex-leo/Sita-Ram/tests/security/firestore-rules.behavioral.test.ts) | 1–152   | Canonical behavioral test suite   | Existing 16 behavioral tests (`RUT-01` to `RUT-16`) validating organizations, orders, customers, and audit logs.                                                                   |
| [`packages/core-contracts/src/enums/roles.ts`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/enums/roles.ts)               | 6–17    | Canonical `UserRole` enum         | 10 canonical roles including `PlatformAdmin`, `OrgOwner`, `OutletManager`, and `Customer`.                                                                                         |
| [`packages/core-contracts/src/scopes/index.ts`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/scopes/index.ts)             | 10–45   | Multi-tenant scope contexts       | Defines `PlatformScopeContext` and `StaffScopeDescriptor`. Demonstrates that platform level does not bind an `orgId`.                                                              |
| [`packages/core-contracts/src/identifiers/index.ts`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/identifiers/index.ts)   | 8–23    | Nominal branded ID types          | Establishes nominal type safety: `ClientOperationId !== IdempotencyKey !== ServerRecordId` and `UserId !== CustomerId`.                                                            |
| [`packages/core-contracts/src/dtos/customer.dto.ts`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/dtos/customer.dto.ts)   | 13–20   | `CustomerProfileDTO`              | Defines customer profile with `id: CustomerId`. Shows customers have no tenant membership.                                                                                         |
| [`packages/core-contracts/src/dtos/order.dto.ts`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/dtos/order.dto.ts)         | 39–59   | `OrderDTO` fields                 | Proves contracts bind `idempotencyKey` to `orgId`, `customerId`, and `clientOperationId`.                                                                                          |
| [`packages/core-contracts/src/dtos/payment.dto.ts`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/dtos/payment.dto.ts)     | 4–12    | `PaymentIntentDTO` fields         | Proves payment transactions associate `idempotencyKey` with `orderId`.                                                                                                             |

---

## 3. Evaluated Rule Specification (Target Design)

The behavioral tests specified herein are constructed to validate the following candidate rule set for `/idempotency_keys/{keyId}`:

```javascript
match /idempotency_keys/{keyId} {
  // Read Authorization:
  // - PlatformAdmin inspection: CONDITIONAL on formal governance decision DECISION-IDEM-PLATFORMADMIN-READ.
  // - Tenant staff: can read keys belonging to their organization.
  // - Customers: can read ONLY keys matching their own authenticated customerId or userId.
  allow read: if isAuthenticated() && (
    (isPlatformAdmin()) || // [CONDITIONAL: Subject to Project Owner decision on operational audit scope]
    (isTenantMember(resource.data.orgId) && isStaffMember(resource.data.orgId)) ||
    (resource.data.customerId == request.auth.uid) ||
    (resource.data.userId == request.auth.uid)
  );

  // Create Authorization:
  // - Mandatory fields: orgId and createdAtIso must be strings.
  // - Staff path: caller must be member and staff of target orgId, and bind userId == request.auth.uid.
  // - Customer path: caller must bind customerId == request.auth.uid (no orgId staff membership required).
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

## 4. Comprehensive Behavioral Test Matrix

The test matrix specifies **22 discrete behavioral test cases** across all 12 operational dimensions mandated by the verification protocol.

> [!NOTE]
> All 22 test cases are **design specifications on paper**. Zero behavioral tests have been executed against a live emulator in Stage 3 or Stage 3.1. Fourteen tests require pre-seeded fixtures in `seedBaselineFixtures()` as noted below.

| Test ID         | Operational Dimension             | Actor Context     | Target Document & Initial Fixture       | Fixture Prerequisite     | Proposed Operation                                                                                                          | Expected Result                                                  | Security Invariant Verified                                       |
| :-------------- | :-------------------------------- | :---------------- | :-------------------------------------- | :----------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------- | :---------------------------------------------------------------- |
| **RUT-IDEM-01** | 1. Unauthenticated Denial         | `unauthenticated` | `/idempotency_keys/idem_live_01`        | Pre-seeded Tenant A key  | `.get()`                                                                                                                    | `assertFails`                                                    | `INV-IDEM-01` (Auth required)                                     |
| **RUT-IDEM-02** | 1. Unauthenticated Denial         | `unauthenticated` | `/idempotency_keys/idem_new_unauth`     | None (New document)      | `.set({ ...validPayload })`                                                                                                 | `assertFails`                                                    | `INV-IDEM-01` (Auth required)                                     |
| **RUT-IDEM-03** | 2. Same-Tenant Staff Read         | `tenantAManager`  | `/idempotency_keys/idem_live_01`        | Pre-seeded Tenant A key  | `.get()`                                                                                                                    | `assertSucceeds`                                                 | `INV-IDEM-02` (Staff tenant read)                                 |
| **RUT-IDEM-04** | 2. Same-Tenant Staff Create       | `tenantAManager`  | `/idempotency_keys/idem_mgr_new_01`     | None (New document)      | `.set({ orgId: TENANT_A_ORG_ID, userId: 'user_mgr_bareilly_01', createdAtIso: '2026-10-14T10:00:00Z', status: 'PENDING' })` | `assertSucceeds`                                                 | `INV-IDEM-03` (Staff authorized create)                           |
| **RUT-IDEM-05** | 2. Same-Tenant Owner Read         | `tenantAOwner`    | `/idempotency_keys/idem_live_01`        | Pre-seeded Tenant A key  | `.get()`                                                                                                                    | `assertSucceeds`                                                 | `INV-IDEM-02` (Owner tenant read)                                 |
| **RUT-IDEM-06** | 3. Cross-Tenant Read Denial       | `tenantBManager`  | `/idempotency_keys/idem_live_01`        | Pre-seeded Tenant A key  | `.get()`                                                                                                                    | `assertFails`                                                    | `INV-IDEM-04` (Strict tenant isolation)                           |
| **RUT-IDEM-07** | 3. Cross-Tenant Create Denial     | `tenantBManager`  | `/idempotency_keys/idem_spoof_01`       | None (New document)      | `.set({ orgId: TENANT_A_ORG_ID, userId: 'user_mithai_mgr_02', createdAtIso: '2026-10-14T10:00:00Z' })`                      | `assertFails`                                                    | `INV-IDEM-04` (Cross-tenant forge blocked)                        |
| **RUT-IDEM-08** | 3. Cross-Tenant Update Denial     | `tenantBManager`  | `/idempotency_keys/idem_live_01`        | Pre-seeded Tenant A key  | `.update({ status: 'CANCELLED' })`                                                                                          | `assertFails`                                                    | `INV-IDEM-05` (Client immutability & isolation)                   |
| **RUT-IDEM-09** | 3. Cross-Tenant Delete Denial     | `tenantBManager`  | `/idempotency_keys/idem_live_01`        | Pre-seeded Tenant A key  | `.delete()`                                                                                                                 | `assertFails`                                                    | `INV-IDEM-05` (Client immutability & isolation)                   |
| **RUT-IDEM-10** | 4. Customer Own Key Read          | `customerAnanya`  | `/idempotency_keys/idem_cust_ananya_01` | Pre-seeded Customer key  | `.get()`                                                                                                                    | `assertSucceeds`                                                 | `INV-IDEM-06` (Customer ownership read)                           |
| **RUT-IDEM-11** | 4. Customer Own Key Create        | `customerAnanya`  | `/idempotency_keys/idem_cust_new_01`    | None (New document)      | `.set({ orgId: TENANT_A_ORG_ID, customerId: 'cust_ananya_01', createdAtIso: '2026-10-14T10:00:00Z' })`                      | `assertSucceeds`                                                 | `INV-IDEM-06` (Customer authorized create)                        |
| **RUT-IDEM-12** | 4. Customer Cross-Read Denial     | `customerRahul`   | `/idempotency_keys/idem_cust_ananya_01` | Pre-seeded Customer key  | `.get()`                                                                                                                    | `assertFails`                                                    | `INV-IDEM-06` (Customer privacy boundary)                         |
| **RUT-IDEM-13** | 4. Customer Staff-Key Read Denial | `customerAnanya`  | `/idempotency_keys/idem_live_01`        | Pre-seeded Staff POS key | `.get()`                                                                                                                    | `assertFails`                                                    | `INV-IDEM-06` (Customer cannot inspect staff keys)                |
| **RUT-IDEM-14** | 5. Forged User ID Denial          | `tenantAManager`  | `/idempotency_keys/idem_forged_user`    | None (New document)      | `.set({ orgId: TENANT_A_ORG_ID, userId: 'user_org_owner_01', createdAtIso: '2026-10-14T10:00:00Z' })`                       | `assertFails`                                                    | `INV-IDEM-07` (UID impersonation blocked)                         |
| **RUT-IDEM-15** | 5. Forged Customer ID Denial      | `customerAnanya`  | `/idempotency_keys/idem_forged_cust`    | None (New document)      | `.set({ orgId: TENANT_A_ORG_ID, customerId: 'cust_rahul_02', createdAtIso: '2026-10-14T10:00:00Z' })`                       | `assertFails`                                                    | `INV-IDEM-07` (Customer ID forgery blocked)                       |
| **RUT-IDEM-16** | 6. Client Update Denial (Staff)   | `tenantAManager`  | `/idempotency_keys/idem_live_01`        | Pre-seeded Tenant A key  | `.update({ status: 'COMPLETED' })`                                                                                          | `assertFails`                                                    | `INV-IDEM-05` (Client immutability invariant)                     |
| **RUT-IDEM-17** | 6. Client Delete Denial (Owner)   | `tenantAOwner`    | `/idempotency_keys/idem_live_01`        | Pre-seeded Tenant A key  | `.delete()`                                                                                                                 | `assertFails`                                                    | `INV-IDEM-05` (Client immutability invariant)                     |
| **RUT-IDEM-18** | 7. Replay / Overwrite Denial      | `tenantAManager`  | `/idempotency_keys/idem_live_01`        | Pre-seeded Tenant A key  | `.set({ orgId: TENANT_A_ORG_ID, userId: 'user_mgr_bareilly_01', createdAtIso: '2026-10-14T10:00:00Z' })`                    | `assertFails`                                                    | `INV-IDEM-08` (Replay overwrite blocked)                          |
| **RUT-IDEM-19** | 8. PlatformAdmin Read Access      | `platformAdmin`   | `/idempotency_keys/idem_live_01`        | Pre-seeded Tenant A key  | `.get()`                                                                                                                    | `assertSucceeds` _(If authorized)_ / `assertFails` _(If denied)_ | `INV-IDEM-09` _(Conditional on DECISION-IDEM-PLATFORMADMIN-READ)_ |
| **RUT-IDEM-20** | 8. PlatformAdmin Delete Denial    | `platformAdmin`   | `/idempotency_keys/idem_live_01`        | Pre-seeded Tenant A key  | `.delete()`                                                                                                                 | `assertFails`                                                    | `INV-IDEM-05` (Strict platform-wide immutability)                 |
| **RUT-IDEM-21** | 9. Missing Required Fields        | `tenantAManager`  | `/idempotency_keys/idem_missing_org`    | None (New document)      | `.set({ userId: 'user_mgr_bareilly_01', createdAtIso: '2026-10-14T10:00:00Z' })`                                            | `assertFails`                                                    | `INV-IDEM-10` (Schema payload completeness)                       |
| **RUT-IDEM-22** | 10. Query Enumeration Denial      | `tenantBManager`  | `/idempotency_keys/` collection query   | Pre-seeded keys in DB    | `.where('orgId', '==', TENANT_A_ORG_ID).get()`                                                                              | `assertFails`                                                    | `INV-IDEM-04` (Query isolation boundary)                          |

---

## 5. Security Invariant Definitions

- **`INV-IDEM-01` (Authentication Prerequisite)**: Unauthenticated network callers are denied 100% of read and write operations.
- **`INV-IDEM-02` (Staff Tenant Read)**: Staff members can inspect idempotency records only within their active organization context (`isTenantMember(resource.data.orgId) && isStaffMember(resource.data.orgId)`).
- **`INV-IDEM-03` (Staff Creation Binding)**: A staff member can only create an idempotency record for their own organization and must bind their authentic `userId` (`request.resource.data.userId == request.auth.uid`).
- **`INV-IDEM-04` (Strict Tenant Isolation)**: An actor associated with Tenant B cannot read, query, create, or tamper with Tenant A records.
- **`INV-IDEM-05` (Client Immutability Invariant)**: In order to guarantee transaction idempotency and prevent replay attacks, all client `update` and `delete` operations are strictly forbidden (`allow update, delete: if false;`).
- **`INV-IDEM-06` (Customer Privacy Boundary)**: Customers can only read and create idempotency records associated with their own verified identity (`request.auth.uid == customerId`).
- **`INV-IDEM-07` (Identity Anti-Spoofing)**: Any discrepancy between the authenticated token (`request.auth.uid`, `request.auth.token.orgId`) and the payload attributes (`userId`, `customerId`, `orgId`) causes immediate rejection.
- **`INV-IDEM-08` (Replay Overwrite Resistance)**: Calling `.set()` on an existing idempotency key acts as an `update` under Firestore client SDK rules semantics; because updates are disabled, duplicate writes fail closed.
- **`INV-IDEM-09` (Platform Audit Visibility — Conditional)**: Governs whether platform administrators possess read-only audit visibility across tenant boundaries. Subject to formal approval of `DECISION-IDEM-PLATFORMADMIN-READ`.
- **`INV-IDEM-10` (Schema Completeness)**: Idempotency documents must contain explicit string attributes for `orgId` and `createdAtIso`.

---

## 6. Design Review Requirements & Analysis

### 6.1 Schema & Contract Compatibility

- **Branded Identifier Typing**: In `packages/core-contracts/src/identifiers/index.ts#L20-L23`, `UserId` and `CustomerId` are defined as separate nominal branded types (`UserId = Brand<string, 'UserId'>` vs. `CustomerId = Brand<string, 'CustomerId'>`). They are **not interchangeable**.
- **Customer DTO Semantics**: In `packages/core-contracts/src/dtos/customer.dto.ts#L13-L20`, customer records carry `id: CustomerId`. Customers are cross-tenant restaurant patrons and do not possess organization membership claims (`token.orgId`).
- **Order DTO Semantics**: In `packages/core-contracts/src/dtos/order.dto.ts#L39-L59`, an order explicitly binds `idempotencyKey: IdempotencyKey`, `orgId: OrganizationId`, and `customerId: CustomerId`. Top-level `userId` is absent on orders (staff is tracked only within `statusHistory[].actorUserId`).
- **Conclusion**: The candidate security rule must provide distinct create validation branches for staff (binding `userId` and `orgId`) and customers (binding `customerId` and target `orgId`), rather than forcing customers to furnish an artificial `userId`.

### 6.2 Client Immutability vs. Legitimate Retry Mechanics

- **Analysis**: A legitimate retry occurs when a client network request times out or is re-sent. Under ADR-025:
  1. The client issues a read (`get()`) on the `idempotencyKey`.
  2. If the record exists, the client retrieves the cached status and result.
  3. The client does **NOT** update or delete the key.
- **Rules Mechanics**: Prohibiting client `update` and `delete` does not hinder legitimate retries; rather, it **protects** legitimate retries by ensuring that client-side race conditions or malicious actors cannot purge or alter the recorded transaction state.
- **Architecture Horizon**: The client-side retry handling logic is a **future client architecture requirement**. Currently, `apps/` contains only `.gitkeep`, and no client applications exist in the repository.

### 6.3 Trusted Server Processing Boundaries (Admin SDK)

- **Distinction**: Firestore Security Rules apply **strictly to Firebase Client SDKs** (web apps, POS tablets, KDS displays).
- **Server Authority**: Trusted backend services (e.g. Cloud Functions, Cloud Run order processing workers) interact with Firestore via the **Firebase Admin SDK**. The Admin SDK bypasses security rules by design.
- **Status Lifecycle**:
  - Client creates key in `PENDING` state via Client SDK (governed by rules).
  - Backend server worker processes order, updates key state to `COMPLETED` or `FAILED`, and writes result snapshot via Admin SDK (bypassing rules).
  - If a client attempts to overwrite or delete the key, client rules block it fail-closed.
- **Architecture Horizon**: Status transitions and result caching by server workers are **future backend architecture requirements**. Zero Cloud Functions or server workers exist in the repository today.

### 6.4 Expiry & Cleanup Behavior (Lifecycle Management)

- **TTL Boundary**: Security rules cannot execute document deletion. TTL is an infrastructure lifecycle control, not an authorization rule.
- **Implementation Plan**: In Phase 1, a native GCP Firestore TTL policy should be enabled on the `expiresAt` timestamp field, or a scheduled Cloud Function will purge records older than 24 hours via Admin SDK.
- **Architecture Horizon**: TTL policy configuration and scheduled cleanup workers are **future infrastructure requirements**.

### 6.5 Offline vs. Emulated Test Execution Breakdown

- **Offline Tests (Executed via `npm test`)**:
  - Static syntax and structural invariant checks (`tests/security/firestore-rules.test.ts`).
  - Contract schema validation and purity tests (`packages/core-contracts/tests/`).
  - All 60 offline tests pass with exit code `0`.
- **Emulator Tests (Executed via `npm run test:rules:behavioral` or `test:rules:emulated`)**:
  - All 22 behavioral test cases (`RUT-IDEM-01` through `RUT-IDEM-22`) require a live local Firestore Emulator listening on port 8080.
  - They execute actual gRPC network calls against the emulator rules engine.
  - **Zero behavioral tests were executed as part of this specification design workflow.**

---

## 7. Pass / Fail Criteria & Exit Conditions

### What Constitutes a PASS:

1. All 22 test cases (`RUT-IDEM-01` through `RUT-IDEM-22`) execute against the local Firestore Emulator and evaluate to their exact specified outcome (`assertSucceeds` or `assertFails`).
2. All 16 existing behavioral tests (`RUT-01` through `RUT-16`) continue to pass with zero regressions.
3. Zero false positives: Every `assertFails` error corresponds to an actual rules engine `PERMISSION_DENIED` diagnostic code.
4. Static quality gates (`format:check`, `lint`, `typecheck`) pass with exit code `0`.

### What Constitutes a FAIL:

1. Any test assertion fails (e.g. an unauthorized cross-tenant read succeeds, or an authorized staff read fails).
2. Existing test suites break or regress.
3. Tests pass due to rules being accidentally disabled during assertion evaluation.

---

## 8. Prerequisites & Unresolved Design Decisions

1. **Human Governance Gate `WORK-AUTH-01`**:  
   Advancement from Stage 3 (Test Design) to Stage 4 (Implementation) strictly requires formal Project Owner approval.
2. **Architecture Decision: PlatformAdmin Operational Read Scope (`DECISION-IDEM-PLATFORMADMIN-READ`)**:  
   Formal decision is required on whether `PlatformAdmin` has cross-tenant read access to transient idempotency keys. If denied, `RUT-IDEM-19` will evaluate to `assertFails`.
3. **Architecture Decision: Actor Identifier Schema (`DECISION-IDEM-SCHEMA-ACTOR-KEY`)**:  
   Confirm whether idempotency key documents support dual optional fields (`userId` for staff, `customerId` for patrons) or a single polymorphic `actorId` + `actorType`.
4. **Test Helper Expansion (`Correction #4`)**:  
   `rules-test-helper.ts` must incorporate the type-safe actor factories designed in `CORRECTION-4-STAGE-1-DESIGN-20261014.md` to cleanly support test context generation.
5. **Seeder Baseline Fixture Update**:  
   `seedBaselineFixtures()` in `rules-test-helper.ts` must be updated during Stage 4 to seed baseline idempotency records (`idem_live_01` for Tenant A, and `idem_cust_ananya_01` for Customer Ananya) to enable deterministic read assertions.

---

## 9. Explicit Implementation-Out-of-Scope Statement

In strict compliance with the locked Sita Ram Master Delivery Lifecycle Specification (Stages 0–7):

- **This document represents Stage 3 / 3.1 (Test Design & Verification) ONLY.**
- **Zero application source files, security rules (`firestore.rules`), test code files, dependencies, or configurations were modified.**
- **`M0-FIX-03`, `M0-FIX-02`, and `Correction #4` remain STRICTLY NOT AUTHORIZED and NOT STARTED for implementation.**
- **No behavioral tests were executed as part of this specification design workflow.**
- **Zero Git commits, pushes, tags, deployments, or remote Firebase changes were performed.**

---

## 10. Stage 3.1 Independent Verification & Source Evidence (2026-10-14)

### 10.1 Verified Assumptions & Exact Source Evidence

1. **Root Collection Architectural Homogeneity**:
   - Inspected [`firestore.rules:74–142`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L74-L142). All 8 existing domain entities (`organizations`, `brands`, `outlets`, `customers`, `menu_items`, `orders`, `audit_logs`) are top-level root collections. Retaining `/idempotency_keys/{keyId}` at root level aligns with the entire repository architecture.
2. **Client Immutability Pattern**:
   - Inspected [`firestore.rules:138–142`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L138-L142) (`/audit_logs/`). Enforcing `allow update, delete: if false;` has established precedent in the repository for tamper-resistant logs.
3. **Actor Nominal Typing Separation**:
   - Inspected [`packages/core-contracts/src/identifiers/index.ts:20–23`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/identifiers/index.ts#L20-L23). `UserId` and `CustomerId` are distinct branded types.
   - Inspected [`tests/security/rules-test-helper.ts:50–92`](file:///C:/Users/Lex-leo/Sita-Ram/tests/security/rules-test-helper.ts#L50-L92). Staff tokens carry `orgId` claims (`TENANT_A_ORG_ID`), whereas customer tokens carry `customerId` without tenant binding.
4. **Behavioral Suite Test Configuration**:
   - Inspected [`tests/security/firestore-rules.behavioral.test.ts:1–152`](file:///C:/Users/Lex-leo/Sita-Ram/tests/security/firestore-rules.behavioral.test.ts#L1-L152) and `vitest.config.ts`. Behavioral tests are explicitly excluded from `npm test` and require an emulator.

### 10.2 Unsupported Assumptions & Required Architecture Decisions

1. **PlatformAdmin Cross-Tenant Idempotency Read**:
   - **Finding**: While `isPlatformAdmin()` grants cross-tenant read to business collections (`organizations`, `orders`, `customers`) via `isTenantMember()` ([`firestore.rules:20–25`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L20-L25)), no approved ADR or specification authorizes PlatformAdmin inspection of transient operational idempotency keys.
   - **Status**: **UNSUPPORTED AS AN AUTOMATIC ASSUMPTION**.
   - **Required Action**: Logged as `DECISION-IDEM-PLATFORMADMIN-READ` for human governance resolution. `RUT-IDEM-19` is marked conditional.
2. **Customer `userId` Field Requirement**:
   - **Finding**: Stage 3 initially required `request.resource.data.userId == request.auth.uid` on all creates. This assumed customer records furnish a `userId` attribute. In `packages/core-contracts/src/dtos/customer.dto.ts` and `order.dto.ts`, customers are identified by `customerId`.
   - **Status**: **UNSUPPORTED / INVALID ASSUMPTION**.
   - **Correction**: Candidate rule and test matrix revised to distinguish staff (`userId`) and customer (`customerId`) payloads.

### 10.3 Test Cases Revised in Place

- **`RUT-IDEM-11` (Customer Own Key Create)**:  
  Corrected proposed payload from `{ orgId, userId, customerId, ... }` to `{ orgId: TENANT_A_ORG_ID, customerId: 'cust_ananya_01', createdAtIso: '...' }`, eliminating the artificial `userId` requirement on customer patrons.
- **`RUT-IDEM-15` (Forged Customer ID Denial)**:  
  Corrected payload to focus purely on customer identity spoofing (`customerId: 'cust_rahul_02'`).
- **`RUT-IDEM-18` (Replay Overwrite Denial)**:  
  Clarified runtime semantics: Firestore client SDK converts `.set()` on an existing document into an `update` operation; because `allow update: if false;`, the write fails closed with permission denied.
- **`RUT-IDEM-19` (PlatformAdmin Read)**:  
  Marked explicitly as conditional on `DECISION-IDEM-PLATFORMADMIN-READ`.

### 10.4 Execution Mechanics & Fixture Prerequisites

- **Fixture Dependency**: 14 of the 22 test cases (`RUT-IDEM-01`, `03`, `05`, `06`, `08`, `09`, `10`, `12`, `13`, `16`, `17`, `18`, `19`, `20`) target pre-existing documents.
- **Harness Gap**: [`tests/security/rules-test-helper.ts:98–148`](file:///C:/Users/Lex-leo/Sita-Ram/tests/security/rules-test-helper.ts#L98-L148) (`seedBaselineFixtures()`) currently seeds zero idempotency keys.
- **Action Required for Stage 4**: Prior to running behavioral assertions, `seedBaselineFixtures()` must seed:
  1. `/idempotency_keys/idem_live_01` (Tenant A, staff user `user_mgr_bareilly_01`)
  2. `/idempotency_keys/idem_cust_ananya_01` (Tenant A, customer `cust_ananya_01`)

### 10.5 Final Stage 3.1 Verification Readiness Verdict

$$\mathbf{VERDICT:\ PASS\ (STAGE\ 3.1\ VERIFIED\ \&\ REVISED\ IN\ PLACE)}$$

The Stage 3 Behavioral Test Specification has been verified against repository source evidence. All assumptions have been validated or corrected, dependencies and prerequisite decisions are documented, and the specification is ready for human gate review (`WORK-AUTH-01`).
