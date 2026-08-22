/**
 * Sita Ram Operating System — Synthetic Inventory & Movement Ledger Fixtures (M0.5)
 *
 * Implements Step 6C DOM-07 immutable inventory movement ledger model.
 * Uses canonical `MovementType.RECEIPT` for opening stock batches.
 */

import { BASELINE_EPOCH } from '../config.mjs';

export const INGREDIENTS_FIXTURE = [
  {
    id: 'raw_milk_cow_l',
    orgId: 'org_gangaram_01',
    name: 'Fresh Pure Cow Milk',
    unit: 'LITRE',
    costPerUnitPaise: 6500, // ₹65.00 / Litre
    reorderThresholdUnits: 50,
    createdAtIso: BASELINE_EPOCH,
  },
  {
    id: 'raw_sugar_kg',
    orgId: 'org_gangaram_01',
    name: 'Refined Sulphur-Free Sugar',
    unit: 'KILOGRAM',
    costPerUnitPaise: 4200, // ₹42.00 / Kg
    reorderThresholdUnits: 100,
    createdAtIso: BASELINE_EPOCH,
  },
  {
    id: 'raw_pistachio_kg',
    orgId: 'org_gangaram_01',
    name: 'Iranian Green Pistachio Kernels',
    unit: 'KILOGRAM',
    costPerUnitPaise: 240000, // ₹2,400.00 / Kg
    reorderThresholdUnits: 10,
    createdAtIso: BASELINE_EPOCH,
  },
];

export const INVENTORY_MOVEMENTS_FIXTURE = [
  {
    id: 'mov_init_milk_01',
    orgId: 'org_gangaram_01',
    outletId: 'outlet_bareilly_civil_lines',
    ingredientId: 'raw_milk_cow_l',
    movementType: 'RECEIPT',
    quantityUnits: 500,
    unitCostPaise: 6500,
    reason: 'INITIAL_OPENING_BATCH',
    recordedByUserId: 'user_mgr_bareilly_01',
    timestampIso: BASELINE_EPOCH,
  },
  {
    id: 'mov_init_sugar_02',
    orgId: 'org_gangaram_01',
    outletId: 'outlet_bareilly_civil_lines',
    ingredientId: 'raw_sugar_kg',
    movementType: 'RECEIPT',
    quantityUnits: 1000,
    unitCostPaise: 4200,
    reason: 'INITIAL_OPENING_BATCH',
    recordedByUserId: 'user_mgr_bareilly_01',
    timestampIso: BASELINE_EPOCH,
  },
  {
    id: 'mov_init_pista_03',
    orgId: 'org_gangaram_01',
    outletId: 'outlet_bareilly_civil_lines',
    ingredientId: 'raw_pistachio_kg',
    movementType: 'RECEIPT',
    quantityUnits: 50,
    unitCostPaise: 240000,
    reason: 'INITIAL_OPENING_BATCH',
    recordedByUserId: 'user_mgr_bareilly_01',
    timestampIso: BASELINE_EPOCH,
  },
];
