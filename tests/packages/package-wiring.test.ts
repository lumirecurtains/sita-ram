/**
 * Integration Test: Monorepo Package Scaffolding & Architecture Wiring
 * Milestone: M0.6
 *
 * Asserts:
 * 1. All 5 package manifests exist with correct metadata and semantic naming (@sitaram/*).
 * 2. All 5 package entrypoints exist and export version constants.
 * 3. Topological dependency graph satisfies strict unidirectional acyclic rules.
 * 4. TypeScript package imports resolve and interoperate cleanly.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Import from all 5 monorepo packages directly
import {
  CORE_CONTRACTS_VERSION,
  OrderState,
  UserRole,
} from '../../packages/core-contracts/src/index.js';
import {
  DOMAIN_CORE_VERSION,
  isValidOrderStateTransition,
} from '../../packages/domain-core/src/index.js';
import { INFRASTRUCTURE_VERSION } from '../../packages/infrastructure/src/index.js';
import {
  SECURITY_MIDDLEWARE_VERSION,
  hasTenantAccess,
} from '../../packages/security-middleware/src/index.js';
import {
  OBSERVABILITY_VERSION,
  LogLevel,
  sanitizeLogData,
} from '../../packages/observability/src/index.js';

describe('M0.6 Monorepo Package Scaffolding & Wiring', () => {
  const PACKAGES = [
    'core-contracts',
    'domain-core',
    'infrastructure',
    'security-middleware',
    'observability',
  ] as const;

  const packagesRoot = path.resolve(__dirname, '../../packages');

  it('should have all 5 package directories with package.json and tsconfig.json', () => {
    for (const pkg of PACKAGES) {
      const pkgDir = path.join(packagesRoot, pkg);
      expect(fs.existsSync(pkgDir), `Package directory missing: ${pkg}`).toBe(true);

      const pkgJsonPath = path.join(pkgDir, 'package.json');
      expect(fs.existsSync(pkgJsonPath), `package.json missing in ${pkg}`).toBe(true);

      const tsconfigPath = path.join(pkgDir, 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath), `tsconfig.json missing in ${pkg}`).toBe(true);

      const indexPath = path.join(pkgDir, 'src/index.ts');
      expect(fs.existsSync(indexPath), `src/index.ts missing in ${pkg}`).toBe(true);
    }
  });

  it('should verify all package manifests have correct names and version 0.1.0', () => {
    for (const pkg of PACKAGES) {
      const pkgJson = JSON.parse(
        fs.readFileSync(path.join(packagesRoot, pkg, 'package.json'), 'utf-8'),
      );
      expect(pkgJson.name).toBe(`@sitaram/${pkg}`);
      expect(pkgJson.version).toBe('0.1.0');
      expect(pkgJson.main).toBe('./dist/index.js');
      expect(pkgJson.types).toBe('./dist/index.d.ts');
    }
  });

  it('should export valid version constants from all 5 package entrypoints', () => {
    expect(CORE_CONTRACTS_VERSION).toBe('0.1.0');
    expect(DOMAIN_CORE_VERSION).toBe('0.1.0');
    expect(INFRASTRUCTURE_VERSION).toBe('0.1.0');
    expect(SECURITY_MIDDLEWARE_VERSION).toBe('0.1.0');
    expect(OBSERVABILITY_VERSION).toBe('0.1.0');
  });

  it('should enforce strict unidirectional dependency DAG without cycles', () => {
    const pkgDependencies: Record<string, string[]> = {};

    for (const pkg of PACKAGES) {
      const pkgJson = JSON.parse(
        fs.readFileSync(path.join(packagesRoot, pkg, 'package.json'), 'utf-8'),
      );
      pkgDependencies[pkg] = Object.keys(pkgJson.dependencies || {});
    }

    // 1. core-contracts has 0 @sitaram/* dependencies
    expect(pkgDependencies['core-contracts'].filter((d) => d.startsWith('@sitaram/'))).toEqual([]);

    // 2. domain-core depends ONLY on core-contracts
    expect(pkgDependencies['domain-core']).toContain('@sitaram/core-contracts');
    expect(pkgDependencies['domain-core']).not.toContain('@sitaram/infrastructure');
    expect(pkgDependencies['domain-core']).not.toContain('@sitaram/security-middleware');

    // 3. infrastructure depends on core-contracts and domain-core, NOT security-middleware
    expect(pkgDependencies['infrastructure']).toContain('@sitaram/core-contracts');
    expect(pkgDependencies['infrastructure']).toContain('@sitaram/domain-core');
    expect(pkgDependencies['infrastructure']).not.toContain('@sitaram/security-middleware');

    // 4. security-middleware depends on core-contracts, domain-core, infrastructure
    expect(pkgDependencies['security-middleware']).toContain('@sitaram/core-contracts');
    expect(pkgDependencies['security-middleware']).toContain('@sitaram/domain-core');
    expect(pkgDependencies['security-middleware']).toContain('@sitaram/infrastructure');

    // 5. observability depends ONLY on core-contracts
    expect(pkgDependencies['observability']).toContain('@sitaram/core-contracts');
    expect(pkgDependencies['observability']).not.toContain('@sitaram/domain-core');
    expect(pkgDependencies['observability']).not.toContain('@sitaram/infrastructure');
  });

  it('should verify domain-core order transition contract behavior', () => {
    expect(isValidOrderStateTransition(OrderState.PLACED, OrderState.ACCEPTED)).toBe(true);
    expect(isValidOrderStateTransition(OrderState.PLACED, OrderState.CANCELLED)).toBe(true);
    expect(isValidOrderStateTransition(OrderState.PLACED, OrderState.DELIVERED)).toBe(false);
    expect(isValidOrderStateTransition(OrderState.DELIVERED, OrderState.CUSTOMER_CONFIRMED)).toBe(
      true,
    );
    expect(isValidOrderStateTransition(OrderState.CANCELLED, OrderState.ACCEPTED)).toBe(false);
  });

  it('should verify security-middleware tenant access scoping behavior', () => {
    const resource = {
      id: 'res_01',
      orgId: 'org_gangaram_01',
      outletId: 'outlet_civil_lines_01',
      createdAt: '2026-08-20T10:00:00Z',
      updatedAt: '2026-08-20T10:00:00Z',
    };

    // PlatformAdmin has global access
    expect(hasTenantAccess({ uid: 'u1', role: UserRole.PLATFORM_ADMIN }, resource)).toBe(true);

    // OrgOwner with matching orgId has access
    expect(
      hasTenantAccess({ uid: 'u2', role: UserRole.ORG_OWNER, orgId: 'org_gangaram_01' }, resource),
    ).toBe(true);

    // OrgOwner with different orgId is rejected
    expect(
      hasTenantAccess({ uid: 'u3', role: UserRole.ORG_OWNER, orgId: 'org_mithai_02' }, resource),
    ).toBe(false);

    // OutletManager with matching outlet has access
    expect(
      hasTenantAccess(
        {
          uid: 'u4',
          role: UserRole.OUTLET_MANAGER,
          orgId: 'org_gangaram_01',
          outletId: 'outlet_civil_lines_01',
        },
        resource,
      ),
    ).toBe(true);

    // OutletManager with wrong outlet is rejected
    expect(
      hasTenantAccess(
        {
          uid: 'u5',
          role: UserRole.OUTLET_MANAGER,
          orgId: 'org_gangaram_01',
          outletId: 'outlet_other_02',
        },
        resource,
      ),
    ).toBe(false);
  });

  it('should verify observability PII sanitization and LogLevel behavior', () => {
    expect(LogLevel.INFO).toBe('INFO');
    expect(LogLevel.AUDIT).toBe('AUDIT');

    const rawLog = {
      message: 'Payment received',
      customerPhone: '+919999900001',
      otpCode: '123456',
      userToken: 'eyJhbGciOiJub25lIn0',
      orderId: 'ord_123',
      amountPaise: 45000,
    };

    const sanitized = sanitizeLogData(rawLog);
    expect(sanitized.customerPhone).toBe('[REDACTED]');
    expect(sanitized.otpCode).toBe('[REDACTED]');
    expect(sanitized.userToken).toBe('[REDACTED]');
    expect(sanitized.orderId).toBe('ord_123');
    expect(sanitized.amountPaise).toBe(45000);
  });
});
