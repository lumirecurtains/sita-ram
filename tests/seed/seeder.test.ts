/**
 * Sita Ram Operating System — Database Seeding Unit & Invariant Tests (M0.5)
 */

import { describe, it, expect } from 'vitest';
import {
  SEED_VERSION,
  BASELINE_EPOCH,
  validateSafetyGuard,
  isLoopbackHost,
} from '../../tools/emulators/seed/config.mjs';
import {
  ORGANIZATIONS_FIXTURE,
  BRANDS_FIXTURE,
  OUTLETS_FIXTURE,
  USERS_FIXTURE,
  CUSTOMERS_FIXTURE,
  CATEGORIES_FIXTURE,
  MENU_ITEMS_FIXTURE,
  ORDERS_FIXTURE,
  INGREDIENTS_FIXTURE,
  INVENTORY_MOVEMENTS_FIXTURE,
  AUDIT_LOGS_FIXTURE,
  validateReferentialIntegrity,
  getFixtureCounts,
} from '../../tools/emulators/seed/fixtures/index.mjs';
import { toFirestoreValue, toFirestoreDocument } from '../../tools/emulators/seed/loader.mjs';
import {
  UserRole,
  OrderState,
  DietaryTag,
  OrderDTOSchema,
  MenuItemSchema,
  CustomerProfileSchema,
} from '@sitaram/core-contracts';

