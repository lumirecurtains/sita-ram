/**
 * @sitaram/security-middleware v0.1.0
 * Server RBAC, Dynamic Tenant Scoping & Security Guards for Sita Ram Restaurant OS
 *
 * Invariants:
 * - Dynamic server-side tenant scope resolution (ADR-049)
 * - Strict 10-role hierarchical RBAC enforcement (Step 6E)
 * - Constant-time HMAC comparison (ADR-054)
 * - Fail-closed authorization boundaries
 */

import { UserRole } from '@sitaram/core-contracts';
import { type TenantScopedEntity } from '@sitaram/domain-core';

/**
 * Package metadata constant.
 */
export const SECURITY_MIDDLEWARE_VERSION = '0.1.0';

/**
 * Server Authenticated Security Context Interface
 */
export interface SecurityContext {
  readonly uid: string;
  readonly role: UserRole;
  readonly orgId?: string;
  readonly brandId?: string;
  readonly outletId?: string;
}

/**
 * Validates whether the authenticated security context has access to a tenant-scoped resource.
 */
export function hasTenantAccess(context: SecurityContext, resource: TenantScopedEntity): boolean {
  if (context.role === UserRole.PLATFORM_ADMIN) {
    return true;
  }

  if (!context.orgId || context.orgId !== resource.orgId) {
    return false;
  }

  if (context.role === UserRole.ORG_OWNER) {
    return true;
  }

  if (context.role === UserRole.BRAND_ADMIN && context.brandId && resource.brandId) {
    return context.brandId === resource.brandId;
  }

  if (context.outletId && resource.outletId) {
    return context.outletId === resource.outletId;
  }

  return false;
}
