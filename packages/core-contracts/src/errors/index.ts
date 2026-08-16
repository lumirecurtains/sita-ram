import { ErrorCategory } from '../enums/errors.js';
import { CorrelationId } from '../identifiers/index.js';

/**
 * Unified Client-Safe Error Contract Shape (DOM-03, DOM-06)
 * Strictly sanitizes internal stack traces, DB details, and secrets.
 */
export interface ClientSafeErrorPayload {
  readonly code: string;
  readonly category: ErrorCategory;
  readonly message: string;
  readonly correlationId?: CorrelationId | string;
  readonly details?: Record<string, unknown>;
  readonly retryable: boolean;
}

export interface ClientSafeError {
  readonly success: false;
  readonly error: ClientSafeErrorPayload;
}

/**
 * Functional Result Pattern for boundary return types
 */
export type Result<T, E = ClientSafeErrorPayload> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E };

export const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export const makeClientSafeError = (
  code: string,
  category: ErrorCategory,
  message: string,
  options?: {
    readonly correlationId?: CorrelationId | string;
    readonly details?: Record<string, unknown>;
    readonly retryable?: boolean;
  },
): ClientSafeError => ({
  success: false,
  error: {
    code,
    category,
    message,
    correlationId: options?.correlationId,
    details: options?.details,
    retryable: options?.retryable ?? false,
  },
});
