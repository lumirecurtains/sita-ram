import { OrderState, OrderType, CancellationReason } from '../enums/order.js';
import {
  OrderId,
  OrganizationId,
  BrandId,
  OutletId,
  CustomerId,
  MenuItemId,
  ModifierOptionId,
  UserId,
  ClientOperationId,
  IdempotencyKey,
} from '../identifiers/index.js';
import { PricingSnapshotDTO } from './pricing.dto.js';
import { AddressDTO } from './customer.dto.js';

export interface SelectedModifierDTO {
  readonly optionId: ModifierOptionId;
  readonly name: string;
  readonly priceDeltaPaise: number;
}

export interface OrderItemSnapshotDTO {
  readonly menuItemId: MenuItemId;
  readonly name: string;
  readonly unitPricePaise: number;
  readonly quantity: number;
  readonly selectedModifiers?: readonly SelectedModifierDTO[];
  readonly itemTotalPaise: number;
}

export interface OrderStatusHistoryItemDTO {
  readonly state: OrderState;
  readonly timestampIso: string;
  readonly actorUserId?: UserId;
  readonly reason?: string;
}

export interface OrderDTO {
  readonly id: OrderId;
  /** Sequential human-readable order number (e.g. 'GD-1001') */
  readonly orderNumber: string;
  readonly clientOperationId?: ClientOperationId;
  readonly idempotencyKey: IdempotencyKey;
  readonly orgId: OrganizationId;
  readonly brandId: BrandId;
  readonly outletId: OutletId;
  readonly customerId: CustomerId;
  readonly orderType: OrderType;
  readonly state: OrderState;
  readonly items: readonly OrderItemSnapshotDTO[];
  readonly pricing: PricingSnapshotDTO;
  readonly deliveryAddress?: AddressDTO;
  readonly statusHistory?: readonly OrderStatusHistoryItemDTO[];
  readonly cancellationReason?: CancellationReason;
  readonly cancellationAuditNote?: string;
  readonly createdAtIso: string;
  readonly updatedAtIso: string;
}
