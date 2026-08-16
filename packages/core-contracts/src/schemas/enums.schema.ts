import { z } from 'zod';
import { OrderState, CancellationReason, DeliveryJobStatus, OrderType } from '../enums/order.js';
import { UserRole } from '../enums/roles.js';
import { TenantScopeLevel } from '../enums/scopes.js';
import { PaymentCapability, PaymentMode, PaymentStatus } from '../enums/payment.js';
import { DietaryTag } from '../enums/catalog.js';
import { ErrorCategory } from '../enums/errors.js';

export const OrderStateSchema = z.nativeEnum(OrderState);
export const CancellationReasonSchema = z.nativeEnum(CancellationReason);
export const DeliveryJobStatusSchema = z.nativeEnum(DeliveryJobStatus);
export const OrderTypeSchema = z.nativeEnum(OrderType);

export const UserRoleSchema = z.nativeEnum(UserRole);
export const TenantScopeLevelSchema = z.nativeEnum(TenantScopeLevel);

export const PaymentCapabilitySchema = z.nativeEnum(PaymentCapability);
export const PaymentModeSchema = z.nativeEnum(PaymentMode);
export const PaymentStatusSchema = z.nativeEnum(PaymentStatus);

export const DietaryTagSchema = z.nativeEnum(DietaryTag);
export const ErrorCategorySchema = z.nativeEnum(ErrorCategory);
