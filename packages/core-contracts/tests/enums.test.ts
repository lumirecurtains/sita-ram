import { describe, it, expect } from 'vitest';
import {
  OrderState,
  CancellationReason,
  DeliveryJobStatus,
  OrderType,
  UserRole,
  TenantScopeLevel,
  PaymentCapability,
  PaymentMode,
  PaymentStatus,
  DietaryTag,
  ErrorCategory,
} from '../src/index.js';

describe('Canonical Enums Audit', () => {
  it('should have exactly 9 canonical OrderState values', () => {
    const states = Object.values(OrderState);
    expect(states).toHaveLength(9);
    expect(states).toEqual([
      'placed',
      'accepted',
      'preparing',
      'packed',
      'out_for_delivery',
      'delivered',
      'customer_confirmed',
      'review_completed',
      'cancelled',
    ]);
  });

  it('must NOT contain non-canonical order states', () => {
    const states = Object.values(OrderState) as string[];
    expect(states).not.toContain('rejected');
    expect(states).not.toContain('failed_delivery');
    expect(states).not.toContain('disputed');
    expect(states).not.toContain('confirmed');
    expect(states).not.toContain('ready');
  });

  it('should have discrete CancellationReason companion enum', () => {
    const reasons = Object.values(CancellationReason);
    expect(reasons).toContain('CUSTOMER_REQUEST');
    expect(reasons).toContain('REJECTED_BY_RESTAURANT');
    expect(reasons).toContain('OUT_OF_STOCK');
    expect(reasons).toContain('STORE_CLOSING');
    expect(reasons).toContain('PAYMENT_TIMEOUT');
    expect(reasons).toContain('DELIVERY_UNAVAILABLE');
  });

  it('should have discrete DeliveryJobStatus companion enum', () => {
    const statuses = Object.values(DeliveryJobStatus);
    expect(statuses).toEqual(['UNASSIGNED', 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'FAILED']);
  });

  it('should have exactly 10 canonical UserRole values', () => {
    const roles = Object.values(UserRole);
    expect(roles).toHaveLength(10);
    expect(roles).toEqual([
      'PlatformAdmin',
      'OrgOwner',
      'BrandAdmin',
      'OutletManager',
      'Cashier',
      'Captain',
      'KitchenStaff',
      'Rider',
      'Accountant',
      'Customer',
    ]);
  });

  it('should have 4 canonical TenantScopeLevel values', () => {
    const scopes = Object.values(TenantScopeLevel);
    expect(scopes).toEqual(['PLATFORM', 'ORGANIZATION', 'BRAND', 'OUTLET']);
  });

  it('should have 6 canonical PaymentCapability values', () => {
    const capabilities = Object.values(PaymentCapability);
    expect(capabilities).toEqual([
      'COLLECTION',
      'VERIFICATION',
      'REFUND',
      'ROUTE_SPLIT',
      'SETTLEMENT',
      'RECONCILIATION',
    ]);
  });

  it('should have canonical PaymentMode and PaymentStatus', () => {
    expect(Object.values(PaymentMode)).toEqual([
      'ONLINE_GATEWAY',
      'CASH_ON_DELIVERY',
      'CASH_POS',
      'STATIC_QR',
      'EDC_POS_TERMINAL',
    ]);
    expect(Object.values(PaymentStatus)).toEqual([
      'PENDING',
      'AUTHORIZED',
      'CAPTURED',
      'FAILED',
      'REFUNDED',
      'PENDING_VERIFICATION',
    ]);
  });

  it('should have canonical ErrorCategory values', () => {
    expect(Object.values(ErrorCategory)).toEqual([
      'VALIDATION_ERROR',
      'AUTHENTICATION_ERROR',
      'AUTHORIZATION_ERROR',
      'DOMAIN_INVARIANT_ERROR',
      'CONFLICT_ERROR',
      'NOT_FOUND_ERROR',
      'INTEGRATION_ERROR',
      'RATE_LIMIT_ERROR',
      'SYSTEM_ERROR',
    ]);
  });

  it('should have canonical OrderType values', () => {
    expect(Object.values(OrderType)).toEqual([
      'DIRECT_DELIVERY',
      'COUNTER_POS',
      'DINE_IN_QR',
      'DINE_IN_CAPTAIN',
      'TAKEAWAY',
    ]);
  });

  it('should have canonical DietaryTag values', () => {
    expect(Object.values(DietaryTag)).toEqual(['VEG', 'NON_VEG', 'EGG']);
  });
});
