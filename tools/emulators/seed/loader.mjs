/**
 * Sita Ram Operating System — Local Emulator REST Data Loader (M0.5)
 *
 * Implements deterministic REST-based fixture loading into local Firestore and Auth emulators.
 * Strictly gated by the 6-layer fail-closed safety validator.
 */

import { SEED_CONFIG, validateSafetyGuard, probePortReachable } from './config.mjs';
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
} from './fixtures/index.mjs';

/**
 * Converts a native JavaScript value into Google Cloud Firestore v1 REST representation.
 * @param {any} value
 * @returns {Record<string, any>}
 */
export function toFirestoreValue(value) {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }
  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return { integerValue: String(value) };
    }
    return { doubleValue: value };
  }
  if (typeof value === 'string') {
    return { stringValue: value };
  }
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(toFirestoreValue),
      },
    };
  }
  if (typeof value === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(value)) {
      if (v !== undefined) {
        fields[k] = toFirestoreValue(v);
      }
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

/**
 * Converts a JavaScript object to a Firestore document body.
 * @param {Record<string, any>} obj
 * @returns {{ fields: Record<string, any> }}
 */
export function toFirestoreDocument(obj) {
  const fields = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      fields[key] = toFirestoreValue(val);
    }
  }
  return { fields };
}

/**
 * Writes a document to the local Firestore emulator using REST v1 API.
 * @param {typeof SEED_CONFIG} config
 * @param {string} collection
 * @param {string} docId
 * @param {Record<string, any>} data
 */
export async function writeFirestoreDoc(config, collection, docId, data) {
  const url = `http://${config.firestoreHost}/v1/projects/${config.projectId}/databases/(default)/documents/${collection}/${docId}`;
  const body = JSON.stringify(toFirestoreDocument(data));

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(
      `Failed to write Firestore doc ${collection}/${docId} (HTTP ${res.status}): ${errText}`,
    );
  }
}

/**
 * Creates or updates an Auth user and sets custom token claims in the local Auth emulator.
 * @param {typeof SEED_CONFIG} config
 * @param {typeof USERS_FIXTURE[0]} user
 */
export async function createAuthUser(config, user) {
  // 1. Create User Identity
  const signUpUrl = `http://${config.authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`;
  const signUpRes = await fetch(signUpUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      localId: user.uid,
      email: user.email,
      password: user.password,
      displayName: user.displayName,
      returnSecureToken: true,
    }),
  });

  if (!signUpRes.ok) {
    const errJson = await signUpRes.json().catch(() => ({}));
    const message = errJson?.error?.message || '';
    // If user already exists (EMAIL_EXISTS), update is acceptable
    if (!message.includes('EMAIL_EXISTS')) {
      throw new Error(
        `Auth create failed for ${user.email} (HTTP ${signUpRes.status}): ${message}`,
      );
    }
  }

  // 2. Set Custom Token Claims if specified
  if (user.customClaims && Object.keys(user.customClaims).length > 0) {
    const updateUrl = `http://${config.authHost}/identitytoolkit.googleapis.com/v1/accounts:update?key=fake-api-key`;
    const updateRes = await fetch(updateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        localId: user.uid,
        customAttributes: JSON.stringify(user.customClaims),
      }),
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text().catch(() => '');
      throw new Error(
        `Auth set claims failed for ${user.email} (HTTP ${updateRes.status}): ${errText}`,
      );
    }
  }
}

/**
 * Executes complete deterministic seeding across local Auth and Firestore emulators.
 * @param {typeof SEED_CONFIG} config
 * @returns {Promise<Record<string, number>>}
 */
export async function seedEmulators(config = SEED_CONFIG) {
  // 1. Pre-flight Safety Guard
  const safety = validateSafetyGuard(config);
  if (!safety.safe) {
    throw new Error(
      `SEEDING ABORTED: Fail-closed safety guard rejected execution:\n - ${safety.reasons.join('\n - ')}`,
    );
  }

  // 2. Validate Referential Integrity of Fixtures
  validateReferentialIntegrity();

  // 3. Check Emulator Connectivity
  const [fsHost, fsPortStr] = config.firestoreHost.split(':');
  const [authHost, authPortStr] = config.authHost.split(':');
  const fsPort = parseInt(fsPortStr, 10) || 8080;
  const authPort = parseInt(authPortStr, 10) || 9099;

  const fsReachable = await probePortReachable(fsHost, fsPort);
  if (!fsReachable) {
    throw new Error(
      `Firestore emulator not reachable at ${config.firestoreHost}. Run "npm run emulators:start" first.`,
    );
  }

  const authReachable = await probePortReachable(authHost, authPort);
  if (!authReachable) {
    throw new Error(
      `Auth emulator not reachable at ${config.authHost}. Run "npm run emulators:start" first.`,
    );
  }

  const counts = {
    users: 0,
    organizations: 0,
    brands: 0,
    outlets: 0,
    customers: 0,
    categories: 0,
    menuItems: 0,
    orders: 0,
    ingredients: 0,
    inventoryMovements: 0,
    auditLogs: 0,
  };

  // Step 1: Seed Auth Users
  for (const user of USERS_FIXTURE) {
    await createAuthUser(config, user);
    counts.users += 1;
  }

  // Step 2: Seed Organizations
  for (const org of ORGANIZATIONS_FIXTURE) {
    await writeFirestoreDoc(config, 'organizations', org.id, org);
    counts.organizations += 1;
  }

  // Step 3: Seed Brands
  for (const brand of BRANDS_FIXTURE) {
    await writeFirestoreDoc(config, 'brands', brand.id, brand);
    counts.brands += 1;
  }

  // Step 4: Seed Outlets
  for (const outlet of OUTLETS_FIXTURE) {
    await writeFirestoreDoc(config, 'outlets', outlet.id, outlet);
    counts.outlets += 1;
  }

  // Step 5: Seed Customers
  for (const cust of CUSTOMERS_FIXTURE) {
    await writeFirestoreDoc(config, 'customers', cust.id, cust);
    counts.customers += 1;
  }

  // Step 6: Seed Categories
  for (const cat of CATEGORIES_FIXTURE) {
    await writeFirestoreDoc(config, 'categories', cat.id, cat);
    counts.categories += 1;
  }

  // Step 7: Seed Menu Items
  for (const item of MENU_ITEMS_FIXTURE) {
    await writeFirestoreDoc(config, 'menu_items', item.id, item);
    counts.menuItems += 1;
  }

  // Step 8: Seed Orders
  for (const order of ORDERS_FIXTURE) {
    await writeFirestoreDoc(config, 'orders', order.id, order);
    counts.orders += 1;
  }

  // Step 9: Seed Ingredients
  for (const ing of INGREDIENTS_FIXTURE) {
    await writeFirestoreDoc(config, 'ingredients', ing.id, ing);
    counts.ingredients += 1;
  }

  // Step 10: Seed Inventory Movements
  for (const mov of INVENTORY_MOVEMENTS_FIXTURE) {
    await writeFirestoreDoc(config, 'inventory_movements', mov.id, mov);
    counts.inventoryMovements += 1;
  }

  // Step 11: Seed Audit Logs
  for (const log of AUDIT_LOGS_FIXTURE) {
    await writeFirestoreDoc(config, 'audit_logs', log.id, log);
    counts.auditLogs += 1;
  }

  return counts;
}
