import { z } from 'zod';
import { PaymentIntentDTO, PaymentTransactionSnapshotDTO } from '../dtos/payment.dto.js';
import {
  OrderIdSchema,
  PaymentIdSchema,
  IdempotencyKeySchema,
  ClientOperationIdSchema,
} from './identifiers.schema.js';
import { PaymentModeSchema, PaymentStatusSchema } from './enums.schema.js';

export const PaymentIntentSchema: z.ZodType<PaymentIntentDTO> = z.object({
  orderId: OrderIdSchema,
  amountMinor: z.number().int().nonnegative(),
  currency: z.string().min(3).max(3),
  paymentMode: PaymentModeSchema,
  paymentStatus: PaymentStatusSchema,
  idempotencyKey: IdempotencyKeySchema,
  clientOperationId: ClientOperationIdSchema.optional(),
});

export const PaymentTransactionSnapshotSchema: z.ZodType<PaymentTransactionSnapshotDTO> = z.object({
  transactionId: PaymentIdSchema,
  orderId: OrderIdSchema,
  amountMinor: z.number().int().nonnegative(),
  currency: z.string().min(3).max(3),
  paymentMode: PaymentModeSchema,
  paymentStatus: PaymentStatusSchema,
  providerReferenceId: z.string().max(128).optional(),
  completedAtIso: z.string().datetime().optional(),
});
