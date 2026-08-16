import { z } from 'zod';
import {
  SelectedModifierDTO,
  OrderItemSnapshotDTO,
  OrderStatusHistoryItemDTO,
  OrderDTO,
} from '../dtos/order.dto.js';
import {
  OrderIdSchema,
  OrganizationIdSchema,
  BrandIdSchema,
  OutletIdSchema,
  CustomerIdSchema,
  MenuItemIdSchema,
  ModifierOptionIdSchema,
  UserIdSchema,
  ClientOperationIdSchema,
  IdempotencyKeySchema,
} from './identifiers.schema.js';
import { OrderStateSchema, OrderTypeSchema, CancellationReasonSchema } from './enums.schema.js';
import { PricingSnapshotSchema } from './pricing.schema.js';
import { AddressSchema } from './customer.schema.js';

export const SelectedModifierSchema: z.ZodType<SelectedModifierDTO> = z.object({
  optionId: ModifierOptionIdSchema,
  name: z.string().min(1).max(128),
  priceDeltaPaise: z.number().int().nonnegative(),
});

export const OrderItemSnapshotSchema: z.ZodType<OrderItemSnapshotDTO> = z.object({
  menuItemId: MenuItemIdSchema,
  name: z.string().min(1).max(256),
  unitPricePaise: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
  selectedModifiers: z.array(SelectedModifierSchema).optional(),
  itemTotalPaise: z.number().int().nonnegative(),
});

export const OrderStatusHistoryItemSchema: z.ZodType<OrderStatusHistoryItemDTO> = z.object({
  state: OrderStateSchema,
  timestampIso: z.string().datetime(),
  actorUserId: UserIdSchema.optional(),
  reason: z.string().max(256).optional(),
});

export const OrderDTOSchema: z.ZodType<OrderDTO> = z.object({
  id: OrderIdSchema,
  orderNumber: z.string().min(1).max(32),
  clientOperationId: ClientOperationIdSchema.optional(),
  idempotencyKey: IdempotencyKeySchema,
  orgId: OrganizationIdSchema,
  brandId: BrandIdSchema,
  outletId: OutletIdSchema,
  customerId: CustomerIdSchema,
  orderType: OrderTypeSchema,
  state: OrderStateSchema,
  items: z.array(OrderItemSnapshotSchema).min(1),
  pricing: PricingSnapshotSchema,
  deliveryAddress: AddressSchema.optional(),
  statusHistory: z.array(OrderStatusHistoryItemSchema).optional(),
  cancellationReason: CancellationReasonSchema.optional(),
  cancellationAuditNote: z.string().max(512).optional(),
  createdAtIso: z.string().datetime(),
  updatedAtIso: z.string().datetime(),
});
