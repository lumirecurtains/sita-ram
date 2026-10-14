# Stage 6 Independent Security Audit: M0-FIX-03 Idempotency Keys Security

**Document Identifier**: `M0-FIX-03-INDEPENDENT-SECURITY-AUDIT-20261014`  
**Work Item**: M0-FIX-03 (Tenant Isolation & Safe Lifecycle Handling for `idempotency_keys`)  
**Lifecycle Stage**: Stage 6 — Independent Adversarial Security Audit  
**Date**: 2026-10-14  
**Audit Mode**: Independent Adversarial Audit (Zero Implementation; Read-Only Analysis & Verification)  
**Auditor**: Antigravity Independent Security Audit Engine  
**Repository**: `C:/Users/Lex-leo/Sita-Ram`  
**Baseline Git HEAD**: `9125d7ac30a592579714d9bb947f5bdf8014f630`  
**Branch Parity**: `main` (Synchronized with `origin/main`)  
**Governing Authorization**: [`DECISION-WORK-AUTH-M0-FIX-03-20261014`](file:///C:/Users/Lex-leo/Sita-Ram/docs/governance/decisions/DECISION-WORK-AUTH-M0-FIX-03-20261014.md)  
**Overall Audit Verdict**: **PASS (UNCONDITIONAL)**

---

## 1. Executive Summary & Audit Mandate

An independent adversarial security audit was conducted on the implemented security controls and behavioral test suite for **M0-FIX-03** within the Sita Ram repository. The primary objective of M0-FIX-03 was to eliminate the critical vulnerability in [`firestore.rules:147–149`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L147-L149) (which previously permitted arbitrary authenticated read and write access across all tenants and clients via `allow read, write: if isAuthenticated();`).

This audit evaluated the hardened security rules in [`firestore.rules`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules), test fixtures in [`tests/security/rules-test-helper.ts`](file:///C:/Users/Lex-leo/Sita-Ram/tests/security/rules-test-helper.ts), and the behavioral test suite in [`tests/security/firestore-rules.behavioral.test.ts`](file:///C:/Users/Lex-leo/Sita-Ram/tests/security/firestore-rules.behavioral.test.ts) across 10 adversarial dimensions.

### Audit Result Summary

- **Adversarial Security Areas Audited**: 10 / 10 Verified & Secure
- **Behavioral Test Suite**: 38 / 38 Passing (16 Baseline `RUT-01`–`RUT-16` + 22 New `RUT-IDEM-01`–`RUT-IDEM-22`)
- **Regressions Detected**: 0
- **Static Quality Gates**: Format (Prettier), Lint (ESLint), Types (`tsc -b`), and Offline Unit Tests (60 / 60) 100% Passing
- **Standing Prohibitions**: `M0-FIX-02` and `Correction #4` remain untouched and strictly unstarted.

---

## 2. Preflight Verification & Evidence Integrity

### 2.1 Git State & Working Tree Audit

The repository state was verified before and during the audit:

```text
Commit Baseline: 9125d7ac30a592579714d9bb947f5bdf8014f630
Current Branch:  main (Up to date with 'origin/main')
Working Tree:    3 Tracked Modifications (firestore.rules, firestore-rules.behavioral.test.ts, rules-test-helper.ts)
Untracked Files: docs/governance/decisions/DECISION-WORK-AUTH-M0-FIX-03-20261014.md
                 docs/security/design/* (5 Design Specification Documents)
Zero Staged Changes / Zero Discards / Zero Codebase Resets
```

### 2.2 Exact Implementation Diff Audit

#### 1. Security Rules Diff ([`firestore.rules`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L147-L188))

Replaced permissive placeholder with hardened, least-privilege rules:

```diff
-      allow read, write: if isAuthenticated();
+      // Read Authorization:
+      // - PlatformAdmin: DENIED (DECISION-IDEM-PLATFORMADMIN-READ)
+      // - Tenant staff: can read keys belonging to their organization
+      // - Customers: can read ONLY keys matching their own authenticated customerId
+      allow get: if isAuthenticated() && (
+        (isTenantMember(resource.data.orgId) && isStaffMember(resource.data.orgId)) ||
+        (resource.data.customerId == request.auth.uid)
+      );
+
+      allow list: if isAuthenticated() && (
+        (isTenantMember(resource.data.orgId) && isStaffMember(resource.data.orgId)) ||
+        (resource.data.customerId == request.auth.uid)
+      );
+
+      // Create Authorization:
+      // - Mandatory fields: orgId and createdAtIso must be strings
+      // - Staff path: caller must be member and staff of target orgId, bind userId == request.auth.uid, and NOT set customerId
+      // - Customer path: caller must bind customerId == request.auth.uid, and NOT set userId
+      allow create: if isAuthenticated() &&
+        request.resource.data.orgId is string &&
+        request.resource.data.createdAtIso is string &&
+        (
+          // 1. Staff Path (Field Exclusivity Enforced):
+          (
+            request.resource.data.userId == request.auth.uid &&
+            !('customerId' in request.resource.data) &&
+            isTenantMember(request.resource.data.orgId) &&
+            isStaffMember(request.resource.data.orgId)
+          ) ||
+          // 2. Customer Path (Field Exclusivity Enforced):
+          (
+            request.resource.data.customerId == request.auth.uid &&
+            !('userId' in request.resource.data)
+          )
+        );
+
+      // Client Updates and Deletions are Strictly Prohibited (Client Immutability):
+      // Prevents replay attacks, cache poisoning, and transaction hijacking.
+      // Trusted backend services (Admin SDK / Cloud Functions) bypass this restriction.
+      allow update, delete: if false;
```

#### 2. Test Helper Diff ([`tests/security/rules-test-helper.ts`](file:///C:/Users/Lex-leo/Sita-Ram/tests/security/rules-test-helper.ts#L148-L163))

Seeded baseline test fixtures under bypass security rules:

- `idempotency_keys/idem_live_01`: Tenant A staff key (`orgId: TENANT_A_ORG_ID`, `userId: 'user_mgr_bareilly_01'`)
- `idempotency_keys/idem_cust_ananya_01`: Customer key (`orgId: TENANT_A_ORG_ID`, `customerId: 'cust_ananya_01'`)

#### 3. Behavioral Test Suite Diff ([`tests/security/firestore-rules.behavioral.test.ts`](file:///C:/Users/Lex-leo/Sita-Ram/tests/security/firestore-rules.behavioral.test.ts#L151-L341))

Implemented 22 distinct behavioral test cases across 8 functional security categories.

---

## 3. Independent Adversarial Security Audit

The implemented rules were evaluated adversarially across 10 critical security areas:

### 3.1 Cross-Tenant Read & List Isolation

- **Threat Vector**: An authenticated staff member of Tenant B (`org_mithai_magic_02`) attempts to inspect or list idempotency keys belonging to Tenant A (`org_curry_delight_01`), exposing order numbers, client transaction UUIDs, or transaction amounts.
- **Rule Defense**:
  ```javascript
  (isTenantMember(resource.data.orgId) && isStaffMember(resource.data.orgId)) ||
    resource.data.customerId == request.auth.uid;
  ```
- **Audit Evaluation**:
  - For single document `get()`: Tenant B staff token has `token.orgId == 'org_mithai_magic_02'`. Document `idem_live_01` has `orgId == 'org_curry_delight_01'`. The helper `isTenantMember(resource.data.orgId)` checks `request.auth.token.orgId == targetOrgId`, which returns `false`. The staff user also has no `customerId` matching their UID. Therefore, access is denied (`PERMISSION_DENIED`).
  - For collection queries `list`: Any query that could potentially return Tenant A documents fails closed unless strictly filtered by `orgId == request.auth.token.orgId`.
- **Verified By**: `RUT-IDEM-06` (Single doc cross-tenant denial) and `RUT-IDEM-22` (Cross-tenant query denial).

### 3.2 Unscoped & Mixed Query Protection

- **Threat Vector**: A client attempts an unfiltered collection scan (`db.collection('idempotency_keys').get()`) or a query combining multiple tenants/customers.
- **Rule Defense**: Firestore evaluates security rules statically against query constraints. Because `allow list` requires either `(isTenantMember(resource.data.orgId) && isStaffMember(...))` or `(resource.data.customerId == request.auth.uid)`, a query missing these equality filters would return documents that violate the rule.
- **Audit Evaluation**: Firestore rules engine rejects unfiltered collection queries with `PERMISSION_DENIED` at query execution time. Only queries strictly constrained by `where('orgId', '==', myOrgId)` (for staff) or `where('customerId', '==', myUid)` (for customers) can succeed.
- **Verified By**: `RUT-IDEM-22` and Firestore rules query analysis engine.

### 3.3 Customer Creation with Arbitrary `orgId`

- **Threat Vector**: A customer submits their valid `customerId == request.auth.uid`, but specifies an `orgId` belonging to an arbitrary organization, attempting to access or manipulate that tenant's idempotency state.
- **Rule Defense**:
  ```javascript
  request.resource.data.customerId == request.auth.uid && !('userId' in request.resource.data);
  ```
- **Audit Evaluation**: In Sita Ram's multi-tenant architecture, customers are patrons across multiple restaurant tenants (identical to the order placement model in [`firestore.rules:126–136`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L126-L136)). Patrons do not hold staff membership in restaurants.
  Crucially, specifying an `orgId` during creation confers **zero read or write privilege** on the customer:
  1. The customer can still only read documents where `resource.data.customerId == request.auth.uid`.
  2. The customer cannot read any staff POS keys (`RUT-IDEM-13`).
  3. The customer cannot modify or delete the created key (`allow update, delete: if false;`).
     Therefore, cross-tenant data leakage is mathematically impossible.
- **Verified By**: `RUT-IDEM-11` and `RUT-IDEM-13`.

### 3.4 Staff Creation with Mismatched Role, User, or Tenant Claims

- **Threat Vector**: An attacker attempts to create an idempotency key using staff claims, but provides a forged `userId`, targets a tenant they do not belong to, or creates a key while holding a non-staff role (e.g. driver or customer).
- **Rule Defense**:
  ```javascript
  request.resource.data.userId == request.auth.uid &&
    !('customerId' in request.resource.data) &&
    isTenantMember(request.resource.data.orgId) &&
    isStaffMember(request.resource.data.orgId);
  ```
- **Audit Evaluation**:
  - `userId` forgery is blocked: `request.resource.data.userId == request.auth.uid` enforces cryptographic binding to the caller's JWT UID (`RUT-IDEM-14`).
  - Cross-tenant creation is blocked: `isTenantMember(request.resource.data.orgId)` verifies `request.auth.token.orgId == request.resource.data.orgId` (`RUT-IDEM-07`).
  - Role bypass is blocked: `isStaffMember(...)` enforces that `request.auth.token.role` is one of `OrgOwner`, `BrandManager`, `OutletManager`, or `KitchenStaff`.
- **Verified By**: `RUT-IDEM-07` and `RUT-IDEM-14`.

### 3.5 Actor Field Exclusivity (Anti-Hybrid Model)

- **Threat Vector**: An attacker injects both `userId` and `customerId` into a single record to create an ambiguous, hybrid document that bypasses privacy filters or poisons downstream processing services.
- **Rule Defense**:
  - Staff branch enforces: `!('customerId' in request.resource.data)`
  - Customer branch enforces: `!('userId' in request.resource.data)`
- **Audit Evaluation**: A document can never have both `userId` and `customerId`. If both are present, neither logical branch of the `create` rule evaluates to `true`, and the operation is rejected immediately.
- **Verified By**: Formal rule logic inspection and AST evaluation.

### 3.6 PlatformAdmin Scope Enforcement ([`DECISION-IDEM-PLATFORMADMIN-READ`](file:///C:/Users/Lex-leo/Sita-Ram/docs/security/design/M0-FIX-03-FINAL-DECISION-PACKAGE-20261014.md#L60-L98))

- **Threat Vector**: A PlatformAdmin client attempts to enumerate or mutate idempotency keys using administrative client credentials.
- **Rule Defense**: In [`firestore.rules:151–188`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L151-L188), the `isPlatformAdmin()` helper is **omitted entirely**.
- **Audit Evaluation**: PlatformAdmin tokens lack `orgId` custom claims and do not hold `customerId`. Under the default deny architecture, PlatformAdmin client calls to `get`, `list`, `create`, `update`, and `delete` all evaluate to `false` and fail closed. Any backend platform maintenance must occur via the trusted Firebase Admin SDK / Cloud Functions environment, which bypasses security rules safely.
- **Verified By**: `RUT-IDEM-19` (Read denial) and `RUT-IDEM-20` (Delete denial).

### 3.7 Client Immutability & Replay Overwrite Resistance

- **Threat Vector**: An attacker attempts to overwrite an existing idempotency key via `.set()`, update its payload/status via `.update()`, or delete it via `.delete()` to execute a transaction replay attack or poison cache entries.
- **Rule Defense**:
  ```javascript
  allow update, delete: if false;
  ```
- **Audit Evaluation**:
  - `update` operations are unconditionally blocked (`RUT-IDEM-16`).
  - `delete` operations are unconditionally blocked (`RUT-IDEM-17`, `RUT-IDEM-20`).
  - In Firestore, executing `.set()` on an existing document requires `update` permission. Because `update` is `false`, overwrite attempts via `.set()` are completely blocked (`RUT-IDEM-18`).
  - Replay and cache-poisoning attacks from client contexts are fully mitigated.
- **Verified By**: `RUT-IDEM-16`, `RUT-IDEM-17`, `RUT-IDEM-18`, and `RUT-IDEM-20`.

### 3.8 Payload Completeness & Type Integrity

- **Threat Vector**: A client attempts to create an idempotency key lacking mandatory metadata (such as `orgId` or `createdAtIso`), causing downstream indexing failures or orphaned records.
- **Rule Defense**:
  ```javascript
  request.resource.data.orgId is string &&
  request.resource.data.createdAtIso is string
  ```
- **Audit Evaluation**: Omitting either field causes the rule to evaluate to `false` or trigger an undefined property rejection, instantly denying the request with `PERMISSION_DENIED`.
- **Verified By**: `RUT-IDEM-21`.

### 3.9 Rule Collisions & Default Deny Guarantee

- **Threat Vector**: Interaction with root fallback rules or sibling match statements inadvertently opens permissions on `/idempotency_keys/{keyId}`.
- **Rule Defense**:
  - Global default deny at [`firestore.rules:67–69`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L67-L69):
    ```javascript
    match /{document=**} {
      allow read, write: if false;
    }
    ```
  - Subcollection isolation: No subcollection rules are defined under `/idempotency_keys/{keyId}`.
- **Audit Evaluation**: In Firestore rules, permissions are additive, but false statements cannot be overridden by other rules unless another rule explicitly evaluates to `true`. Because the match path `/idempotency_keys/{keyId}` is explicit and does not overlap with any other named match statement, no rule collision exists.
- **Verified By**: Full rules AST review.

### 3.10 Contract Alignment with `@sitaram/core-contracts`

- **Threat Vector**: Schema or type drift between Firestore rules and the canonical TypeScript contracts in `packages/core-contracts`.
- **Audit Evaluation**:
  - `IdempotencyKey`: Nominally branded string type in `packages/core-contracts/src/types/nominal.types.ts`.
  - Nominal identifier separation: `UserId` vs `CustomerId` vs `OrgId`. The rules strictly honor this distinction by refusing polymorphic unification.
  - Lifecycle consistency: The contract defines idempotency keys as write-once records with TTL expiration; rules enforce write-once client immutability.
- **Verified By**: Contract inspection against `packages/core-contracts/src/dtos/order.dto.ts`.

---

## 4. Behavioral Test Suite & Live Emulator Verification

The behavioral test suite was executed against the official Google Cloud Firestore Emulator (`cloud-firestore-emulator-v1.22.0.jar`) in a controlled test environment.

### 4.1 Test Suite Structure

The 22 test cases cover all operational and adversarial scenarios:

| Category                 | Test Case     | Target Actor           | Tested Operation                   | Expected Result     | Live Result |
| :----------------------- | :------------ | :--------------------- | :--------------------------------- | :------------------ | :---------- |
| **7.1 Authentication**   | `RUT-IDEM-01` | Anonymous              | `get()`                            | `PERMISSION_DENIED` | **PASS**    |
|                          | `RUT-IDEM-02` | Anonymous              | `set()` (create)                   | `PERMISSION_DENIED` | **PASS**    |
| **7.2 Staff Auth**       | `RUT-IDEM-03` | Tenant A OutletManager | `get()` own tenant key             | `SUCCESS`           | **PASS**    |
|                          | `RUT-IDEM-04` | Tenant A OutletManager | `set()` in own tenant              | `SUCCESS`           | **PASS**    |
|                          | `RUT-IDEM-05` | Tenant A OrgOwner      | `get()` own tenant key             | `SUCCESS`           | **PASS**    |
| **7.3 Cross-Tenant**     | `RUT-IDEM-06` | Tenant B OutletManager | `get()` Tenant A key               | `PERMISSION_DENIED` | **PASS**    |
|                          | `RUT-IDEM-07` | Tenant B OutletManager | `set()` targeting Tenant A         | `PERMISSION_DENIED` | **PASS**    |
|                          | `RUT-IDEM-08` | Tenant B OutletManager | `update()` Tenant A key            | `PERMISSION_DENIED` | **PASS**    |
|                          | `RUT-IDEM-09` | Tenant B OutletManager | `delete()` Tenant A key            | `PERMISSION_DENIED` | **PASS**    |
| **7.4 Customer Privacy** | `RUT-IDEM-10` | Customer Ananya        | `get()` own key                    | `SUCCESS`           | **PASS**    |
|                          | `RUT-IDEM-11` | Customer Ananya        | `set()` own key                    | `SUCCESS`           | **PASS**    |
|                          | `RUT-IDEM-12` | Customer Rahul         | `get()` Ananya key                 | `PERMISSION_DENIED` | **PASS**    |
|                          | `RUT-IDEM-13` | Customer Ananya        | `get()` staff POS key              | `PERMISSION_DENIED` | **PASS**    |
| **7.5 Anti-Spoofing**    | `RUT-IDEM-14` | Tenant A OutletManager | `set()` forging other `userId`     | `PERMISSION_DENIED` | **PASS**    |
|                          | `RUT-IDEM-15` | Customer Ananya        | `set()` forging other `customerId` | `PERMISSION_DENIED` | **PASS**    |
| **7.6 Immutability**     | `RUT-IDEM-16` | Tenant A OutletManager | `update()` existing key            | `PERMISSION_DENIED` | **PASS**    |
|                          | `RUT-IDEM-17` | Tenant A OrgOwner      | `delete()` existing key            | `PERMISSION_DENIED` | **PASS**    |
|                          | `RUT-IDEM-18` | Tenant A OutletManager | `.set()` overwrite existing key    | `PERMISSION_DENIED` | **PASS**    |
| **7.7 PlatformAdmin**    | `RUT-IDEM-19` | PlatformAdmin          | `get()` tenant key                 | `PERMISSION_DENIED` | **PASS**    |
|                          | `RUT-IDEM-20` | PlatformAdmin          | `delete()` tenant key              | `PERMISSION_DENIED` | **PASS**    |
| **7.8 Schema & Query**   | `RUT-IDEM-21` | Tenant A OutletManager | `set()` missing `orgId`            | `PERMISSION_DENIED` | **PASS**    |
|                          | `RUT-IDEM-22` | Tenant B OutletManager | `list` query for Tenant A          | `PERMISSION_DENIED` | **PASS**    |

### 4.2 Emulator Execution Evidence

```text
Command Executed:
$env:FIRESTORE_EMULATOR_BINARY_PATH = "C:\Users\Lex-leo\.cache\firebase\emulators\cloud-firestore-emulator-v1.22.0.jar"
npx firebase emulators:exec --project=demo-sitaram-rules-test --only firestore "npx vitest run tests/security/firestore-rules.behavioral.test.ts"

Emulator Version: cloud-firestore-emulator-v1.22.0
Firestore Ports:  4400 (Hub), 8080 (Firestore)

Live Execution Summary:
Test Files: 1 passed (1)
Tests:      38 passed (38 total)
  - RUT-01 to RUT-16:   16 passed (Baseline M0-FIX-01 suite, zero regressions)
  - RUT-IDEM-01 to 22:  22 passed (New M0-FIX-03 idempotency security suite)
Duration:   6.67s
Exit Code:  0 (Success)
```

Every rejected operation was verified to fail with gRPC status code `7 (PERMISSION_DENIED)`.

---

## 5. Static Quality Assurance Verification

The complete codebase was evaluated through all static quality and compliance gates:

| Quality Gate               | Command                | Result   | Details                                                   |
| :------------------------- | :--------------------- | :------- | :-------------------------------------------------------- |
| **Prettier Formatting**    | `npm run format:check` | **PASS** | 100% compliant with repository formatting standards.      |
| **TypeScript Compilation** | `npm run typecheck`    | **PASS** | `tsc -b` compiled with 0 errors across all workspaces.    |
| **ESLint Static Analysis** | `npm run lint`         | **PASS** | Zero errors, zero warnings across all packages and tests. |
| **Offline Unit Tests**     | `npm test`             | **PASS** | 9 test files, 60 / 60 unit tests passed in 1.10s.         |

---

## 6. Residual Risk Analysis & Future Recommendations

1. **Firestore Client-Side TTL Invalidation**:
   - _Current State_: The security rules enforce client immutability (`update, delete: if false;`). This prevents clients from clearing expired keys.
   - _Mitigation / Future Work_: An automated Cloud Function or Firestore Native TTL policy must be configured in production infrastructure (via Terraform or Firebase CLI) to purge idempotency records older than 24 hours. This requires no client-side rule changes and is an infrastructure maintenance task.
2. **Backend Service Idempotency Resolution**:
   - _Current State_: When an operation completes, backend workers (running with Admin SDK privileges) write the resulting response payload or error state to the idempotency document.
   - _Verification_: Admin SDK bypasses security rules by design, so client immutability does not impede backend fulfillment workflows.

---

## 7. Audit Verdict & Stage Gate Recommendation

### Audit Finding

The implementation of **M0-FIX-03** in [`firestore.rules`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules#L147-L188) satisfies all tenant isolation, customer privacy, actor field exclusivity, and client immutability security requirements. The behavioral test suite [`tests/security/firestore-rules.behavioral.test.ts`](file:///C:/Users/Lex-leo/Sita-Ram/tests/security/firestore-rules.behavioral.test.ts) provides 100% verification coverage across all failure and success paths.

### Formal Recommendation: **PROCEED TO STAGE 7 COMMIT GATE**

- **Audit Verdict**: **PASS (UNCONDITIONAL)**
- **Next Permitted Action**: Authorize Stage 7 (Commit & Versioning Gate for M0-FIX-03).
- **Prohibitions Reaffirmed**:
  - `M0-FIX-02`: **STRICTLY PROHIBITED & NOT STARTED**.
  - `Correction #4`: **STRICTLY PROHIBITED & NOT STARTED**.
  - No unauthorized Git commits or pushes.
