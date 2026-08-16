/**
 * Pricing and Tax Breakdown Data Transfer Objects (DOM-05)
 */

export interface TaxBreakdownDTO {
  readonly cgstPaise: number;
  readonly sgstPaise: number;
  readonly igstPaise: number;
  readonly totalTaxPaise: number;
  /** Contextual tax rate in basis points (e.g. 500 = 5.00%) */
  readonly appliedRateBps: number;
}

export interface PricingSnapshotDTO {
  readonly itemTotalPaise: number;
  readonly deliveryFeePaise: number;
  readonly packagingFeePaise: number;
  readonly discountPaise: number;
  readonly taxBreakdown: TaxBreakdownDTO;
  readonly grandTotalPaise: number;
  readonly currency: string;
}
