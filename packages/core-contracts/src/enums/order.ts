/**
 * Canonical Order Lifecycle State Machine & Channel Contracts (DOM-06)
 * Strictly derived from Step 6B and Step 6G.5.
 */

export enum OrderState {
  PLACED = 'placed',
  ACCEPTED = 'accepted',
  PREPARING = 'preparing',
  PACKED = 'packed',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CUSTOMER_CONFIRMED = 'customer_confirmed',
  REVIEW_COMPLETED = 'review_completed',
  CANCELLED = 'cancelled',
}

export enum CancellationReason {
  CUSTOMER_REQUEST = 'CUSTOMER_REQUEST',
  REJECTED_BY_RESTAURANT = 'REJECTED_BY_RESTAURANT',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  STORE_CLOSING = 'STORE_CLOSING',
  PAYMENT_TIMEOUT = 'PAYMENT_TIMEOUT',
  DELIVERY_UNAVAILABLE = 'DELIVERY_UNAVAILABLE',
}

export enum DeliveryJobStatus {
  UNASSIGNED = 'UNASSIGNED',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export enum OrderType {
  DIRECT_DELIVERY = 'DIRECT_DELIVERY',
  COUNTER_POS = 'COUNTER_POS',
  DINE_IN_QR = 'DINE_IN_QR',
  DINE_IN_CAPTAIN = 'DINE_IN_CAPTAIN',
  TAKEAWAY = 'TAKEAWAY',
}