describe('M0.5 — Local Database Seeding & Safety Guard Test Suite', () => {
  describe('1. 6-Layer Fail-Closed Pre-Flight Safety Guard', () => {
    it('approves compliant local emulator demo environment', () => {
      const result = validateSafetyGuard({
        projectId: 'demo-sitaram-local',
        firestoreHost: '127.0.0.1:8080',
        authHost: '127.0.0.1:9099',
        useEmulators: 'true',
      });
      expect(result.safe).toBe(true);
      expect(result.reasons).toHaveLength(0);
    });

    it('rejects non-demo project ID (Layer 1)', () => {
      const result = validateSafetyGuard({
        projectId: 'production-sitaram-live',
        firestoreHost: '127.0.0.1:8080',
        authHost: '127.0.0.1:9099',
        useEmulators: 'true',
      });
      expect(result.safe).toBe(false);
      expect(result.reasons.some((r) => r.includes('Layer 1 Violation'))).toBe(true);
    });

    it('rejects external Firestore host (Layer 2)', () => {
      const result = validateSafetyGuard({
        projectId: 'demo-sitaram-local',
        firestoreHost: 'firestore.googleapis.com:443',
        authHost: '127.0.0.1:9099',
        useEmulators: 'true',
      });
      expect(result.safe).toBe(false);
      expect(result.reasons.some((r) => r.includes('Layer 2 Violation'))).toBe(true);
    });

    it('rejects external Auth host (Layer 3)', () => {
      const result = validateSafetyGuard({
        projectId: 'demo-sitaram-local',
        firestoreHost: '127.0.0.1:8080',
        authHost: 'identitytoolkit.googleapis.com:443',
        useEmulators: 'true',
      });
      expect(result.safe).toBe(false);
      expect(result.reasons.some((r) => r.includes('Layer 3 Violation'))).toBe(true);
    });

    it('rejects disabled emulator flag (Layer 4)', () => {
      const result = validateSafetyGuard({
        projectId: 'demo-sitaram-local',
        firestoreHost: '127.0.0.1:8080',
        authHost: '127.0.0.1:9099',
        useEmulators: 'false',
      });
      expect(result.safe).toBe(false);
      expect(result.reasons.some((r) => r.includes('Layer 4 Violation'))).toBe(true);
    });

    it('identifies loopback addresses correctly', () => {
      expect(isLoopbackHost('127.0.0.1:8080')).toBe(true);
      expect(isLoopbackHost('localhost:9099')).toBe(true);
      expect(isLoopbackHost('::1:8080')).toBe(true);
      expect(isLoopbackHost('10.0.0.1:8080')).toBe(false);
      expect(isLoopbackHost('api.sitaram.in:80')).toBe(false);
    });
  });

  describe('2. Determinism & Version Invariants', () => {
    it('uses locked seed version and baseline epoch', () => {
      expect(SEED_VERSION).toBe('seed-v1.0.0');
      expect(BASELINE_EPOCH).toBe('2026-08-20T10:00:00.000Z');
    });

    it('returns exact static fixture counts', () => {
      const counts = getFixtureCounts();
      expect(counts.organizations).toBe(2);
      expect(counts.brands).toBe(3);
      expect(counts.outlets).toBe(3);
      expect(counts.users).toBe(13);
      expect(counts.customers).toBe(2);
      expect(counts.categories).toBe(3);
      expect(counts.menuItems).toBe(6);
      expect(counts.orders).toBe(4);
      expect(counts.ingredients).toBe(3);
      expect(counts.inventoryMovements).toBe(3);
      expect(counts.auditLogs).toBe(4);
    });

    it('passes referential integrity validation without errors', () => {
      expect(validateReferentialIntegrity()).toBe(true);
    });
  });

  describe('3. Core Contracts & Zod Schema Conformance', () => {
    it('validates customer profiles against CustomerProfileSchema', () => {
      for (const customer of CUSTOMERS_FIXTURE) {
        const parsed = CustomerProfileSchema.safeParse(customer);
        expect(parsed.success).toBe(true);
      }
    });

    it('validates menu items against MenuItemSchema', () => {
      for (const item of MENU_ITEMS_FIXTURE) {
        const parsed = MenuItemSchema.safeParse(item);
        expect(parsed.success).toBe(true);
        expect(Number.isInteger(item.basePricePaise)).toBe(true);
        expect(item.dietaryTag).toBe(DietaryTag.VEG);
      }
    });

    it('validates orders against OrderDTOSchema', () => {
      for (const order of ORDERS_FIXTURE) {
        const parsed = OrderDTOSchema.safeParse(order);
        expect(parsed.success).toBe(true);
        expect(Number.isInteger(order.pricing.grandTotalPaise)).toBe(true);
        expect(Number.isInteger(order.pricing.itemTotalPaise)).toBe(true);
        expect(order.pricing.currency).toBe('INR');
      }
    });

    it('uses canonical UserRole enums in custom claims', () => {
      const canonicalRoles = new Set(Object.values(UserRole));
      for (const user of USERS_FIXTURE) {
        expect(canonicalRoles.has(user.customClaims.role)).toBe(true);
      }
    });

    it('uses canonical OrderState enums exclusively in orders', () => {
      const canonicalOrderStates = new Set(Object.values(OrderState));
      for (const order of ORDERS_FIXTURE) {
        expect(canonicalOrderStates.has(order.state)).toBe(true);
        for (const history of order.statusHistory || []) {
          expect(canonicalOrderStates.has(history.state)).toBe(true);
        }
      }
    });

    it('uses canonical MovementType.RECEIPT for opening inventory batches', () => {
      for (const mov of INVENTORY_MOVEMENTS_FIXTURE) {
        expect(mov.movementType).toBe('RECEIPT');
        expect(mov.reason).toBe('INITIAL_OPENING_BATCH');
        expect(Number.isInteger(mov.quantityUnits)).toBe(true);
        expect(Number.isInteger(mov.unitCostPaise)).toBe(true);
      }
    });

    it('contains valid outlet, category, ingredient, and audit log structures', () => {
      expect(OUTLETS_FIXTURE.length).toBeGreaterThan(0);
      expect(CATEGORIES_FIXTURE.length).toBeGreaterThan(0);
      expect(INGREDIENTS_FIXTURE.length).toBeGreaterThan(0);
      expect(AUDIT_LOGS_FIXTURE.length).toBeGreaterThan(0);

      for (const outlet of OUTLETS_FIXTURE) {
        expect(outlet.status).toBe('ACTIVE');
      }
      for (const cat of CATEGORIES_FIXTURE) {
        expect(cat.isActive).toBe(true);
      }
      for (const ing of INGREDIENTS_FIXTURE) {
        expect(Number.isInteger(ing.costPerUnitPaise)).toBe(true);
      }
      for (const log of AUDIT_LOGS_FIXTURE) {
        expect(log.timestampIso).toBeDefined();
      }
    });
  });

  describe('4. Multi-Tenant Isolation Fixtures', () => {
    it('isolates Tenant A and Tenant B organizations and brands', () => {
      const tenantA = ORGANIZATIONS_FIXTURE.find((o) => o.id === 'org_gangaram_01');
      const tenantB = ORGANIZATIONS_FIXTURE.find((o) => o.id === 'org_mithai_co_02');
      expect(tenantA).toBeDefined();
      expect(tenantB).toBeDefined();

      const tenantABrands = BRANDS_FIXTURE.filter((b) => b.orgId === 'org_gangaram_01');
      const tenantBBrands = BRANDS_FIXTURE.filter((b) => b.orgId === 'org_mithai_co_02');

      expect(tenantABrands.length).toBe(2);
      expect(tenantBBrands.length).toBe(1);

      // Verify no cross-tenant brand references
      for (const brand of tenantABrands) {
        expect(brand.orgId).toBe('org_gangaram_01');
      }
      for (const brand of tenantBBrands) {
        expect(brand.orgId).toBe('org_mithai_co_02');
      }
    });

    it('isolates outlet staff to their respective tenant and outlet scopes', () => {
      const bareillyMgr = USERS_FIXTURE.find((u) => u.uid === 'user_mgr_bareilly_01');
      const hazratganjMgr = USERS_FIXTURE.find((u) => u.uid === 'user_mithai_mgr_02');

      expect(bareillyMgr?.customClaims.orgId).toBe('org_gangaram_01');
      expect(bareillyMgr?.customClaims.outletId).toBe('outlet_bareilly_civil_lines');

      expect(hazratganjMgr?.customClaims.orgId).toBe('org_mithai_co_02');
      expect(hazratganjMgr?.customClaims.outletId).toBe('outlet_lucknow_hazratganj');
    });
  });

  describe('5. Firestore REST Serialization', () => {
    it('serializes native primitive values to Firestore v1 REST format', () => {
      expect(toFirestoreValue('test')).toEqual({ stringValue: 'test' });
      expect(toFirestoreValue(42)).toEqual({ integerValue: '42' });
      expect(toFirestoreValue(3.14)).toEqual({ doubleValue: 3.14 });
      expect(toFirestoreValue(true)).toEqual({ booleanValue: true });
      expect(toFirestoreValue(null)).toEqual({ nullValue: null });
    });

    it('serializes complex objects to Firestore document structure', () => {
      const doc = toFirestoreDocument({
        name: 'Gulab Jamun',
        pricePaise: 16000,
        isAvailable: true,
        tags: ['VEG', 'SWEET'],
      });

      expect(doc).toEqual({
        fields: {
          name: { stringValue: 'Gulab Jamun' },
          pricePaise: { integerValue: '16000' },
          isAvailable: { booleanValue: true },
          tags: {
            arrayValue: {
              values: [{ stringValue: 'VEG' }, { stringValue: 'SWEET' }],
            },
          },
        },
      });
    });
  });
});
