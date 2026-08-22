/**
 * Sita Ram Operating System — Synthetic Multi-Tenant Topology Fixtures (M0.5)
 *
 * Defines isolated synthetic fixtures for Tenant A and Tenant B to enable
 * local development and Step 6E Zero-Trust security rules testing.
 * Zero operational or data relationship to archived legacy projects.
 */

import { BASELINE_EPOCH } from '../config.mjs';

export const ORGANIZATIONS_FIXTURE = [
  {
    id: 'org_gangaram_01',
    name: 'Gangaram Dairy & Sweets (Synthetic Franchise A)',
    slug: 'gangaram-sweets-dev',
    status: 'ACTIVE',
    createdAtIso: BASELINE_EPOCH,
    updatedAtIso: BASELINE_EPOCH,
  },
  {
    id: 'org_mithai_co_02',
    name: 'Mithai Co Group (Synthetic Franchise B)',
    slug: 'mithai-co-dev',
    status: 'ACTIVE',
    createdAtIso: BASELINE_EPOCH,
    updatedAtIso: BASELINE_EPOCH,
  },
];

export const BRANDS_FIXTURE = [
  {
    id: 'brand_gangaram_sweets',
    orgId: 'org_gangaram_01',
    name: 'Gangaram Sweets',
    code: 'GDS',
    status: 'ACTIVE',
    createdAtIso: BASELINE_EPOCH,
  },
  {
    id: 'brand_gangaram_bakery',
    orgId: 'org_gangaram_01',
    name: 'Gangaram Bakery & Cafe',
    code: 'GDB',
    status: 'ACTIVE',
    createdAtIso: BASELINE_EPOCH,
  },
  {
    id: 'brand_mithai_express',
    orgId: 'org_mithai_co_02',
    name: 'Mithai Express',
    code: 'MEX',
    status: 'ACTIVE',
    createdAtIso: BASELINE_EPOCH,
  },
];

export const OUTLETS_FIXTURE = [
  {
    id: 'outlet_bareilly_civil_lines',
    orgId: 'org_gangaram_01',
    brandId: 'brand_gangaram_sweets',
    name: 'Bareilly Civil Lines Flagship',
    code: 'OUT-BLY-01',
    address: {
      street: '124 Civil Lines Road',
      city: 'Bareilly',
      postalCode: '243001',
      latitude: 28.367,
      longitude: 79.4304,
      formattedAddress: '124 Civil Lines Road, Bareilly, UP 243001',
    },
    status: 'ACTIVE',
    createdAtIso: BASELINE_EPOCH,
  },
  {
    id: 'outlet_bareilly_station_rd',
    orgId: 'org_gangaram_01',
    brandId: 'brand_gangaram_bakery',
    name: 'Bareilly Junction Kiosk',
    code: 'OUT-BLY-02',
    address: {
      street: 'Shop 4, Railway Station Road',
      city: 'Bareilly',
      postalCode: '243001',
      latitude: 28.355,
      longitude: 79.418,
      formattedAddress: 'Shop 4, Railway Station Road, Bareilly, UP 243001',
    },
    status: 'ACTIVE',
    createdAtIso: BASELINE_EPOCH,
  },
  {
    id: 'outlet_lucknow_hazratganj',
    orgId: 'org_mithai_co_02',
    brandId: 'brand_mithai_express',
    name: 'Lucknow Hazratganj Outlet',
    code: 'OUT-LKO-01',
    address: {
      street: '45 MG Marg, Hazratganj',
      city: 'Lucknow',
      postalCode: '226001',
      latitude: 26.8467,
      longitude: 80.9462,
      formattedAddress: '45 MG Marg, Hazratganj, Lucknow, UP 226001',
    },
    status: 'ACTIVE',
    createdAtIso: BASELINE_EPOCH,
  },
];
