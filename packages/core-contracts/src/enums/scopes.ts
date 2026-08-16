/**
 * Canonical Multi-Tenant Hierarchy Scope Levels (DOM-02)
 * Strictly derived from Step 6C.5 ADR-020 and Step 6E Section 10.
 */

export enum TenantScopeLevel {
  PLATFORM = 'PLATFORM',
  ORGANIZATION = 'ORGANIZATION',
  BRAND = 'BRAND',
  OUTLET = 'OUTLET',
}
