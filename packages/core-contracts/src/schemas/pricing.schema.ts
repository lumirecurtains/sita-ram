import { z } from 'zod';
import { TaxBreakdownDTO, PricingSnapshotDTO } from '../dtos/pricing.dto.js';
import { Money } from '../money/index.js';

export const MoneySchema: z.ZodType<Money> = z.object({
  amountMinor: z.number().int().nonnegative(),
  currency: z.string().min(3).max(3),
});

export const TaxBreakdownSchema: z.ZodType<TaxBreakdownDTO> = z.object({
  cgstPaise: z.number().int().nonnegative(),
  sgstPaise: z.number().int().nonnegative(),
  igstPaise: z.number().int().nonnegative(),
  totalTaxPaise: z.number().int().nonnegative(),
  appliedRateBps: z.number().int().nonnegative(),
});

export const PricingSnapshotSchema: z.ZodType<PricingSnapshotDTO> = z.object({
  itemTotalPaise: z.number().int().nonnegative(),
  deliveryFeePaise: z.number().int().nonnegative(),
  packagingFeePaise: z.number().int().nonnegative(),
  discountPaise: z.number().int().nonnegative(),
  taxBreakdown: TaxBreakdownSchema,
  grandTotalPaise: z.number().int().nonnegative(),
  currency: z.string().min(3).max(3),
});
