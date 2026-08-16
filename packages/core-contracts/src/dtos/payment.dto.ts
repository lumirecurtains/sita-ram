import { PaymentMode, PaymentStatus } from '../enums/payment.js';
import { OrderId, PaymentId, IdempotencyKey, ClientOperationId } from '../identifiers/index.js';

export interface PaymentIntentDTO {
  readonly orderId: OrderId;
  readonly amountMinor: number;
  readonly currency: string;
  readonly paymentMode: PaymentMode;
  readonly paymentStatus: PaymentStatus;
  readonly idempotencyKey: IdempotencyKey;
  readonly clientOperationId?: ClientOperationId;
}

export interface PaymentTransactionSnapshotDTO {
  readonly transactionId: PaymentId;
  readonly orderId: OrderId;
  readonly amountMinor: number;
  readonly currency: string;
  readonly paymentMode: PaymentMode;
  readonly paymentStatus: PaymentStatus;
  readonly providerReferenceId?: string;
  readonly completedAtIso?: string;
}
