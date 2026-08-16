import { TenantScopeLevel } from '../enums/scopes.js';
import { OrganizationId, BrandId, OutletId, UserId } from '../identifiers/index.js';
import { UserRole } from '../enums/roles.js';

/**
 * Multi-Tenant Scope Descriptors (DOM-02)
 * Defines the logical scope hierarchy without executing authorization logic.
 */

export interface PlatformScopeContext {
  readonly level: TenantScopeLevel.PLATFORM;
}

export interface OrganizationScopeContext {
  readonly level: TenantScopeLevel.ORGANIZATION;
  readonly orgId: OrganizationId;
}

export interface BrandScopeContext {
  readonly level: TenantScopeLevel.BRAND;
  readonly orgId: OrganizationId;
  readonly brandId: BrandId;
}

export interface OutletScopeContext {
  readonly level: TenantScopeLevel.OUTLET;
  readonly orgId: OrganizationId;
  readonly brandId: BrandId;
  readonly outletId: OutletId;
}

export type TenantScopeContext =
  PlatformScopeContext | OrganizationScopeContext | BrandScopeContext | OutletScopeContext;

/**
 * Staff Scope Context Token / Claims Hint
 */
export interface StaffScopeDescriptor {
  readonly userId: UserId;
  readonly role: UserRole;
  readonly orgId: OrganizationId;
  readonly brandId?: BrandId;
  readonly outletId?: OutletId;
  readonly assignedOutlets?: readonly OutletId[];
}
