import { describe, it, expect } from 'vitest';
import {
  OrderDTOSchema,
  OrderState,
  OrderType,
  CustomerProfileSchema,
  PricingSnapshotSchema,
  PaymentIntentSchema,
  PaymentMode,
  PaymentStatus,
  makeOrderId,
  makeOrganizationId,
  makeBrandId,
  makeOutletId,
  makeCustomerId,
  makeMenuItemId,
  makeIdempotencyKey,
  makeClientOperationId,
} from '../src/index.js';

describe('Zod Validation Schemas Tests', () => {
  it('should successfully parse a valid OrderDTO payload', () => {
    const validOrderPayload = {
      id: makeOrderId('ord_001'),
      orderNumber: 'GD-1001',
      clientOperationId: makeClientOperationId('client-op-1'),
      idempotencyKey: makeIdempotencyKey('idem-key-1'),
      orgId: makeOrganizationId('org-1'),
      brandId: makeBrandId('brand-1'),
      outletId: makeOutletId('outlet-1'),
      customerId: makeCustomerId('cust-1'),
      orderType: OrderType.DIRECT_DELIVERY,
      state: OrderState.PLACED,
      items: [
        {
          menuItemId: makeMenuItemId('item-1'),
          name: 'Gulab Jamun (2 pcs)',
          unitPricePaise: 12000,
          quantity: 2,
          itemTotalPaise: 24000,
        },
      ],
      pricing: {
        itemTotalPaise: 24000,
        deliveryFeePaise: 3000,
        packagingFeePaise: 1000,
        discountPaise: 0,
        taxBreakdown: {
          cgstPaise: 600,
          sgstPaise: 600,
          igstPaise: 0,
          totalTaxPaise: 1200,
          appliedRateBps: 500,
        },
        grandTotalPaise: 29200,
        currency: 'INR',
      },
      deliveryAddress: {
        street: '123 Station Road',
        city: 'Varanasi',
        postalCode: '221001',
        latitude: 25.3176,
        longitude: 82.9739,
        formattedAddress: '123 Station Road, Varanasi, UP 221001',
      },
      createdAtIso: '2026-08-15T12:00:00.000Z',
      updatedAtIso: '2026-08-15T12:00:00.000Z',
    };

    const parsed = OrderDTOSchema.safeParse(validOrderPayload);
    expect(parsed.success).toBe(true);
  });

  it('should reject OrderDTO with invalid / non-canonical state', () => {
    const invalidOrderPayload = {
      id: 'ord_001',
      orderNumber: 'GD-1001',
      idempotencyKey: 'idem-1',
      orgId: 'org-1',
      brandId: 'brand-1',
      outletId: 'outlet-1',
      customerId: 'cust-1',
      orderType: OrderType.DIRECT_DELIVERY,
      state: 'rejected', // Non-canonical state
      items: [],
      pricing: {
        itemTotalPaise: 0,
        deliveryFeePaise: 0,
        packagingFeePaise: 0,
        discountPaise: 0,
        taxBreakdown: {
          cgstPaise: 0,
          sgstPaise: 0,
          igstPaise: 0,
          totalTaxPaise: 0,
          appliedRateBps: 0,
        },
        grandTotalPaise: 0,
        currency: 'INR',
      },
      createdAtIso: '2026-08-15T12:00:00.000Z',
      updatedAtIso: '2026-08-15T12:00:00.000Z',
    };

    const parsed = OrderDTOSchema.safeParse(invalidOrderPayload);
    expect(parsed.success).toBe(false);
  });

  it('should validate CustomerProfileSchema and require valid E.164 phone', () => {
    const validProfile = {
      id: makeCustomerId('cust-1'),
      phone: '+919876543210',
      name: 'Rohan Sharma',
    };
    expect(CustomerProfileSchema.safeParse(validProfile).success).toBe(true);

    const invalidPhoneProfile = {
      id: makeCustomerId('cust-1'),
      phone: '9876543210', // Missing + country code
    };
    expect(CustomerProfileSchema.safeParse(invalidPhoneProfile).success).toBe(false);
  });

  it('should validate PaymentIntentSchema with proper minor units', () => {
    const validIntent = {
      orderId: makeOrderId('ord_001'),
      amountMinor: 29200,
      currency: 'INR',
      paymentMode: PaymentMode.ONLINE_GATEWAY,
      paymentStatus: PaymentStatus.PENDING,
      idempotencyKey: makeIdempotencyKey('idem-key-1'),
    };
    expect(PaymentIntentSchema.safeParse(validIntent).success).toBe(true);

    const negativeAmount = {
      ...validIntent,
      amountMinor: -100,
    };
    expect(PaymentIntentSchema.safeParse(negativeAmount).success).toBe(false);
  });

  it('should validate PricingSnapshotSchema directly', () => {
    const validPricing = {
      itemTotalPaise: 24000,
      deliveryFeePaise: 3000,
      packagingFeePaise: 1000,
      discountPaise: 0,
      taxBreakdown: {
        cgstPaise: 600,
        sgstPaise: 600,
        igstPaise: 0,
        totalTaxPaise: 1200,
        appliedRateBps: 500,
      },
      grandTotalPaise: 29200,
      currency: 'INR',
    };
    expect(PricingSnapshotSchema.safeParse(validPricing).success).toBe(true);
  });
});
