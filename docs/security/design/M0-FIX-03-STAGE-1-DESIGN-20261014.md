# Stage 1 Analysis & Design: Multi-Tenant Scoping & Lifecycle for Idempotency Keys

**Design Identifier**: M0-FIX-03-STAGE-1-DESIGN-20261014  
**Work Item**: M0-FIX-03 (`idempotency_keys` Collection Scoping & Invariant Design)  
**Lifecycle Stage**: Stage 1 — Analysis & Design ONLY  
**Date**: 2026-10-14  
**Author**: Antigravity Autonomous Pair Programmer  
**Repository**: `C:/Users/Lex-leo/Sita-Ram`  
**Baseline Git HEAD**: `9125d7ac30a592579714d9bb947f5bdf8014f630`  
**Governing Gate**: Sita Ram Master Delivery Lifecycle Specification (Locked Stages 0–7)  
**Status**: DESIGN COMPLETE — PENDING HUMAN GATE REVIEW (STAGE 2)

---

## 1. Executive Summary

### 1.1 Objective & Context

This Stage 1 Analysis and Design document establishes the architectural threat model, tenant-scoping invariants, structural design alternatives, and behavioral verification matrix for the `idempotency_keys` collection.

In `firestore.rules` (lines 147–149), the current repository baseline contains:

```javascript
match /idempotency_keys/{keyId} {
  allow read, write: if isAuthenticated();
}
```

As initially flagged during the Phase 0 Red Team Audit (§6, Defect P2), this rule allows any authenticated Firebase user—regardless of tenant affiliation, organization membership, or role—to execute unconstrained read, create, update, delete, and list operations across all stored idempotency keys.

### 1.2 Investigative Findings

1. **The Reported Vulnerability is 100% CONFIRMED:**  
   The rule lacks any tenant membership predicate (`isTenantMember(orgId)`), owner check (`isCustomerOwner()`), or role restriction (`isStaffMember()`).
2. **Severe Cross-Tenant Attack Surface:**  
   An authenticated user from Tenant B (`org_mithai_co_02`) can maliciously delete or overwrite idempotency keys belonging to Tenant A (`org_gangaram_01`). Deleting an active idempotency key allows replaying order placement or payment transactions, defeating ADR-025 replay protection.
3. **Information Disclosure:**  
   Allowing unrestricted `read` (including `list` queries) permits unauthorized users to query and inspect transaction metadata, order associations, and client operation identifiers across tenant boundaries.
4. **Zero Client Breaking Changes / Zero Migration Burden:**  
   Inspection confirms that `apps/` contains zero client code (only `.gitkeep`), `packages/infrastructure` contains only generic repository interfaces, and seed tooling does not populate `/idempotency_keys/`. No production code or active clients currently depend on the document path or schema. Remediation can be enacted cleanly without data migrations.

### 1.3 Recommendation

Adopt **Design Alternative B (Tenant-Scoped Subcollection Architecture)**:  
Nest idempotency keys under the tenant path hierarchy:
`/organizations/{orgId}/idempotency_keys/{keyId}`  
Enforce strict client immutability (`allow update, delete: if false;`), mandate actor-to-tenant binding on `create`, and restrict `read` to authorized tenant staff and the originating customer.

---

## 2. Confirmed Evidence & Line References

