/**
 * Sita Ram Operating System — Rules Unit Testing Environment Helper (M0-FIX-01)
 *
 * Provides isolated test environment initialization, token claim factories,
 * and deterministic fixture seeding for behavioral security rules verification.
 * Strictly uses local emulator namespace `demo-sitaram-rules-test`.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  RulesTestContext,
} from '@firebase/rules-unit-testing';

export const TEST_PROJECT_ID = 'demo-sitaram-rules-test';
export const EMULATOR_HOST = '127.0.0.1';
export const FIRESTORE_PORT = 8080;

/**
 * Creates and initializes a fresh RulesTestEnvironment connected to the local Firestore emulator.
 */
export async function createRulesTestEnvironment(): Promise<RulesTestEnvironment> {
  const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  return await initializeTestEnvironment({
    projectId: TEST_PROJECT_ID,
    firestore: {
      host: EMULATOR_HOST,
      port: FIRESTORE_PORT,
      rules: rulesContent,
    },
  });
}

/**
 * Canonical test tenant IDs
 */
export const TENANT_A_ORG_ID = 'org_gangaram_01';
export const TENANT_B_ORG_ID = 'org_mithai_co_02';

/**
 * Canonical test actor identities and claim factories
 */
export const TEST_ACTORS = {
  unauthenticated: (env: RulesTestEnvironment): RulesTestContext => env.unauthenticatedContext(),

  platformAdmin: (env: RulesTestEnvironment): RulesTestContext =>
    env.authenticatedContext('user_plat_admin_01', {
      role: 'PlatformAdmin',
    }),

  tenantAOwner: (env: RulesTestEnvironment): RulesTestContext =>
    env.authenticatedContext('user_org_owner_01', {
      role: 'OrgOwner',
      orgId: TENANT_A_ORG_ID,
    }),

  tenantBOwner: (env: RulesTestEnvironment): RulesTestContext =>
    env.authenticatedContext('user_mithai_owner_02', {
      role: 'OrgOwner',
      orgId: TENANT_B_ORG_ID,
    }),

  tenantAManager: (env: RulesTestEnvironment): RulesTestContext =>
    env.authenticatedContext('user_mgr_bareilly_01', {
      role: 'OutletManager',
      orgId: TENANT_A_ORG_ID,
      outletId: 'outlet_bareilly_civil_lines',
    }),

  tenantBManager: (env: RulesTestEnvironment): RulesTestContext =>
    env.authenticatedContext('user_mithai_mgr_02', {
      role: 'OutletManager',
      orgId: TENANT_B_ORG_ID,
      outletId: 'outlet_lucknow_hazratganj',
    }),

  customerAnanya: (env: RulesTestEnvironment): RulesTestContext =>
    env.authenticatedContext('cust_ananya_01', {
      role: 'Customer',
      customerId: 'cust_ananya_01',
    }),

  customerRahul: (env: RulesTestEnvironment): RulesTestContext =>
    env.authenticatedContext('cust_rahul_02', {
      role: 'Customer',
      customerId: 'cust_rahul_02',
    }),
};

/**
 * Seeds deterministic baseline documents required for behavioral assertions.
 * Uses `withSecurityRulesDisabled` to ensure setup is privileged and independent of rules.
 */
export async function seedBaselineFixtures(env: RulesTestEnvironment): Promise<void> {
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    // 1. Organizations
    await db.doc(`organizations/${TENANT_A_ORG_ID}`).set({
      id: TENANT_A_ORG_ID,
      name: 'Gangaram Sweets (Synthetic Franchise A)',
      status: 'ACTIVE',
    });

    await db.doc(`organizations/${TENANT_B_ORG_ID}`).set({
      id: TENANT_B_ORG_ID,
      name: 'Mithai Co Group (Synthetic Franchise B)',
      status: 'ACTIVE',
    });

    // 2. Customers
    await db.doc('customers/cust_ananya_01').set({
      id: 'cust_ananya_01',
      name: 'Ananya Sharma',
      phone: '+919999900001',
    });

    await db.doc('customers/cust_rahul_02').set({
      id: 'cust_rahul_02',
      name: 'Rahul Verma',
      phone: '+919999900002',
    });

    // 3. Orders (Order in Tenant A belonging to Customer Ananya)
    await db.doc('orders/ord_live_placed_01').set({
      id: 'ord_live_placed_01',
      orderNumber: 'GD-1001',
      orgId: TENANT_A_ORG_ID,
      brandId: 'brand_gangaram_sweets',
      outletId: 'outlet_bareilly_civil_lines',
      customerId: 'cust_ananya_01',
      state: 'placed',
    });

    // 4. Audit Logs (Immutable log in Tenant A)
    await db.doc('audit_logs/aud_01').set({
      id: 'aud_01',
      orgId: TENANT_A_ORG_ID,
      action: 'ORGANIZATION_INITIALIZED',
      actorUserId: 'user_plat_admin_01',
      timestampIso: '2026-08-20T10:00:00.000Z',
    });
  });
}
