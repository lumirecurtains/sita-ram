/**
 * Canonical Role-Based Access Control (RBAC) Role Vocabulary (DOM-01, DOM-02)
 * Strictly derived from Step 6E Section 8 Table & Step 6G.5.
 */

export enum UserRole {
  PLATFORM_ADMIN = 'PlatformAdmin',
  ORG_OWNER = 'OrgOwner',
  BRAND_ADMIN = 'BrandAdmin',
  OUTLET_MANAGER = 'OutletManager',
  CASHIER = 'Cashier',
  CAPTAIN = 'Captain',
  KITCHEN_STAFF = 'KitchenStaff',
  RIDER = 'Rider',
  ACCOUNTANT = 'Accountant',
  CUSTOMER = 'Customer',
}