| File Path                                                                                                                                                  | Lines            | Inspected Construct / Rule                                                     | Technical Finding                                                                                                                            |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------- | :----------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| [`firestore.rules`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules)                                                                                     | 147–149          | `match /idempotency_keys/{keyId} { allow read, write: if isAuthenticated(); }` | **Confirmed Vulnerability.** Full CRUD permissions granted to any authenticated user with zero tenant or role constraints.                   |
| [`firestore.rules`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.rules)                                                                                     | 20–25            | `function isTenantMember(orgId)`                                               | Evaluates `isPlatformAdmin() \|\| (request.auth.token.orgId == orgId)`. Not utilized in `idempotency_keys`.                                  |
| [`packages/core-contracts/src/identifiers/index.ts`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/identifiers/index.ts)                   | 4–13             | `IdempotencyKey` branded type (ADR-025)                                        | Establishes `ClientOperationId !== IdempotencyKey !== ServerRecordId`. Branded nominal string type.                                          |
| [`packages/core-contracts/src/schemas/identifiers.schema.ts`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/schemas/identifiers.schema.ts) | 24–27            | `IdempotencyKeySchema`                                                         | Validates string with `min(1)` and `max(128)`.                                                                                               |
| [`packages/core-contracts/src/dtos/order.dto.ts`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/dtos/order.dto.ts)                         | 43–48            | `OrderDTO` fields                                                              | Order requires `idempotencyKey: IdempotencyKey`, `orgId: OrganizationId`, `customerId: CustomerId`, `clientOperationId?: ClientOperationId`. |
| [`packages/core-contracts/src/dtos/payment.dto.ts`](file:///C:/Users/Lex-leo/Sita-Ram/packages/core-contracts/src/dtos/payment.dto.ts)                     | 4–12             | `PaymentIntentDTO` fields                                                      | Payment intent requires `orderId: OrderId`, `idempotencyKey: IdempotencyKey`, `clientOperationId?: ClientOperationId`.                       |
| [`firestore.indexes.json`](file:///C:/Users/Lex-leo/Sita-Ram/firestore.indexes.json)                                                                       | 1–42             | Composite index definitions                                                    | Contains indexes for `orders`, `menu_items`, `audit_logs`. Zero indexes configured for `idempotency_keys`.                                   |
| [`tools/emulators/seed/fixtures/orders.mjs`](file:///C:/Users/Lex-leo/Sita-Ram/tools/emulators/seed/fixtures/orders.mjs)                                   | 21, 81, 136, 193 | Seed order fixtures                                                            | Orders contain nominal idempotency keys (e.g. `'idem_ord_live_01'`). No separate idempotency collection seeded.                              |
| [`apps/`](file:///C:/Users/Lex-leo/Sita-Ram/apps)                                                                                                          | N/A              | Application workspace root                                                     | Empty scaffold (`.gitkeep` only). Zero applications currently consume the `idempotency_keys` collection.                                     |

---

## 3. Threat Model

```
                    [ATTACK SURFACE: /idempotency_keys/{keyId}]
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
 [Threat 1: Cross-Tenant]      [Threat 2: Replay Attack]    [Threat 3: Information Leak]
 Attacker in Tenant B deletes   Attacker deletes key ord_01  Attacker queries collection
 or overwrites Tenant A keys.  Client retries transaction.  to discover active order
 Result: Isolation breach.     Result: Duplicate charges.   IDs & client operation IDs.
```

### 3.1 Specific Threat Scenarios

1. **Replay Attack via Key Deletion**:  
   An idempotency key guarantees that retried network requests execute exactly once. If a malicious client (or disgruntled staff/customer) deletes an idempotency key document, a retried payment or order placement will be processed as a brand-new transaction, resulting in duplicate order creation and double billing.
2. **Cross-Tenant State Hijacking**:  
   A client from Tenant B can pre-create or overwrite a key ID matching Tenant A's predictable identifier format (e.g. `idem_ord_1001`), locking Tenant A's cashier out of processing the transaction or forging the cached result.
3. **Data Enumeration via Collection Query**:  
   Because `allow read` includes `list`, any authenticated actor can run `getDocs(collection(db, 'idempotency_keys'))` and harvest all active platform transaction records.

---

## 4. Design Alternatives & Trade-Offs

### Alternative A: Root Collection with Mandatory Payload Validation

- **Document Path**: `/idempotency_keys/{keyId}`
- **Schema Requirement**: Document payload must include `orgId`, `userId`, `createdAtIso`, `status`.
- **Proposed Rules**:
  ```javascript
  match /idempotency_keys/{keyId} {
    allow create: if isAuthenticated() &&
      request.resource.data.orgId == request.auth.token.orgId &&
      request.resource.data.userId == request.auth.uid;
    allow read: if isAuthenticated() && (
      isPlatformAdmin() ||
      (resource.data.orgId == request.auth.token.orgId && (
        isStaffMember(resource.data.orgId) ||
        resource.data.userId == request.auth.uid
      ))
    );
    allow update, delete: if false;
  }
  ```
- **Pros**: Global key uniqueness across the entire Firestore database instance.
- **Cons**:
  - `Customer` tokens do not contain `orgId` custom claims (customers have `customerId`, as verified in the Red Team Audit). A customer placing an order across tenants would fail the `request.auth.token.orgId` check.
  - Requires document field inspection (`resource.data.orgId`) on every read.
  - Queries (`list`) require strict composite filters matching `orgId` to prevent permission denial.

---

### Alternative B: Tenant-Scoped Subcollections (RECOMMENDED)

- **Document Path**: `/organizations/{orgId}/idempotency_keys/{keyId}`
- **Schema Requirement**: Document includes `userId`, `clientOperationId`, `state`, `createdAtIso`, `expiresAtIso`.
- **Proposed Rules**:
  ```javascript
  match /organizations/{orgId}/idempotency_keys/{keyId} {
    allow create: if isAuthenticated() && (
      (isTenantMember(orgId) && isStaffMember(orgId) && request.resource.data.userId == request.auth.uid) ||
      (hasRole('Customer') && request.resource.data.userId == request.auth.uid)
    );
    allow read: if isAuthenticated() && (
      isPlatformAdmin() ||
      (isTenantMember(orgId) && isStaffMember(orgId)) ||
      (hasRole('Customer') && resource.data.userId == request.auth.uid)
    );
    allow update, delete: if false; // Immutable to clients
  }
  ```
- **Pros**:
  - **Structural Path Isolation**: Follows the multi-tenant hierarchy established in Step 6C ADR-020. Tenant boundary is guaranteed by path segments, eliminating cross-tenant query leaks by construction.
  - **Customer Compatibility**: Customers can safely create and read their own keys within the organization they are ordering from without requiring an `orgId` token claim.
  - **Simpler Rules**: Leverages existing `isTenantMember(orgId)` and `isStaffMember(orgId)` helper functions.
  - **Natural Partitioning**: Each tenant's idempotency ledger is completely independent.
- **Cons**: Key uniqueness is scoped per tenant rather than platform-wide (standard and desirable in multi-tenant SaaS).

---

### Alternative C: Server-Only Idempotency (Admin SDK Direct)

- **Document Path**: `/idempotency_keys/{keyId}` (or subcollection), with rules:
  ```javascript
  match /idempotency_keys/{keyId} {
    allow read, write: if false; // Cloud Functions / Admin SDK only
  }
  ```
- **Pros**: Complete elimination of client attack surface. Only trusted server runtimes handle idempotency.
- **Cons**: Incompatible with offline-first POS clients that must write local orders directly to Firestore emulator/sync queue during local-network operations.
- **Verdict**: Useful as an architecture pattern for Cloud API endpoints, but rules should support direct POS client operation under Alternative B.

---

## 5. Proposed Authorization Matrix & Invariants

### 5.1 Invariants

- **INV-IDEM-01 (Strict Tenant Isolation)**: An actor from Tenant B can never create, read, query, update, or delete an idempotency key in Tenant A.
- **INV-IDEM-02 (Client Immutability)**: Once created, idempotency keys cannot be modified or deleted by any client actor (`allow update, delete: if false;`).
- **INV-IDEM-03 (Identity Binding)**: An actor can only create an idempotency key bearing their own `userId` (`request.resource.data.userId == request.auth.uid`).
- **INV-IDEM-04 (Role-Appropriate Access)**:
  - Staff members (`Cashier`, `OutletManager`, `OrgOwner`) can read and create idempotency keys within their tenant.
  - Customers can read and create only idempotency keys where `userId == request.auth.uid`.
- **INV-IDEM-05 (Fail-Closed Default)**: Unauthenticated requests and unauthorized actors are rejected unconditionally.

### 5.2 CRUD Authorization Matrix (Alternative B)

| Actor / Context                      | Target Path          | Read (`get`) | Query (`list`) | Create             | Update  | Delete  |
| :----------------------------------- | :------------------- | :----------- | :------------- | :----------------- | :------ | :------ |
| **Unauthenticated**                  | Any                  | ❌ DENY      | ❌ DENY        | ❌ DENY            | ❌ DENY | ❌ DENY |
| **Tenant A Staff (Cashier/Manager)** | Tenant A Path        | ✅ ALLOW     | ✅ ALLOW       | ✅ ALLOW (Own UID) | ❌ DENY | ❌ DENY |
| **Tenant A Staff (Cashier/Manager)** | Tenant B Path        | ❌ DENY      | ❌ DENY        | ❌ DENY            | ❌ DENY | ❌ DENY |
| **Tenant A Customer (Ananya)**       | Tenant A (Own UID)   | ✅ ALLOW     | ❌ DENY        | ✅ ALLOW           | ❌ DENY | ❌ DENY |
| **Tenant A Customer (Ananya)**       | Tenant A (Other UID) | ❌ DENY      | ❌ DENY        | ❌ DENY            | ❌ DENY | ❌ DENY |
| **Tenant B Customer (Rahul)**        | Tenant A Path        | ❌ DENY      | ❌ DENY        | ❌ DENY            | ❌ DENY | ❌ DENY |
| **PlatformAdmin**                    | Any Tenant Path      | ✅ ALLOW     | ✅ ALLOW       | ❌ DENY            | ❌ DENY | ❌ DENY |

---

## 6. Behavioral Verification Matrix

When Stage 3 implementation is authorized, the following behavioral test suite will validate the rule set:

| Test ID         | Test Category              | Target Document Path                       | Actor Context    | Operation                       | Expected Outcome |
| :-------------- | :------------------------- | :----------------------------------------- | :--------------- | :------------------------------ | :--------------- |
| **RUT-IDEM-01** | Unauthenticated            | `/organizations/org_A/idempotency_keys/k1` | Unauthenticated  | `get()`                         | `assertFails`    |
| **RUT-IDEM-02** | Unauthenticated            | `/organizations/org_A/idempotency_keys/k1` | Unauthenticated  | `set()`                         | `assertFails`    |
| **RUT-IDEM-03** | Tenant Isolation           | `/organizations/org_A/idempotency_keys/k1` | Tenant B Manager | `get()`                         | `assertFails`    |
| **RUT-IDEM-04** | Tenant Isolation           | `/organizations/org_A/idempotency_keys/k1` | Tenant B Manager | `set()`                         | `assertFails`    |
| **RUT-IDEM-05** | Authorized Staff Create    | `/organizations/org_A/idempotency_keys/k1` | Tenant A Manager | `set({ userId: mgrUid, ... })`  | `assertSucceeds` |
| **RUT-IDEM-06** | Authorized Staff Read      | `/organizations/org_A/idempotency_keys/k1` | Tenant A Manager | `get()`                         | `assertSucceeds` |
| **RUT-IDEM-07** | Immutability: Update       | `/organizations/org_A/idempotency_keys/k1` | Tenant A Manager | `update({ state: 'DONE' })`     | `assertFails`    |
| **RUT-IDEM-08** | Immutability: Delete       | `/organizations/org_A/idempotency_keys/k1` | Tenant A Owner   | `delete()`                      | `assertFails`    |
| **RUT-IDEM-09** | Immutability: Admin Delete | `/organizations/org_A/idempotency_keys/k1` | PlatformAdmin    | `delete()`                      | `assertFails`    |
| **RUT-IDEM-10** | Identity Mismatch          | `/organizations/org_A/idempotency_keys/k1` | Tenant A Manager | `set({ userId: 'other_user' })` | `assertFails`    |
| **RUT-IDEM-11** | Customer Own Key Read      | `/organizations/org_A/idempotency_keys/k2` | Customer Ananya  | `get()` (own key)               | `assertSucceeds` |
| **RUT-IDEM-12** | Customer Other Key Read    | `/organizations/org_A/idempotency_keys/k1` | Customer Ananya  | `get()` (staff key)             | `assertFails`    |

---

## 7. Acceptance Criteria

- **AC-01 (Path & Tenant Scoping)**: Idempotency keys must be strictly partitioned by organization identifier.
- **AC-02 (Client Immutability)**: Firestore rules must block 100% of client `update` and `delete` requests.
- **AC-03 (Cross-Tenant Rejection)**: Any cross-tenant read or write must fail with `PERMISSION_DENIED`.
- **AC-04 (Behavioral Proof)**: All 12 test cases in the verification matrix (`RUT-IDEM-01` through `RUT-IDEM-12`) must pass against the local Firestore emulator.
- **AC-05 (Backward Compatibility)**: Existing contracts in `packages/core-contracts` (`IdempotencyKey`, `OrderDTO`, `PaymentIntentDTO`) must remain fully compatible without schema changes.

---

## 8. Dependencies, Migration & Unresolved Decisions

### 8.1 Dependencies

- **Stage 2 Human Gate Approval**: Implementation authorization under `WORK-AUTH-01`.
- **`Correction #4` Test Harness Enhancements**: The typed test actors designed in `CORRECTION-4-STAGE-1-DESIGN-20261014.md` will directly power the behavioral tests.

### 8.2 Migration Considerations

- **Migration Impact: NONE.**  
  Because no client applications or backend services are writing to `/idempotency_keys/` in the repository today, transitioning from root collection to subcollection requires zero data migration and zero client refactoring.

### 8.3 Unresolved Governance Decisions

1. **Subcollection vs. Root Selection**:  
   Does the Project Owner formally approve Alternative B (subcollection `/organizations/{orgId}/idempotency_keys/{keyId}`), or is a root-level collection with validated fields required for global indexing?  
   _Design Recommendation: Adopt Alternative B._
2. **TTL & Cleanup Strategy**:  
   Because Firestore rules cannot auto-delete documents, production deployment will require either a Firebase TTL policy on an `expiresAt` timestamp field, or a scheduled Cloud Function. This should be planned for Phase 1.

---

## 9. Explicit Implementation-Out-of-Scope Statement

In strict compliance with the locked Sita Ram Master Delivery Lifecycle Specification (Stages 0–7):

- **This document represents Stage 1 (Analysis & Design) ONLY.**
- **Zero application code, security rules (`firestore.rules`), test files, dependencies, or configuration files were modified.**
- **`M0-FIX-03`, `M0-FIX-02`, and `Correction #4` remain STRICTLY NOT AUTHORIZED and NOT STARTED for implementation.**
- **Zero Git commits, pushes, tags, deployments, or Firebase resource mutations were executed.**
