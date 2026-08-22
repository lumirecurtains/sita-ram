/**
 * @sitaram/domain-core v0.1.0
 * Pure Domain Core Rules, FSMs & Financial Arithmetic for Sita Ram Restaurant OS
 *
 * Invariants:
 * - 100% Pure TypeScript logic (zero Firestore, HTTP, UI, or server-side secret dependencies)
 * - Strict financial authority in integer paise minor units (DOM-05)
 * - Canonical Forward-Only Order State Machine transitions (DOM-06)
 * - Single authoritative domain ownership (Step 6B)
 */

import { OrderState } from '@sitaram/core-contracts';

/**
 * Package metadata constant.
 */
export const DOMAIN_CORE_VERSION = '0.1.0';

/**
 * Base Domain Entity Interface
 */
export interface DomainEntity<TId = string> {
  readonly id: TId;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Tenant Scoped Domain Entity Interface
 */
export interface TenantScopedEntity<TId = string> extends DomainEntity<TId> {
  readonly orgId: string;
  readonly brandId?: string;
  readonly outletId?: string;
}

/**
 * Validates whether an order state transition is canonically valid (Step 6B DOM-06).
 *
 * Canonical forward flow:
 * placed -> accepted -> preparing -> packed -> out_for_delivery -> delivered -> customer_confirmed -> review_completed
 * Cancellation:
 * placed -> cancelled
 * preparing -> cancelled
 */
export function isValidOrderStateTransition(
  currentState: OrderState,
  nextState: OrderState,
): boolean {
  const allowedTransitions: Record<OrderState, readonly OrderState[]> = {
    [OrderState.PLACED]: [OrderState.ACCEPTED, OrderState.CANCELLED],
    [OrderState.ACCEPTED]: [OrderState.PREPARING],
    [OrderState.PREPARING]: [OrderState.PACKED, OrderState.CANCELLED],
    [OrderState.PACKED]: [OrderState.OUT_FOR_DELIVERY],
    [OrderState.OUT_FOR_DELIVERY]: [OrderState.DELIVERED],
    [OrderState.DELIVERED]: [OrderState.CUSTOMER_CONFIRMED],
    [OrderState.CUSTOMER_CONFIRMED]: [OrderState.REVIEW_COMPLETED],
    [OrderState.REVIEW_COMPLETED]: [],
    [OrderState.CANCELLED]: [],
  };

  return allowedTransitions[currentState]?.includes(nextState) ?? false;
}
