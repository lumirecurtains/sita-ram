import { z } from 'zod';
import { AddressDTO, CustomerProfileDTO } from '../dtos/customer.dto.js';
import { CustomerIdSchema } from './identifiers.schema.js';

export const AddressSchema: z.ZodType<AddressDTO> = z.object({
  street: z.string().min(1).max(256),
  landmark: z.string().max(128).optional(),
  city: z.string().min(1).max(64),
  postalCode: z.string().min(4).max(12),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  formattedAddress: z.string().min(1).max(512),
});

export const CustomerProfileSchema: z.ZodType<CustomerProfileDTO> = z.object({
  id: CustomerIdSchema,
  phone: z.string().regex(/^\+[1-9]\d{6,14}$/, 'Must be a valid E.164 phone number'),
  name: z.string().max(128).optional(),
  email: z.string().email().optional(),
  defaultAddress: AddressSchema.optional(),
});
