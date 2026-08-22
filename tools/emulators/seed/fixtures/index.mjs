/**
 * Sita Ram Operating System — Fixtures Index & Referential Integrity Validator (M0.5)
 */

import { ORGANIZATIONS_FIXTURE, BRANDS_FIXTURE, OUTLETS_FIXTURE } from './tenants.mjs';
import { USERS_FIXTURE } from './users.mjs';
import { CUSTOMERS_FIXTURE } from './customers.mjs';
import { CATEGORIES_FIXTURE, MENU_ITEMS_FIXTURE } from './catalog.mjs';
import { ORDERS_FIXTURE } from './orders.mjs';
import { INGREDIENTS_FIXTURE, INVENTORY_MOVEMENTS_FIXTURE } from './inventory.mjs';
import { AUDIT_LOGS_FIXTURE } from './audit.mjs';

export {
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
};

/**
 * Validates referential integrity across all static seed fixtures.
 * Throws an Error if any foreign key / parent reference is broken.
 */
export function validateReferentialIntegrity() {
  const orgIds = new Set(ORGANIZATIONS_FIXTURE.map((o) => o.id));
  const brandIds = new Set(BRANDS_FIXTURE.map((b) => b.id));
  const outletIds = new Set(OUTLETS_FIXTURE.map((o) => o.id));
  const categoryIds = new Set(CATEGORIES_FIXTURE.map((c) => c.id));
  const menuItemIds = new Set(MENU_ITEMS_FIXTURE.map((m) => m.id));
  const customerIds = new Set(CUSTOMERS_FIXTURE.map((c) => c.id));
  const userIds = new Set(USERS_FIXTURE.map((u) => u.uid));
  const ingredientIds = new Set(INGREDIENTS_FIXTURE.map((i) => i.id));

  // 1. Brands must reference valid Org
  for (const brand of BRANDS_FIXTURE) {
    if (!orgIds.has(brand.orgId)) {
      throw new Error(
        `Integrity Error: Brand "${brand.id}" references missing orgId "${brand.orgId}".`,
      );
    }
  }

  // 2. Outlets must reference valid Org and Brand
  for (const outlet of OUTLETS_FIXTURE) {
    if (!orgIds.has(outlet.orgId)) {
      throw new Error(
        `Integrity Error: Outlet "${outlet.id}" references missing orgId "${outlet.orgId}".`,
      );
    }
    if (!brandIds.has(outlet.brandId)) {
      throw new Error(
        `Integrity Error: Outlet "${outlet.id}" references missing brandId "${outlet.brandId}".`,
      );
    }
  }

  // 3. Categories must reference valid Outlet
  for (const cat of CATEGORIES_FIXTURE) {
    if (!outletIds.has(cat.outletId)) {
      throw new Error(
        `Integrity Error: Category "${cat.id}" references missing outletId "${cat.outletId}".`,
      );
    }
  }

  // 4. Menu Items must reference valid Org, Brand, Outlet, Category
  for (const item of MENU_ITEMS_FIXTURE) {
    if (!orgIds.has(item.orgId)) {
      throw new Error(
        `Integrity Error: Menu Item "${item.id}" references missing orgId "${item.orgId}".`,
      );
    }
    if (!brandIds.has(item.brandId)) {
      throw new Error(
        `Integrity Error: Menu Item "${item.id}" references missing brandId "${item.brandId}".`,
      );
    }
    if (!outletIds.has(item.outletId)) {
      throw new Error(
        `Integrity Error: Menu Item "${item.id}" references missing outletId "${item.outletId}".`,
      );
    }
    if (!categoryIds.has(item.categoryId)) {
      throw new Error(
        `Integrity Error: Menu Item "${item.id}" references missing categoryId "${item.categoryId}".`,
      );
    }
  }

  // 5. Orders must reference valid Org, Brand, Outlet, Customer, and MenuItem
  for (const order of ORDERS_FIXTURE) {
    if (!orgIds.has(order.orgId)) {
      throw new Error(
        `Integrity Error: Order "${order.id}" references missing orgId "${order.orgId}".`,
      );
    }
    if (!brandIds.has(order.brandId)) {
      throw new Error(
        `Integrity Error: Order "${order.id}" references missing brandId "${order.brandId}".`,
      );
    }
    if (!outletIds.has(order.outletId)) {
      throw new Error(
        `Integrity Error: Order "${order.id}" references missing outletId "${order.outletId}".`,
      );
    }
    if (!customerIds.has(order.customerId)) {
      throw new Error(
        `Integrity Error: Order "${order.id}" references missing customerId "${order.customerId}".`,
      );
    }
    for (const orderItem of order.items) {
      if (!menuItemIds.has(orderItem.menuItemId)) {
        throw new Error(
          `Integrity Error: Order "${order.id}" item references missing menuItemId "${orderItem.menuItemId}".`,
        );
      }
    }
  }

  // 6. Inventory Movements must reference valid Org, Outlet, Ingredient, and User
  for (const mov of INVENTORY_MOVEMENTS_FIXTURE) {
    if (!orgIds.has(mov.orgId)) {
      throw new Error(
        `Integrity Error: Movement "${mov.id}" references missing orgId "${mov.orgId}".`,
      );
    }
    if (!outletIds.has(mov.outletId)) {
      throw new Error(
        `Integrity Error: Movement "${mov.id}" references missing outletId "${mov.outletId}".`,
      );
    }
    if (!ingredientIds.has(mov.ingredientId)) {
      throw new Error(
        `Integrity Error: Movement "${mov.id}" references missing ingredientId "${mov.ingredientId}".`,
      );
    }
    if (!userIds.has(mov.recordedByUserId)) {
      throw new Error(
        `Integrity Error: Movement "${mov.id}" references missing recordedByUserId "${mov.recordedByUserId}".`,
      );
    }
  }

  // 7. Audit logs must reference valid Org and Actor
  for (const log of AUDIT_LOGS_FIXTURE) {
    if (!orgIds.has(log.orgId)) {
      throw new Error(
        `Integrity Error: Audit Log "${log.id}" references missing orgId "${log.orgId}".`,
      );
    }
    if (!userIds.has(log.actorUserId)) {
      throw new Error(
        `Integrity Error: Audit Log "${log.id}" references missing actorUserId "${log.actorUserId}".`,
      );
    }
  }

  return true;
}

/**
 * Returns a summary count of all static fixtures.
 */
export function getFixtureCounts() {
  return {
    organizations: ORGANIZATIONS_FIXTURE.length,
    brands: BRANDS_FIXTURE.length,
    outlets: OUTLETS_FIXTURE.length,
    users: USERS_FIXTURE.length,
    customers: CUSTOMERS_FIXTURE.length,
    categories: CATEGORIES_FIXTURE.length,
    menuItems: MENU_ITEMS_FIXTURE.length,
    orders: ORDERS_FIXTURE.length,
    ingredients: INGREDIENTS_FIXTURE.length,
    inventoryMovements: INVENTORY_MOVEMENTS_FIXTURE.length,
    auditLogs: AUDIT_LOGS_FIXTURE.length,
  };
}
