/**
 * Strongly-typed nominal branded identifier types for Sita Ram Restaurant OS.
 * Prevents accidental cross-assignment of primitive string IDs at compile-time.
 * Strictly adheres to the ADR-025 Tripartite Identifier Model:
 * ClientOperationId !== IdempotencyKey !== ServerRecordId
 */

export type Brand<K, T extends string> = K & { readonly __brand: T };

// Client / Operation IDs (ADR-025)
export type ClientOperationId = Brand<string, 'ClientOperationId'>;
export type IdempotencyKey = Brand<string, 'IdempotencyKey'>;
export type CorrelationId = Brand<string, 'CorrelationId'>;

// Multi-Tenant Server Entity Identifiers
export type OrganizationId = Brand<string, 'OrganizationId'>;
export type BrandId = Brand<string, 'BrandId'>;
export type OutletId = Brand<string, 'OutletId'>;

// Actor & Customer Identifiers
export type UserId = Brand<string, 'UserId'>;
export type CustomerId = Brand<string, 'CustomerId'>;

// Commerce & Operations Identifiers
export type OrderId = Brand<string, 'OrderId'>;
export type MenuItemId = Brand<string, 'MenuItemId'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type ModifierGroupId = Brand<string, 'ModifierGroupId'>;
export type ModifierOptionId = Brand<string, 'ModifierOptionId'>;
export type PaymentId = Brand<string, 'PaymentId'>;
export type DeliveryJobId = Brand<string, 'DeliveryJobId'>;

// Nominal ID helper constructor functions
export const makeClientOperationId = (id: string): ClientOperationId => id as ClientOperationId;
export const makeIdempotencyKey = (key: string): IdempotencyKey => key as IdempotencyKey;
export const makeCorrelationId = (id: string): CorrelationId => id as CorrelationId;
export const makeOrganizationId = (id: string): OrganizationId => id as OrganizationId;
export const makeBrandId = (id: string): BrandId => id as BrandId;
export const makeOutletId = (id: string): OutletId => id as OutletId;
export const makeUserId = (id: string): UserId => id as UserId;
export const makeCustomerId = (id: string): CustomerId => id as CustomerId;
export const makeOrderId = (id: string): OrderId => id as OrderId;
export const makeMenuItemId = (id: string): MenuItemId => id as MenuItemId;
export const makeCategoryId = (id: string): CategoryId => id as CategoryId;
export const makeModifierGroupId = (id: string): ModifierGroupId => id as ModifierGroupId;
export const makeModifierOptionId = (id: string): ModifierOptionId => id as ModifierOptionId;
export const makePaymentId = (id: string): PaymentId => id as PaymentId;
export const makeDeliveryJobId = (id: string): DeliveryJobId => id as DeliveryJobId;
