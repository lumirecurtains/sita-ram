import { z } from 'zod';
import {
  ClientOperationId,
  IdempotencyKey,
  CorrelationId,
  OrganizationId,
  BrandId,
  OutletId,
  UserId,
  CustomerId,
  OrderId,
  MenuItemId,
  CategoryId,
  ModifierGroupId,
  ModifierOptionId,
  PaymentId,
  DeliveryJobId,
} from '../identifiers/index.js';

export const ClientOperationIdSchema = z
  .string()
  .min(1)
  .max(128) as unknown as z.ZodType<ClientOperationId>;
export const IdempotencyKeySchema = z
  .string()
  .min(1)
  .max(128) as unknown as z.ZodType<IdempotencyKey>;
export const CorrelationIdSchema = z
  .string()
  .min(1)
  .max(128) as unknown as z.ZodType<CorrelationId>;

export const OrganizationIdSchema = z
  .string()
  .min(1)
  .max(128) as unknown as z.ZodType<OrganizationId>;
export const BrandIdSchema = z.string().min(1).max(128) as unknown as z.ZodType<BrandId>;
export const OutletIdSchema = z.string().min(1).max(128) as unknown as z.ZodType<OutletId>;
export const UserIdSchema = z.string().min(1).max(128) as unknown as z.ZodType<UserId>;
export const CustomerIdSchema = z.string().min(1).max(128) as unknown as z.ZodType<CustomerId>;
export const OrderIdSchema = z.string().min(1).max(128) as unknown as z.ZodType<OrderId>;
export const MenuItemIdSchema = z.string().min(1).max(128) as unknown as z.ZodType<MenuItemId>;
export const CategoryIdSchema = z.string().min(1).max(128) as unknown as z.ZodType<CategoryId>;
export const ModifierGroupIdSchema = z
  .string()
  .min(1)
  .max(128) as unknown as z.ZodType<ModifierGroupId>;
export const ModifierOptionIdSchema = z
  .string()
  .min(1)
  .max(128) as unknown as z.ZodType<ModifierOptionId>;
export const PaymentIdSchema = z.string().min(1).max(128) as unknown as z.ZodType<PaymentId>;
export const DeliveryJobIdSchema = z
  .string()
  .min(1)
  .max(128) as unknown as z.ZodType<DeliveryJobId>;
