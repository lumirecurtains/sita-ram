/**
 * Sita Ram Operating System — Synthetic Audit Log Fixtures (M0.5)
 *
 * Implements Step 6E Zero-Trust immutable audit trail records.
 */

import { BASELINE_EPOCH } from '../config.mjs';

export const AUDIT_LOGS_FIXTURE = [
  {
    id: 'aud_seed_init_01',
    orgId: 'org_gangaram_01',
    action: 'ORGANIZATION_INITIALIZED',
    actorUserId: 'user_plat_admin_01',
    targetResourceId: 'org_gangaram_01',
    targetResourceType: 'ORGANIZATION',
    metadata: {
      seedVersion: 'seed-v1.0.0',
      reason: 'Local development environment seeding initialization.',
    },
    timestampIso: BASELINE_EPOCH,
  },
  {
    id: 'aud_menu_publish_02',
    orgId: 'org_gangaram_01',
    action: 'CATALOG_PUBLISHED',
    actorUserId: 'user_brand_admin_01',
    targetResourceId: 'brand_gangaram_sweets',
    targetResourceType: 'BRAND',
    metadata: {
      itemCount: 6,
      categoryCount: 3,
    },
    timestampIso: BASELINE_EPOCH,
  },
  {
    id: 'aud_order_cancel_03',
    orgId: 'org_gangaram_01',
    action: 'ORDER_CANCELLED',
    actorUserId: 'user_cashier_01',
    targetResourceId: 'ord_hist_cancelled_04',
    targetResourceType: 'ORDER',
    metadata: {
      cancellationReason: 'OUT_OF_STOCK',
      note: 'Customer notified: cow milk batch delay.',
    },
    timestampIso: '2026-08-19T19:05:00.000Z',
  },
  {
    id: 'aud_inv_receipt_04',
    orgId: 'org_gangaram_01',
    action: 'INVENTORY_RECEIPT_RECORDED',
    actorUserId: 'user_mgr_bareilly_01',
    targetResourceId: 'mov_init_milk_01',
    targetResourceType: 'INVENTORY_MOVEMENT',
    metadata: {
      ingredientId: 'raw_milk_cow_l',
      quantityUnits: 500,
    },
    timestampIso: BASELINE_EPOCH,
  },
];
