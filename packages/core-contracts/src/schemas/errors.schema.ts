import { z } from 'zod';
import { ClientSafeErrorPayload, ClientSafeError } from '../errors/index.js';
import { ErrorCategorySchema } from './enums.schema.js';
import { CorrelationIdSchema } from './identifiers.schema.js';

export const ClientSafeErrorPayloadSchema: z.ZodType<ClientSafeErrorPayload> = z.object({
  code: z.string().min(1).max(64),
  category: ErrorCategorySchema,
  message: z.string().min(1).max(512),
  correlationId: CorrelationIdSchema.or(z.string()).optional(),
  details: z.record(z.unknown()).optional(),
  retryable: z.boolean(),
});

export const ClientSafeErrorSchema: z.ZodType<ClientSafeError> = z.object({
  success: z.literal(false),
  error: ClientSafeErrorPayloadSchema,
});
