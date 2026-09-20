/**
 * Sita Ram Operating System — Behavioral Firestore Security Rules Test Suite (M0-FIX-01)
 *
 * Evaluates real runtime ALLOW / DENY decisions using `@firebase/rules-unit-testing`
 * against the local Firestore Emulator.
 *
 * Implements the 16 canonical behavioral test cases (RUT-01 to RUT-16) locked in the
 * M0-FIX-01 specification.
 */

import { describe, it, beforeAll, beforeEach, afterAll } from 'vitest';
import { assertFails, assertSucceeds, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import {
  createRulesTestEnvironment,
  seedBaselineFixtures,
  TEST_ACTORS,
  TENANT_A_ORG_ID,
} from './rules-test-helper.js';

describe('Behavioral Firestore Security Rules Evaluation Engine (M0-FIX-01)', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await createRulesTestEnvironment();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    await seedBaselineFixtures(testEnv);
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe('1. Authentication Boundary Enforcement', () => {
    it('RUT-01: unauthenticated user cannot read organizations', async () => {
      const unauthedDb = TEST_ACTORS.unauthenticated(testEnv).firestore();
      await assertFails(unauthedDb.doc(`organizations/${TENANT_A_ORG_ID}`).get());
    });

    it('RUT-02: unauthenticated user cannot read orders', async () => {
      const unauthedDb = TEST_ACTORS.unauthenticated(testEnv).firestore();
      await assertFails(unauthedDb.doc('orders/ord_live_placed_01').get());
    });
  });

  describe('2. Multi-Tenant Scoping & Cross-Tenant Isolation', () => {
    it('RUT-03: Tenant B OrgOwner cannot read Tenant A organization', async () => {
      const tenantBDb = TEST_ACTORS.tenantBOwner(testEnv).firestore();
      await assertFails(tenantBDb.doc(`organizations/${TENANT_A_ORG_ID}`).get());
    });

    it('RUT-04: Tenant A OrgOwner can read Tenant A organization', async () => {
      const tenantADb = TEST_ACTORS.tenantAOwner(testEnv).firestore();
      await assertSucceeds(tenantADb.doc(`organizations/${TENANT_A_ORG_ID}`).get());
    });

    it('RUT-15: Tenant B OutletManager cannot update Tenant A order', async () => {
      const tenantBDb = TEST_ACTORS.tenantBManager(testEnv).firestore();
      await assertFails(
        tenantBDb.doc('orders/ord_live_placed_01').update({
          state: 'accepted',
        }),
      );
    });
  });

  describe('3. Platform Administration Authority', () => {
    it('RUT-05: PlatformAdmin can read any tenant organization', async () => {
      const adminDb = TEST_ACTORS.platformAdmin(testEnv).firestore();
      await assertSucceeds(adminDb.doc(`organizations/${TENANT_A_ORG_ID}`).get());
    });

    it('RUT-06: PlatformAdmin can create new organization', async () => {
      const adminDb = TEST_ACTORS.platformAdmin(testEnv).firestore();
      await assertSucceeds(
        adminDb.doc('organizations/org_new_01').set({
          id: 'org_new_01',
          name: 'Platform Created Org',
          status: 'ACTIVE',
        }),
      );
    });

    it('RUT-07: Tenant OrgOwner cannot create new organization', async () => {
      const ownerDb = TEST_ACTORS.tenantAOwner(testEnv).firestore();
      await assertFails(
        ownerDb.doc('organizations/org_new_02').set({
          id: 'org_new_02',
          name: 'Unauthorized Org Creation',
          status: 'ACTIVE',
        }),
      );
    });
  });

  describe('4. Customer Privacy & Ownership Boundaries', () => {
    it('RUT-08: customer can read own profile', async () => {
      const customerDb = TEST_ACTORS.customerAnanya(testEnv).firestore();
      await assertSucceeds(customerDb.doc('customers/cust_ananya_01').get());
    });

    it('RUT-09: customer cannot read another customer profile', async () => {
      const rahulDb = TEST_ACTORS.customerRahul(testEnv).firestore();
      await assertFails(rahulDb.doc('customers/cust_ananya_01').get());
    });

    it('RUT-10: customer cannot delete own profile (PlatformAdmin only)', async () => {
      const customerDb = TEST_ACTORS.customerAnanya(testEnv).firestore();
      await assertFails(customerDb.doc('customers/cust_ananya_01').delete());
    });

    it('RUT-11: customer can read own order', async () => {
      const customerDb = TEST_ACTORS.customerAnanya(testEnv).firestore();
      await assertSucceeds(customerDb.doc('orders/ord_live_placed_01').get());
    });

    it('RUT-12: customer cannot read another customer order', async () => {
      const rahulDb = TEST_ACTORS.customerRahul(testEnv).firestore();
      await assertFails(rahulDb.doc('orders/ord_live_placed_01').get());
    });

    it('RUT-13: customer cannot update own order (staff workflow required)', async () => {
      const customerDb = TEST_ACTORS.customerAnanya(testEnv).firestore();
      await assertFails(
        customerDb.doc('orders/ord_live_placed_01').update({
          state: 'cancelled',
        }),
      );
    });
  });

  describe('5. Staff Order Workflow Authorization', () => {
    it('RUT-14: authorized OutletManager can update order in own tenant', async () => {
      const managerDb = TEST_ACTORS.tenantAManager(testEnv).firestore();
      await assertSucceeds(
        managerDb.doc('orders/ord_live_placed_01').update({
          state: 'accepted',
        }),
      );
    });
  });

  describe('6. Immutable Audit Trail Invariants', () => {
    it('RUT-16: PlatformAdmin cannot delete audit logs (strictly immutable)', async () => {
      const adminDb = TEST_ACTORS.platformAdmin(testEnv).firestore();
      await assertFails(adminDb.doc('audit_logs/aud_01').delete());
    });
  });
});
