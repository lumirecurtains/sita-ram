/**
 * Sita Ram Operating System — Synthetic Order & Transaction Fixtures (M0.5)
 *
 * Implements `OrderDTO` and `PricingSnapshotDTO` from `@sitaram/core-contracts`.
 * Covers representative canonical 9-state `OrderState` values.
 */

import { BASELINE_EPOCH } from '../config.mjs';

export const ORDERS_FIXTURE = [
  // 1. Live Placed Order (Awaiting Kitchen Acceptance)
  {
    id: 'ord_live_placed_01',
    orderNumber: 'GD-1001',
    orgId: 'org_gangaram_01',
    brandId: 'brand_gangaram_sweets',
    outletId: 'outlet_bareilly_civil_lines',
    customerId: 'cust_ananya_01',
    orderType: 'DIRECT_DELIVERY',
    state: 'placed',
    idempotencyKey: 'idem_ord_live_01',
    items: [
      {
        menuItemId: 'item_gulab_jamun_01',
        name: 'Desi Ghee Gulab Jamun (Box of 4)',
        unitPricePaise: 16000,
        quantity: 2,
        selectedModifiers: [
          {
            optionId: 'opt_gift_tin',
            name: 'Royal Gift Tin Packaging',
            priceDeltaPaise: 3000,
          },
        ],
        itemTotalPaise: 38000, // (16000 + 3000) * 2 = 38000
      },
    ],
    pricing: {
      itemTotalPaise: 38000,
      deliveryFeePaise: 3000,
      packagingFeePaise: 1000,
      discountPaise: 0,
      taxBreakdown: {
        cgstPaise: 950,
        sgstPaise: 950,
        igstPaise: 0,
        totalTaxPaise: 1900,
        appliedRateBps: 500, // 5.00%
      },
      grandTotalPaise: 43900, // 38000 + 3000 + 1000 + 1900 = 43900
      currency: 'INR',
    },
    deliveryAddress: {
      street: 'Flat 402, Royal Palms Residency',
      city: 'Bareilly',
      postalCode: '243001',
      latitude: 28.3685,
      longitude: 79.432,
      formattedAddress: 'Flat 402, Royal Palms Residency, Bareilly, UP 243001',
    },
    statusHistory: [
      {
        state: 'placed',
        timestampIso: BASELINE_EPOCH,
      },
    ],
    createdAtIso: BASELINE_EPOCH,
    updatedAtIso: BASELINE_EPOCH,
  },

  // 2. Live Preparing Order (Active on KDS)
  {
    id: 'ord_live_prep_02',
    orderNumber: 'GD-1002',
    orgId: 'org_gangaram_01',
    brandId: 'brand_gangaram_sweets',
    outletId: 'outlet_bareilly_civil_lines',
    customerId: 'cust_rahul_02',
    orderType: 'DINE_IN_QR',
    state: 'preparing',
    idempotencyKey: 'idem_ord_prep_02',
    items: [
      {
        menuItemId: 'item_kaju_katli_02',
        name: 'Silver Leaf Kaju Katli (500g)',
        unitPricePaise: 48000,
        quantity: 1,
        itemTotalPaise: 48000,
      },
    ],
    pricing: {
      itemTotalPaise: 48000,
      deliveryFeePaise: 0,
      packagingFeePaise: 0,
      discountPaise: 4000,
      taxBreakdown: {
        cgstPaise: 1100,
        sgstPaise: 1100,
        igstPaise: 0,
        totalTaxPaise: 2200,
        appliedRateBps: 500,
      },
      grandTotalPaise: 46200, // 48000 - 4000 + 2200 = 46200
      currency: 'INR',
    },
    statusHistory: [
      {
        state: 'placed',
        timestampIso: '2026-08-20T09:45:00.000Z',
      },
      {
        state: 'accepted',
        timestampIso: '2026-08-20T09:47:00.000Z',
        actorUserId: 'user_mgr_bareilly_01',
      },
      {
        state: 'preparing',
        timestampIso: '2026-08-20T09:50:00.000Z',
        actorUserId: 'user_kitchen_01',
      },
    ],
    createdAtIso: '2026-08-20T09:45:00.000Z',
    updatedAtIso: '2026-08-20T09:50:00.000Z',
  },

  // 3. Completed Historical Order
  {
    id: 'ord_hist_delivered_03',
    orderNumber: 'GD-0998',
    orgId: 'org_gangaram_01',
    brandId: 'brand_gangaram_sweets',
    outletId: 'outlet_bareilly_civil_lines',
    customerId: 'cust_ananya_01',
    orderType: 'DIRECT_DELIVERY',
    state: 'delivered',
    idempotencyKey: 'idem_ord_deliv_03',
    items: [
      {
        menuItemId: 'item_malai_paneer_04',
        name: 'Fresh Malai Paneer (500g)',
        unitPricePaise: 24000,
        quantity: 2,
        itemTotalPaise: 48000,
      },
    ],
    pricing: {
      itemTotalPaise: 48000,
      deliveryFeePaise: 3000,
      packagingFeePaise: 1000,
      discountPaise: 0,
      taxBreakdown: {
        cgstPaise: 1200,
        sgstPaise: 1200,
        igstPaise: 0,
        totalTaxPaise: 2400,
        appliedRateBps: 500,
      },
      grandTotalPaise: 54400,
      currency: 'INR',
    },
    deliveryAddress: {
      street: 'Flat 402, Royal Palms Residency',
      city: 'Bareilly',
      postalCode: '243001',
      latitude: 28.3685,
      longitude: 79.432,
      formattedAddress: 'Flat 402, Royal Palms Residency, Bareilly, UP 243001',
    },
    statusHistory: [
      { state: 'placed', timestampIso: '2026-08-19T18:00:00.000Z' },
      { state: 'accepted', timestampIso: '2026-08-19T18:02:00.000Z' },
      { state: 'preparing', timestampIso: '2026-08-19T18:05:00.000Z' },
      { state: 'packed', timestampIso: '2026-08-19T18:20:00.000Z' },
      { state: 'out_for_delivery', timestampIso: '2026-08-19T18:25:00.000Z' },
      { state: 'delivered', timestampIso: '2026-08-19T18:45:00.000Z' },
    ],
    createdAtIso: '2026-08-19T18:00:00.000Z',
    updatedAtIso: '2026-08-19T18:45:00.000Z',
  },

  // 4. Cancelled Order (Out of Stock Exception)
  {
    id: 'ord_hist_cancelled_04',
    orderNumber: 'GD-0999',
    orgId: 'org_gangaram_01',
    brandId: 'brand_gangaram_sweets',
    outletId: 'outlet_bareilly_civil_lines',
    customerId: 'cust_rahul_02',
    orderType: 'TAKEAWAY',
    state: 'cancelled',
    cancellationReason: 'OUT_OF_STOCK',
    cancellationAuditNote: 'Customer notified: cow milk batch delay.',
    idempotencyKey: 'idem_ord_canc_04',
    items: [
      {
        menuItemId: 'item_fresh_dahi_05',
        name: 'Set Sweetened Dahi (Misti Doi 400g)',
        unitPricePaise: 9000,
        quantity: 5,
        itemTotalPaise: 45000,
      },
    ],
    pricing: {
      itemTotalPaise: 45000,
      deliveryFeePaise: 0,
      packagingFeePaise: 1000,
      discountPaise: 0,
      taxBreakdown: {
        cgstPaise: 1125,
        sgstPaise: 1125,
        igstPaise: 0,
        totalTaxPaise: 2250,
        appliedRateBps: 500,
      },
      grandTotalPaise: 48250,
      currency: 'INR',
    },
    statusHistory: [
      { state: 'placed', timestampIso: '2026-08-19T19:00:00.000Z' },
      {
        state: 'cancelled',
        timestampIso: '2026-08-19T19:05:00.000Z',
        actorUserId: 'user_cashier_01',
        reason: 'OUT_OF_STOCK',
      },
    ],
    createdAtIso: '2026-08-19T19:00:00.000Z',
    updatedAtIso: '2026-08-19T19:05:00.000Z',
  },
];
