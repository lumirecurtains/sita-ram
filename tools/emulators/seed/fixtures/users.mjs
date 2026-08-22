/**
 * Sita Ram Operating System — Canonical 10-Role Synthetic User Fixtures (M0.5)
 *
 * Mapped strictly to the 10 canonical roles defined in `@sitaram/core-contracts`.
 * Used for populating local Auth emulator and Firestore user metadata.
 */

export const USERS_FIXTURE = [
  // Global Platform Role
  {
    uid: 'user_plat_admin_01',
    email: 'platform.admin@sitaram.local',
    displayName: 'Platform Admin (Dev)',
    password: 'password123',
    customClaims: {
      role: 'PlatformAdmin',
    },
  },

  // Tenant A: Primary Org Leadership & Staff
  {
    uid: 'user_org_owner_01',
    email: 'owner.gangaram@sitaram.local',
    displayName: 'Ram Prakash (Org Owner)',
    password: 'password123',
    customClaims: {
      role: 'OrgOwner',
      orgId: 'org_gangaram_01',
    },
  },
  {
    uid: 'user_brand_admin_01',
    email: 'brand.admin@sitaram.local',
    displayName: 'Vikram Sethi (Brand Admin)',
    password: 'password123',
    customClaims: {
      role: 'BrandAdmin',
      orgId: 'org_gangaram_01',
      brandId: 'brand_gangaram_sweets',
    },
  },
  {
    uid: 'user_mgr_bareilly_01',
    email: 'mgr.bareilly@sitaram.local',
    displayName: 'Rajesh Kumar (Outlet Manager)',
    password: 'password123',
    customClaims: {
      role: 'OutletManager',
      orgId: 'org_gangaram_01',
      outletId: 'outlet_bareilly_civil_lines',
    },
  },
  {
    uid: 'user_cashier_01',
    email: 'cashier.bareilly@sitaram.local',
    displayName: 'Sunita Devi (Cashier)',
    password: 'password123',
    customClaims: {
      role: 'Cashier',
      orgId: 'org_gangaram_01',
      outletId: 'outlet_bareilly_civil_lines',
    },
  },
  {
    uid: 'user_captain_01',
    email: 'captain.bareilly@sitaram.local',
    displayName: 'Amit Sharma (Captain / Waiter)',
    password: 'password123',
    customClaims: {
      role: 'Captain',
      orgId: 'org_gangaram_01',
      outletId: 'outlet_bareilly_civil_lines',
    },
  },
  {
    uid: 'user_kitchen_01',
    email: 'kds.bareilly@sitaram.local',
    displayName: 'Chef Mohan (Kitchen Staff)',
    password: 'password123',
    customClaims: {
      role: 'KitchenStaff',
      orgId: 'org_gangaram_01',
      outletId: 'outlet_bareilly_civil_lines',
    },
  },
  {
    uid: 'user_rider_01',
    email: 'rider.bareilly@sitaram.local',
    displayName: 'Deepak Yadav (Delivery Rider)',
    password: 'password123',
    customClaims: {
      role: 'Rider',
      orgId: 'org_gangaram_01',
      outletId: 'outlet_bareilly_civil_lines',
    },
  },
  {
    uid: 'user_acct_01',
    email: 'acct.gangaram@sitaram.local',
    displayName: 'Sanjay Gupta (Accountant)',
    password: 'password123',
    customClaims: {
      role: 'Accountant',
      orgId: 'org_gangaram_01',
    },
  },

  // Tenant B: Secondary Competitor Staff (Isolation Verification)
  {
    uid: 'user_mithai_owner_02',
    email: 'owner.mithai@sitaram.local',
    displayName: 'Alok Verma (Mithai Co Owner)',
    password: 'password123',
    customClaims: {
      role: 'OrgOwner',
      orgId: 'org_mithai_co_02',
    },
  },
  {
    uid: 'user_mithai_mgr_02',
    email: 'mgr.hazratganj@sitaram.local',
    displayName: 'Pooja Saxena (Hazratganj Manager)',
    password: 'password123',
    customClaims: {
      role: 'OutletManager',
      orgId: 'org_mithai_co_02',
      outletId: 'outlet_lucknow_hazratganj',
    },
  },

  // End-User Customers
  {
    uid: 'cust_ananya_01',
    email: 'ananya.sharma@sitaram.local',
    displayName: 'Ananya Sharma (Customer)',
    password: 'password123',
    customClaims: {
      role: 'Customer',
      customerId: 'cust_ananya_01',
    },
  },
  {
    uid: 'cust_rahul_02',
    email: 'rahul.verma@sitaram.local',
    displayName: 'Rahul Verma (Customer)',
    password: 'password123',
    customClaims: {
      role: 'Customer',
      customerId: 'cust_rahul_02',
    },
  },
];
