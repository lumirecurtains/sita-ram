import { CustomerId } from '../identifiers/index.js';

export interface AddressDTO {
  readonly street: string;
  readonly landmark?: string;
  readonly city: string;
  readonly postalCode: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly formattedAddress: string;
}

export interface CustomerProfileDTO {
  readonly id: CustomerId;
  /** Verified E.164 phone number (e.g. '+919876543210') */
  readonly phone: string;
  readonly name?: string;
  readonly email?: string;
  readonly defaultAddress?: AddressDTO;
}
