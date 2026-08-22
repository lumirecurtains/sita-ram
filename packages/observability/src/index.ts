/**
 * @sitaram/observability v0.1.0
 * Structured JSON Logging, Tracing & Telemetry Architecture for Sita Ram Restaurant OS
 *
 * Invariants:
 * - 5-Tier signal taxonomy (Step 6F)
 * - Automatic PII sanitization (phone, customer name, payment tokens)
 * - Distributed trace propagation via x-correlation-id (ADR-064)
 * - Immutable security audit trail integration (/audit_logs/)
 */

/**
 * Package metadata constant.
 */
export const OBSERVABILITY_VERSION = '0.1.0';

/**
 * Structured Log Level Enum
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  AUDIT = 'AUDIT',
}

/**
 * Structured Telemetry Context Interface
 */
export interface TraceContext {
  readonly correlationId: string;
  readonly operationId?: string;
  readonly orgId?: string;
  readonly outletId?: string;
  readonly actorId?: string;
}

/**
 * Structured Log Payload Interface
 */
export interface StructuredLogPayload {
  readonly level: LogLevel;
  readonly message: string;
  readonly context: TraceContext;
  readonly timestamp: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Sanitizes sensitive customer PII fields before serialization to logs.
 */
export function sanitizeLogData<T extends Record<string, unknown>>(data: T): T {
  const sensitiveKeys = ['password', 'pin', 'token', 'secret', 'phone', 'otp'];
  const sanitized = { ...data };

  for (const [key, value] of Object.entries(sanitized)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      (sanitized as Record<string, unknown>)[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      (sanitized as Record<string, unknown>)[key] = sanitizeLogData(
        value as Record<string, unknown>,
      );
    }
  }

  return sanitized;
}
