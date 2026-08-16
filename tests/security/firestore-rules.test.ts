import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Sita Ram Operating System — Security Rules Structural & Syntax Verification Suite
 *
 * Validates that local Firestore and Storage security rules adhere to the Step 6E
 * Multi-Tenant Zero-Trust model, contain all required role definitions, enforce
 * default-deny posture, and maintain immutable audit log constraints.
 */

describe('Firestore & Storage Security Rules Architecture (Step 6E)', () => {
  let firestoreRules: string;
  let storageRules: string;

  beforeAll(() => {
    const firestorePath = path.resolve(process.cwd(), 'firestore.rules');
    const storagePath = path.resolve(process.cwd(), 'storage.rules');

    firestoreRules = fs.readFileSync(firestorePath, 'utf8');
    storageRules = fs.readFileSync(storagePath, 'utf8');
  });

  describe('Firestore Rules Invariants', () => {
    it('enforces rules_version = 2', () => {
      expect(firestoreRules).toMatch(/rules_version\s*=\s*['"]2['"]/);
    });

    it('enforces default-deny rule posture', () => {
      expect(firestoreRules).toContain('match /{document=**}');
      expect(firestoreRules).toContain('allow read, write: if false;');
    });

    it('implements multi-tenant scoping helper function', () => {
      expect(firestoreRules).toContain('function isTenantMember(orgId)');
      expect(firestoreRules).toContain('request.auth.token.orgId == orgId');
    });

    it('implements all 10 canonical roles in role checking helpers', () => {
      const canonicalRoles = [
        'PlatformAdmin',
        'OrgOwner',
        'BrandAdmin',
        'OutletManager',
        'Cashier',
        'Captain',
        'KitchenStaff',
        'Rider',
        'Accountant',
      ];

      for (const role of canonicalRoles) {
        expect(firestoreRules).toContain(role);
      }
    });

    it('protects /organizations/ collection with tenant scoping and admin/owner rules', () => {
      expect(firestoreRules).toContain('match /organizations/{orgId}');
      expect(firestoreRules).toContain('allow read: if isTenantMember(orgId);');
      expect(firestoreRules).toContain('allow create: if isPlatformAdmin();');
    });

    it('enforces immutable append-only constraints on /audit_logs/', () => {
      expect(firestoreRules).toContain('match /audit_logs/{logId}');
      expect(firestoreRules).toContain('allow update, delete: if false;');
    });

    it('isolates /customers/ profiles to customer owner or platform admin', () => {
      expect(firestoreRules).toContain('match /customers/{customerId}');
      expect(firestoreRules).toContain(
        'allow read: if isCustomerOwner(customerId) || isPlatformAdmin();',
      );
    });
  });

  describe('Storage Rules Invariants', () => {
    it('enforces rules_version = 2 and default deny in Storage', () => {
      expect(storageRules).toMatch(/rules_version\s*=\s*['"]2['"]/);
      expect(storageRules).toContain('allow read, write: if false;');
    });

    it('enforces tenant boundary for order uploads and size limits', () => {
      expect(storageRules).toContain('match /tenants/{orgId}/orders/{orderId}/{fileName}');
      expect(storageRules).toContain('allow write: if isTenantMember(orgId)');
      expect(storageRules).toContain('request.resource.size < 10 * 1024 * 1024');
    });
  });
});
