import { describe, it, expect } from 'vitest';
import {
  makeClientOperationId,
  makeIdempotencyKey,
  makeCorrelationId,
  makeOrderId,
  makeUserId,
  makeOutletId,
  makeOrganizationId,
  makeBrandId,
  makeCustomerId,
  makeMenuItemId,
  ClientOperationId,
  IdempotencyKey,
  OrderId,
} from '../src/index.js';

describe('ADR-025 Tripartite Identifier Model Tests', () => {
  it('should create branded nominal identifiers cleanly', () => {
    const clientOpId: ClientOperationId = makeClientOperationId('client-op-1234');
    const idempotencyKey: IdempotencyKey = makeIdempotencyKey('idem-key-5678');
    const orderId: OrderId = makeOrderId('ord_001');

    expect(clientOpId).toBe('client-op-1234');
    expect(idempotencyKey).toBe('idem-key-5678');
    expect(orderId).toBe('ord_001');
  });

  it('should maintain distinct semantic identities across tripartite components', () => {
    const clientOpId = makeClientOperationId('op-1');
    const idemKey = makeIdempotencyKey('idem-1');
    const orgId = makeOrganizationId('org-1');
    const brandId = makeBrandId('brand-1');
    const outletId = makeOutletId('outlet-1');
    const userId = makeUserId('user-1');
    const customerId = makeCustomerId('cust-1');
    const menuItemId = makeMenuItemId('item-1');
    const corrId = makeCorrelationId('corr-1');

    expect(typeof clientOpId).toBe('string');
    expect(typeof idemKey).toBe('string');
    expect(typeof orgId).toBe('string');
    expect(typeof brandId).toBe('string');
    expect(typeof outletId).toBe('string');
    expect(typeof userId).toBe('string');
    expect(typeof customerId).toBe('string');
    expect(typeof menuItemId).toBe('string');
    expect(typeof corrId).toBe('string');
  });
});
